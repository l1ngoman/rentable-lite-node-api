const express   = require('express');
const router    = express.Router();
const Customer  = require('../models/customer'); 

// GET INDEX
router.get('/', Customer.getAllCustomers);

// GET SHOW
router.get('/:id', Customer.getCustomer);

// CREATE
router.post('/', Customer.createNewCustomer);

// DELETE
router.delete('/:id', Customer.deleteCustomer);

// UPDATE
router.put('/:id', Customer.updateCustomer);

module.exports = router;