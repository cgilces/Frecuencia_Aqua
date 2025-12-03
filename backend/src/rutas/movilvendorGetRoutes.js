const express = require('express');
const router = express.Router();
const {
  loginMovilVendor,
  getRoutes,
  getRouteDetails,
  getUsersInRoutes
} = require('../servicios/movilvendorServicio');

// ===========================
// GET routes
// ===========================
router.get('/routes', async (req, res) => {
  try {
    const sessionId = await loginMovilVendor();
    const data = await getRoutes(sessionId, 1);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===========================
// GET route_details
// ===========================
router.get('/route-details', async (req, res) => {
  try {
    const sessionId = await loginMovilVendor();
    const data = await getRouteDetails(sessionId, 1);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===========================
// GET users_in_routes
// ===========================
router.get('/users-in-routes', async (req, res) => {
  try {
    const sessionId = await loginMovilVendor();
    const data = await getUsersInRoutes(sessionId, 1);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
