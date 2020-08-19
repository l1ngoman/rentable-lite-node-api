const express       = require('express');
const router        = express.Router();
const validateAuth  = require('../middleware/validate-auth');
const Customers     = require('../controllers/customers'); 

// GET INDEX
router.get('/', validateAuth, Customers.getAllCustomers);

// GET SHOW
router.get('/:id', Customers.getCustomer);
// router.get('/:id', validateAuth, Customers.getCustomer);

// CREATE
router.post('/', Customers.createNewCustomer);
// router.post('/', validateAuth, Customers.createNewCustomer);

// DELETE
router.delete('/:id', Customers.deleteCustomer);
// router.delete('/:id', validateAuth, Customers.deleteCustomer);

// UPDATE
router.put('/:id', Customers.updateCustomer);
// router.put('/:id', validateAuth, Customers.updateCustomer);

module.exports = router;