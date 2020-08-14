const express   = require('express');
const router    = express.Router();
const { getAllUsers, getUser, createNewUser, updateUser, deleteUser } = require('../controllers/users'); 

// signup
router.post('/signup', createNewUser);

// UPDATE
router.put('/:id', updateUser);

// DELETE
router.delete('/:id', deleteUser);

module.exports = router;