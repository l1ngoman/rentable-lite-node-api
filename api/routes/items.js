const express   = require('express');
const router    = express.Router();
const Item      = require('../models/item'); 

// GET INDEX
router.get('/', Item.getAllItems);

// GET SHOW
router.get('/:id', Item.getItem);

// CREATE
router.post('/', Item.createNewItem);

// DELETE
router.delete('/:id', Item.deleteItem);

// UPDATE
router.put('/:id', Item.updateItem);

module.exports = router;