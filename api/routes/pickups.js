const express   = require('express');
const router    = express.Router();
const { getAllPickups, getPickup, createNewPickup, updatePickup, deletePickup } = require('../models/pickup'); 

// GET INDEX
router.get('/', getAllPickups);

// GET SHOW
router.get('/:id', getPickup);

// CREATE
router.post('/', createNewPickup);

// DELETE
router.delete('/:id', deletePickup);

// UPDATE
router.put('/:id', updatePickup);

module.exports = router;