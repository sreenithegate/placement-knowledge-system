const mongoose = require('mongoose');
const Knowledge = require('../models/Knowledge');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinaryUpload');

const articleFields = ['title', 'description', 'content', 'category', 'tags'];

const parsePositiveQueryInteger = (value, defaultValue, maximum) => {
  if (value === undefined) {
    return defaultValue;
  }

  if (typeof value !== 'string' || !/^\d+$/.test(value)) {
    return null;
  }

  const parsed = Number(value);
  return parsed >= 1 && parsed <= maximum ? parsed : null;
};

const normalizeTags = (tags) => {
  if (tags === undefined) {
    return undefined;
  }

  if (typeof tags === 'string') {
    const value = tags.trim();

    if (!value) {
      return [];
    }

    try {
      tags = JSON.parse(value);
    } catch {
      tags = value.split(',');
    }
  }

  if (!Array.isArray(tags) || tags.some((tag) => typeof tag !== 'string')) {
    return null;
  }

  return [...new Set(tags.map((tag) => tag.trim()).filter(Boolean))];
};

const hasValidArticleText = ({ title, description, content, category }) =>
  [title, description, content, category].every(
    (value) => typeof value === 'string' && value.trim(),
  );

const canModifyKnowledge = (knowledge, user) =>
  user.role === 'admin' || knowledge.author.equals(user._id);

const sendDatabaseError = (res, error, action) => {
  if (error.name === 'ValidationError') {
    return res.status(400).json({ success: false, message: error.message });
  }

  console.error(`Unable to ${action} knowledge:`, error.message);
  return res.status(500).json({
    success: false,
    message: `Unable to ${action} knowledge. Please try again later.`,
  });
};

const cleanupUploadedFile = async (file) => {
  if (!file) {
    return;
  }

  try {
    await deleteFromCloudinary(file);
  } catch (error) {
    console.error('Unable to clean up Cloudinary file:', error.message);
  }
};

const createKnowledge = async (req, res) => {
  let uploadedFile;

  try {
    const { title, description, content, category } = req.body;
    const tags = normalizeTags(req.body.tags);

    if (!hasValidArticleText({ title, description, content, category })) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, content, and category are required.',
      });
    }

    if (tags === null) {
      return res.status(400).json({
        success: false,
        message: 'Tags must be an array of text values.',
      });
    }

    if (req.file) {
      uploadedFile = await uploadToCloudinary(req.file);
    }

    const knowledge = await Knowledge.create({
      title: title.trim(),
      description: description.trim(),
      content: content.trim(),
      category: category.trim(),
      tags: tags || [],
      author: req.user._id,
      file: uploadedFile,
    });

    await knowledge.populate('author', 'name email role');

    return res.status(201).json({
      success: true,
      message: 'Knowledge article created successfully.',
      knowledge,
    });
  } catch (error) {
    await cleanupUploadedFile(uploadedFile);
    return sendDatabaseError(res, error, 'create');
  }
};

const getKnowledgeList = async (req, res) => {
  try {
    const { search, category, tag, sort = 'newest' } = req.query;
    const page = parsePositiveQueryInteger(req.query.page, 1, 10000);
    const limit = parsePositiveQueryInteger(req.query.limit, 10, 50);

    if (page === null) {
      return res.status(400).json({
        success: false,
        message: 'Page must be a whole number between 1 and 10000.',
      });
    }

    if (limit === null) {
      return res.status(400).json({
        success: false,
        message: 'Limit must be a whole number between 1 and 50.',
      });
    }

    if (typeof sort !== 'string' || !['newest', 'popular'].includes(sort)) {
      return res.status(400).json({
        success: false,
        message: 'Sort must be either newest or popular.',
      });
    }

    const filters = {};

    if (search !== undefined) {
      if (typeof search !== 'string') {
        return res.status(400).json({ success: false, message: 'Search must be text.' });
      }

      if (search.trim()) {
        filters.$text = { $search: search.trim() };
      }
    }

    if (category !== undefined) {
      if (typeof category !== 'string') {
        return res.status(400).json({ success: false, message: 'Category must be text.' });
      }

      if (category.trim()) {
        filters.category = category.trim();
      }
    }

    if (tag !== undefined) {
      if (typeof tag !== 'string') {
        return res.status(400).json({ success: false, message: 'Tag must be text.' });
      }

      if (tag.trim()) {
        filters.tags = tag.trim().toLowerCase();
      }
    }

    const sortOptions = {
      newest: { createdAt: -1 },
      popular: { views: -1, createdAt: -1 },
    };
    const totalArticles = await Knowledge.countDocuments(filters);
    const articles = await Knowledge.find(filters)
      .populate('author', 'name email role')
      .sort(sortOptions[sort])
      .skip((page - 1) * limit)
      .limit(limit);

    return res.status(200).json({
      success: true,
      articles,
      pagination: {
        page,
        limit,
        totalArticles,
        totalPages: Math.ceil(totalArticles / limit),
      },
    });
  } catch (error) {
    return sendDatabaseError(res, error, 'retrieve knowledge articles');
  }
};

const getKnowledgeById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid knowledge ID.' });
    }

    const knowledge = await Knowledge.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { returnDocument: 'after' }, // Fixed Mongoose warning here
    ).populate('author', 'name email role');

    if (!knowledge) {
      return res.status(404).json({
        success: false,
        message: 'Knowledge article not found.',
      });
    }

    return res.status(200).json({ success: true, knowledge });
  } catch (error) {
    return sendDatabaseError(res, error, 'retrieve');
  }
};

const updateKnowledge = async (req, res) => {
  let uploadedFile;

  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid knowledge ID.' });
    }

    const updates = {};

    for (const field of articleFields) {
      if (req.body[field] !== undefined && field !== 'tags') {
        updates[field] = req.body[field];
      }
    }

    if (req.body.tags !== undefined) {
      const tags = normalizeTags(req.body.tags);

      if (tags === null) {
        return res.status(400).json({
          success: false,
          message: 'Tags must be an array of text values.',
        });
      }

      updates.tags = tags;
    }

    if (Object.keys(updates).length === 0 && !req.file) {
      return res.status(400).json({
        success: false,
        message: 'Provide at least one article field or a replacement file.',
      });
    }

    const knowledge = await Knowledge.findById(req.params.id);

    if (!knowledge) {
      return res.status(404).json({
        success: false,
        message: 'Knowledge article not found.',
      });
    }

    if (!canModifyKnowledge(knowledge, req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Only the article author or an admin can update this article.',
      });
    }

    const previousFile = knowledge.file ? knowledge.file.toObject() : undefined;

    if (req.file) {
      uploadedFile = await uploadToCloudinary(req.file);
      updates.file = uploadedFile;
    }

    Object.assign(knowledge, updates);
    await knowledge.save();
    await knowledge.populate('author', 'name email role');

    if (uploadedFile) {
      await cleanupUploadedFile(previousFile);
    }

    return res.status(200).json({
      success: true,
      message: 'Knowledge article updated successfully.',
      knowledge,
    });
  } catch (error) {
    await cleanupUploadedFile(uploadedFile);
    return sendDatabaseError(res, error, 'update');
  }
};

const deleteKnowledge = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid knowledge ID.' });
    }

    const knowledge = await Knowledge.findById(req.params.id);

    if (!knowledge) {
      return res.status(404).json({
        success: false,
        message: 'Knowledge article not found.',
      });
    }

    if (!canModifyKnowledge(knowledge, req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Only the article author or an admin can delete this article.',
      });
    }

    const attachedFile = knowledge.file ? knowledge.file.toObject() : undefined;
    await knowledge.deleteOne();
    await cleanupUploadedFile(attachedFile);

    return res.status(200).json({
      success: true,
      message: 'Knowledge article deleted successfully.',
    });
  } catch (error) {
    return sendDatabaseError(res, error, 'delete');
  }
};

module.exports = {
  createKnowledge,
  getKnowledgeList,
  getKnowledgeById,
  updateKnowledge,
  deleteKnowledge,
};