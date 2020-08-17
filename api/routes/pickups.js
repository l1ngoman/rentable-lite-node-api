const express       = require('express');
const router        = express.Router();
const validateAuth  = require('../middleware/validate-auth');
const Pickups       = require('../controllers/pickups'); 

// GET INDEX
router.get('/', validateAuth, Pickups.getAllPickups);

// GET SHOW
router.get('/:id', validateAuth, Pickups.getPickup);

// CREATE
router.post('/', validateAuth, Pickups.createNewPickup);

// DELETE
router.delete('/:id', validateAuth, Pickups.deletePickup);

// UPDATE
router.put('/:id', validateAuth, Pickups.updatePickup);

module.exports = router;