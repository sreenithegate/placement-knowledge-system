const mongoose = require('mongoose');

const knowledgeCategories = [
  'Programming',
  'Data Structures & Algorithms',
  'DBMS',
  'Operating Systems',
  'Computer Networks',
  'Software Engineering',
  'Aptitude',
  'Reasoning',
  'Verbal Ability',
  'Technical Interview',
  'HR Interview',
  'Resume Preparation',
  'Placement Experiences',
  'Projects',
  'Best Practices',
  'Other',
];

const fileSchema = new mongoose.Schema(
  {
    originalName: {
      type: String,
      trim: true,
    },
    fileUrl: {
      type: String,
      trim: true,
    },
    publicId: {
      type: String,
      trim: true,
    },
    fileType: {
      type: String,
      trim: true,
    },
    fileSize: {
      type: Number,
      min: [0, 'File size cannot be negative.'],
    },
    resourceType: {
      type: String,
      enum: ['image', 'raw'],
    },
  },
  { _id: false },
);

const knowledgeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required.'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters long.'],
      maxlength: [160, 'Title cannot exceed 160 characters.'],
    },
    description: {
      type: String,
      required: [true, 'Description is required.'],
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters.'],
    },
    content: {
      type: String,
      required: [true, 'Content is required.'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required.'],
      enum: {
        values: knowledgeCategories,
        message: 'Select a valid knowledge category.',
      },
      index: true,
    },
    tags: {
      type: [
        {
          type: String,
          trim: true,
          lowercase: true,
          maxlength: [40, 'A tag cannot exceed 40 characters.'],
        },
      ],
      default: [],
      index: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required.'],
      index: true,
    },
    views: {
      type: Number,
      default: 0,
      min: [0, 'Views cannot be negative.'],
      index: true,
    },
    file: {
      type: fileSchema,
      default: undefined,
    },
  },
  {
    timestamps: true,
  },
);

knowledgeSchema.index({
  title: 'text',
  description: 'text',
  content: 'text',
  tags: 'text',
});
knowledgeSchema.index({ category: 1, createdAt: -1 });

module.exports = mongoose.model('Knowledge', knowledgeSchema);
module.exports.KNOWLEDGE_CATEGORIES = knowledgeCategories;
