const express       = require('express');
const router        = express.Router();
const validateAuth  = require('../middleware/validate-auth');
const { getAllCustomers, getCustomer, createNewCustomer, updateCustomer, deleteCustomer } = require('../controllers/customers'); 

// GET INDEX
router.get('/', validateAuth, getAllCustomers);

// GET SHOW
router.get('/:id', validateAuth, getCustomer);

// CREATE
router.post('/', validateAuth, createNewCustomer);

// DELETE
router.delete('/:id', validateAuth, deleteCustomer);

// UPDATE
router.put('/:id', validateAuth, updateCustomer);

module.exports = router;