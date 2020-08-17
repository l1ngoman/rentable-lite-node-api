const express       = require('express');
const router        = express.Router();
const validateAuth  = require('../middleware/validate-auth');
const { getAllItems, getItem, createNewItem, updateItem, deleteItem } = require('../controllers/items'); 

// GET INDEX
router.get('/', validateAuth, getAllItems);

// GET SHOW
router.get('/:id', validateAuth, getItem);

// CREATE
router.post('/', validateAuth, createNewItem);

// DELETE
router.delete('/:id', validateAuth, deleteItem);

// UPDATE
router.put('/:id', validateAuth, updateItem);

module.exports = router;