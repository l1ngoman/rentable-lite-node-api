const express   = require('express');
const router    = express.Router();
const validateAuth = require('../middleware/validate-auth');
const { getAllCustomers, getCustomer, createNewCustomer, updateCustomer, deleteCustomer } = require('../controllers/customers'); 

// GET INDEX
router.get('/', validateAuth, getAllCustomers);

// GET SHOW
router.get('/:id', getCustomer);

// CREATE
router.post('/', createNewCustomer);

// DELETE
router.delete('/:id', deleteCustomer);

// UPDATE
router.put('/:id', updateCustomer);

module.exports = router;