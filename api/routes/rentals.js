const express       = require('express');
const router        = express.Router();
const validateAuth  = require('../middleware/validate-auth');
const Rentals       = require('../controllers/rentals'); 

// GET INDEX
router.get('/', validateAuth, Rentals.getAllRentals);

// GET SHOW
router.get('/:id', validateAuth, Rentals.getRental);

// CREATE
router.post('/', validateAuth, Rentals.createNewRental);

// DELETE
router.delete('/:id', validateAuth, Rentals.deleteRental);

// UPDATE
router.put('/:id', validateAuth, Rentals.updateRental);

module.exports = router;