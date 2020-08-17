const express       = require('express');
const router        = express.Router();
const validateAuth  = require('../middleware/validate-auth');
const Items         = require('../controllers/items'); 

// GET INDEX
router.get('/', validateAuth, Items.getAllItems);

// GET SHOW
router.get('/:id', validateAuth, Items.getItem);

// CREATE
router.post('/', validateAuth, Items.createNewItem);

// DELETE
router.delete('/:id', validateAuth, Items.deleteItem);

// UPDATE
router.put('/:id', validateAuth, Items.updateItem);

module.exports = router;