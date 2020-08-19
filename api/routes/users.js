const express       = require('express');
const router        = express.Router();
const validateAuth  = require('../middleware/validate-auth');
const Users         = require('../controllers/users'); 

// SIGNUP '/users'
router.post('/', Users.createNewUser);

// LOGIN '/users/login'
router.post('/login', Users.logInUser);

// GET '/users/3'
router.get('/:id', validateAuth, Users.getUser);

// CHANGE PASSWORD '/users/3'
router.patch('/:id', validateAuth, Users.changePassword);

// UPDATE '/users/2'
router.put('/:id', validateAuth, Users.updateUser);

// DELETE '/users/4'
router.delete('/:id', validateAuth, Users.deleteUser);

module.exports = router;