const express   = require('express');
const router    = express.Router();
const UserModel = require('../models/user'); 
const User      = new UserModel();

// GET INDEX
router.get('/', User.getAllUsers);

// GET SHOW
router.get('/:id', User.getUser);

// CREATE
router.post('/', User.createNewUser);

// DELETE
router.delete('/:id', User.deleteUser);

// UPDATE
router.put('/:id', User.updateUser);

module.exports = router;