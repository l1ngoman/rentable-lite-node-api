const express   = require('express');
const router    = express.Router();
const { createNewUser, logInUser, updateUser, deleteUser } = require('../controllers/users'); 

// SIGNUP '/user/signup'
router.post('/signup', createNewUser);

// LOGIN '/user/login'
router.post('/login', logInUser);

// UPDATE '/user/2'
router.put('/:id', updateUser);

// DELETE '/user/4'
router.delete('/:id', deleteUser);

module.exports = router;