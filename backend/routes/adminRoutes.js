const express = require('express');
const {
  getAdminOverview,
  listUsers,
  updateUserRole,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect, authorize('admin'));
router.get('/overview', getAdminOverview);
router.get('/users', listUsers);
router.patch('/users/:id/role', updateUserRole);

module.exports = router;
