const express       = require('express');
const router        = express.Router();
const validateAuth  = require('../middleware/validate-auth');
const { getAllRentals, getRental, createNewRental, updateRental, deleteRental } = require('../controllers/rentals'); 

// GET INDEX
router.get('/', validateAuth, getAllRentals);

// GET SHOW
router.get('/:id', validateAuth, getRental);

// CREATE
router.post('/', validateAuth, createNewRental);

// DELETE
router.delete('/:id', validateAuth, deleteRental);

// UPDATE
router.put('/:id', validateAuth, updateRental);

module.exports = router;