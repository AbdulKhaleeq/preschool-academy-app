const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { getUsers, createUser, updateUser, deleteUser, setUserActiveStatus } = require('../controllers/usersController');

const router = express.Router();

router.get('/', authenticate, authorize('admin'), getUsers);
router.post('/', authenticate, authorize('admin'), createUser);
router.put('/:id', authenticate, authorize('admin'), updateUser);
router.patch('/:id/active', authenticate, authorize('admin'), setUserActiveStatus);
router.delete('/:id', authenticate, authorize('admin'), deleteUser);

module.exports = router;


