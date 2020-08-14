const express   = require('express');
const router    = express.Router();
const { getAllCustomers, getCustomer, createNewCustomer, updateCustomer, deleteCustomer } = require('../controllers/customers'); 

// GET INDEX
router.get('/', getAllCustomers);

// GET SHOW
router.get('/:id', getCustomer);

// CREATE
router.post('/', createNewCustomer);

// DELETE
router.delete('/:id', deleteCustomer);

// UPDATE
router.put('/:id', updateCustomer);

module.exports = router;