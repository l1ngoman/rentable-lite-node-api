const express       = require('express');
const router        = express.Router();
const validateAuth  = require('../middleware/validate-auth');
const { getAllPickups, getPickup, createNewPickup, updatePickup, deletePickup } = require('../controllers/pickups'); 

// GET INDEX
router.get('/', validateAuth, getAllPickups);

// GET SHOW
router.get('/:id', validateAuth, getPickup);

// CREATE
router.post('/', validateAuth, createNewPickup);

// DELETE
router.delete('/:id', validateAuth, deletePickup);

// UPDATE
router.put('/:id', validateAuth, updatePickup);

module.exports = router;