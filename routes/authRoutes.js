const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/authMiddleware");


// ================= SIGNUP =================
router.post("/signup", async (req, res) => {

  try {

    const { email, password } = req.body;

    // ✅ Validate fields
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    // ✅ Prevent duplicate users
    const existing = await User.findOne({ email });

    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    // ✅ Hash password
    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashed
    });

    // ✅ Never send password back
    const safeUser = {
      _id: user._id,
      email: user.email,
      createdAt: user.createdAt
    };

    res.status(201).json(safeUser);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }

});


// ================= LOGIN =================
router.post("/login", async (req, res) => {
  try {

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Wrong password" });
    }

    // ✅ Generate JWT
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.json({ token });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }

});


// ================= GET ALL USERS =================
// ⚠️ Protected route
router.get("/users", auth, async (req, res) => {

  try {

    const users = await User
      .find()
      .select("-password") // hide password
      .sort({ createdAt: -1 });

    res.json(users);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }

});


// ================= GET LOGGED-IN USER =================
router.get("/me", auth, async (req, res) => {

  try {

    const user = await User
      .findById(req.user.id)
      .select("-password");

    res.json(user);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }

});


module.exports = router;
