const express       = require('express');
const router        = express.Router();
const validateAuth  = require('../middleware/validate-auth');
const Items         = require('../controllers/items'); 

// GET INDEX
router.get('/', Items.getAllItems);

// GET SHOW
router.get('/:id', Items.getItem);
// router.get('/:id', validateAuth, Items.getItem);

// GET ITEM RENTALS
router.get('/:id/rentals', Items.getItemRentals);

// CREATE
router.post('/', Items.createNewItem);
// router.post('/', validateAuth, Items.createNewItem);

// DELETE
router.delete('/:id', Items.deleteItem);
// router.delete('/:id', validateAuth, Items.deleteItem);

// UPDATE
router.put('/:id', Items.updateItem);
// router.put('/:id', validateAuth, Items.updateItem);

module.exports = router;