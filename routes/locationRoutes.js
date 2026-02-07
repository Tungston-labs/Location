const router = require("express").Router();
const Location = require("../models/Location");
const auth = require("../middleware/authMiddleware");

// Save location

router.post("/", auth, async (req, res) => {

  console.log("FULL BODY:", JSON.stringify(req.body, null, 2));

  // Handle various payload structures:
  // 1. { latitude: 1, longitude: 2 }
  // 2. { coords: { latitude: 1, longitude: 2 } }
  // 3. { location: { coords: { ... } } }
  // 4. { location: { latitude: 1, ... } }

  const root = req.body.location || req.body;
  const coords = root.coords || root;

  const latitude = coords.latitude;
  const longitude = coords.longitude;

  // Safety check
  if (!latitude || !longitude) {
    console.log("Missing coordinates");
    return res.status(400).send("Coordinates missing");
  }

  try {
    console.log("Attempting to save for User ID:", req.user.id);

    const newLocation = await Location.create({
      userId: req.user.id,
      latitude,
      longitude
    });

    console.log("✅✅✅ DATABASE WRITE SUCCESS ✅✅✅");
    console.log("Saved Document ID:", newLocation._id);
    console.log("Database URI:", process.env.MONGO_URI);

    res.sendStatus(200);
  } catch (error) {
    console.error("Error saving location:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get user's location history
router.get("/", auth, async (req, res) => {
  try {
    const locations = await Location.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(locations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;
