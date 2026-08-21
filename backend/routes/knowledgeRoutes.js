const express = require('express');
const {
  createKnowledge,
  getKnowledgeList,
  getKnowledgeById,
  updateKnowledge,
  deleteKnowledge,
} = require('../controllers/knowledgeController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.post('/', protect, upload.single('file'), createKnowledge);
router.get('/', getKnowledgeList);
router.get('/:id', getKnowledgeById);
router.put('/:id', protect, upload.single('file'), updateKnowledge);
router.delete('/:id', protect, deleteKnowledge);

module.exports = router;
