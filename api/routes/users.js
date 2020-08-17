const express       = require('express');
const router        = express.Router();
const validateAuth  = require('../middleware/validate-auth');
const Users         = require('../controllers/users'); 

// SIGNUP '/user/signup'
router.post('/signup', Users.createNewUser);

// LOGIN '/user/login'
router.get('/login', Users.logInUser);

// GET '/user/3'
router.get('/:id', validateAuth, Users.getUser);

// CHANGE PASSWORD
router.patch('/:id', validateAuth, Users.changePassword);

// UPDATE '/user/2'
router.put('/:id', validateAuth, Users.updateUser);

// DELETE '/user/4'
router.delete('/:id', validateAuth, Users.deleteUser);

module.exports = router;