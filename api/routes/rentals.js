const express   = require('express');
const router    = express.Router();
const { getAllRentals, getRental, createNewRental, updateRental, deleteRental } = require('../models/rental'); 

// GET INDEX
router.get('/', getAllRentals);

// GET SHOW
router.get('/:id', getRental);

// CREATE
router.post('/', createNewRental);

// DELETE
router.delete('/:id', deleteRental);

// UPDATE
router.put('/:id', updateRental);

module.exports = router;