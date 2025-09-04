// app.js
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const path = require("path");
const axios = require("axios");

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(
  session({
    secret: "supersecretkey", // ⚠️ in real projects use process.env.SESSION_SECRET
    resave: false,
    saveUninitialized: true,
  })
);

// MongoDB Connection
mongoose
  .connect("mongodb://127.0.0.1:27017/internship", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
});
const User = mongoose.model("User", userSchema);

// -------------------- ROUTES -------------------- //

// Home → redirect to signup
app.get("/", (req, res) => {
  res.redirect("/signup");
});

// Signup Page
app.get("/signup", (req, res) => {
  res.render("signup", { error: null });
});

// Signup (POST)
app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();
    res.redirect("/login");
  } catch (err) {
    res.render("signup", { error: "❌ Email already exists" });
  }
});

// Login Page
app.get("/login", (req, res) => {
  res.render("login", { error: null });
});

// Login (POST)
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.render("login", { error: "❌ Email not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.render("login", { error: "❌ Incorrect password" });
    }

    req.session.user = user;
    res.redirect("/dashboard");
  } catch (err) {
    res.render("login", { error: "❌ Something went wrong" });
  }
});

// Dashboard (Protected)
app.get("/dashboard", (req, res) => {
  if (!req.session.user) return res.redirect("/login");
  res.render("dashboard", { user: req.session.user });
});

// Weather Page
app.get("/weather", (req, res) => {
  if (!req.session.user) return res.redirect("/login");
  res.render("weather", { weather: null, error: null });
});

// Weather (POST)
app.post("/weather", async (req, res) => {
  if (!req.session.user) return res.redirect("/login");
  const { city } = req.body;

  // 🔑 Replace with your OpenWeather API key
  const apiKey = "6809f030f1ebaba628523f682ef29f38";

  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`
    );

    const weatherData = {
      city: response.data.name,
      temperature: response.data.main.temp,
      condition: response.data.weather[0].description,
    };

    res.render("weather", { weather: weatherData, error: null });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.render("weather", {
      weather: null,
      error: "❌ City not found or API key invalid",
    });
  }
});

// Logout
app.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/login"));
});

// Server Start
const PORT = 3000;
app.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
);
