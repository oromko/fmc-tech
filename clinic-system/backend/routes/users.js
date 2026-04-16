const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');

// Get all users (Admin only)
router.get('/', authenticate, authorize(['admin']), userController.getAllUsers);

// Get user by ID
router.get('/:id', authenticate, userController.getUserById);

// Create new user
router.post('/', authenticate, authorize(['admin']), userController.createUser);

// Update user
router.put('/:id', authenticate, userController.updateUser);

// Delete user (Admin only)
router.delete('/:id', authenticate, authorize(['admin']), userController.deleteUser);

// Get user profile
router.get('/profile/me', authenticate, userController.getProfile);

// Update user profile
router.put('/profile/me', authenticate, userController.updateProfile);

module.exports = router;
