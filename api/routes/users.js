const express   = require('express');
const router    = express.Router();
const { getAllUsers, getUser, createNewUser, updateUser, deleteUser } = require('../models/user'); 

// GET INDEX
router.get('/', getAllUsers);

// GET SHOW
router.get('/:id', getUser);

// CREATE
router.post('/', createNewUser);

// UPDATE
router.put('/:id', updateUser);

// DELETE
router.delete('/:id', deleteUser);

module.exports = router;