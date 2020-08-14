const express   = require('express');
const router    = express.Router();
const { getAllItems, getItem, createNewItem, updateItem, deleteItem } = require('../controllers/items'); 

// GET INDEX
router.get('/', getAllItems);

// GET SHOW
router.get('/:id', getItem);

// CREATE
router.post('/', createNewItem);

// DELETE
router.delete('/:id', deleteItem);

// UPDATE
router.put('/:id', updateItem);

module.exports = router;