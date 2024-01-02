const express = require("express");
const mongoose = require("mongoose");
const User = require("./User");
const cors = require("cors");
const app = express();
const { fetchStockDataAndCalculateSMA } = require("./SimpleMovingAverage"); // Importing the function
const { fetchStockDataAndCalculateEMA } = require("./ExponentialMovingAverage"); // Import the EMA function
const { fetchStockDataAndCalculateRSI } = require("./RelativeStrengthIndex");
const {
  fetchStockDataAndCalculateBollingerBands,
} = require("./BollingerBands");
const { fetchStockDataAndCalculateMACD } = require("./MACD");
const {
  fetchStockDataAndCalculateStochastic,
} = require("./StochasticOscillator");
const {
  fetchStockDataAndCalculateFibonacci,
} = require("./FibonacciRetracement");

mongoose.connect("mongodb://localhost:27017/stockanalyzer", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
app.use(cors());
app.use(express.json());

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  favorites: [String], // Array of stock symbols
});

// Endpoint to add a stock to favorites
app.post("/user/:userId/favorites", async (req, res) => {
  const { userId } = req.params;
  const { stockSymbol } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send("User not found");
    }
    // Initialize favorites if undefined
    if (!user.favorites) {
      user.favorites = [];
    }

    if (!user.favorites.includes(stockSymbol)) {
      user.favorites.push(stockSymbol);
      await user.save();
    }
    res.status(200).send("Stock added to favorites");
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).send("Error processing request");
  }
});

app.delete("/user/:userId/favorites", async (req, res) => {
  const { userId } = req.params;
  const { stockSymbol } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send("User not found");
    }
    user.favorites = user.favorites.filter(symbol => symbol !== stockSymbol);
    await user.save();
    res.status(200).send("Stock removed from favorites");
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).send("Error processing request");
  }
});

// Endpoint to get a user's favorite stocks
app.get("/user/:userId/favorites", async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    res.json(user.favorites);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).send("Error processing request");
  }
});

app.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = new User({ email, password });
    await user.save();
    res.status(200).send("User registered successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).send("Invalid email or password");
    }
    res.status(200).json({ message: "Login successful", userId: user._id }); // Send back the user ID
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.post("/reset-password", async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).send("Email and new password are required");
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send("User not found");
    }

    user.password = newPassword;
    await user.save();

    res.status(200).send("Password updated successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

app.get("/sma/:stockSymbol/:period", async (req, res) => {
  const { stockSymbol, period } = req.params;
  const apiKey = "pk_302c7bd6ee464d738f364961b88569ee"; // Your API key

  try {
    const result = await fetchStockDataAndCalculateSMA(
      stockSymbol,
      period,
      apiKey
    );
    res.json(result);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).send("Error processing request");
  }
});

app.get("/ema/:stockSymbol/:period", async (req, res) => {
  const { stockSymbol, period } = req.params;
  const apiKey = "pk_302c7bd6ee464d738f364961b88569ee"; // Your API key

  try {
    const result = await fetchStockDataAndCalculateEMA(
      stockSymbol,
      period,
      apiKey
    );
    res.json(result);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).send("Error processing request");
  }
});

app.get("/rsi/:stockSymbol/:period", async (req, res) => {
  const { stockSymbol, period } = req.params;
  const apiKey = "pk_302c7bd6ee464d738f364961b88569ee";

  try {
    const result = await fetchStockDataAndCalculateRSI(
      stockSymbol,
      period,
      apiKey
    );
    res.json(result);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).send("Error processing request");
  }
});

app.get("/bollinger-bands/:stockSymbol/:period", async (req, res) => {
  const { stockSymbol, period } = req.params;
  const apiKey = "pk_302c7bd6ee464d738f364961b88569ee"; // Your API key

  try {
    const result = await fetchStockDataAndCalculateBollingerBands(
      stockSymbol,
      period,
      apiKey
    );
    res.json(result);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).send("Error processing request");
  }
});

app.get("/macd/:stockSymbol/:period", async (req, res) => {
  const { stockSymbol, period } = req.params;
  const apiKey = "pk_302c7bd6ee464d738f364961b88569ee"; // Your API key

  try {
    const result = await fetchStockDataAndCalculateMACD(
      stockSymbol,
      period,
      apiKey
    );
    res.json(result);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).send("Error processing request");
  }
});

app.get("/stochastic/:stockSymbol/:period", async (req, res) => {
  const { stockSymbol, period } = req.params;
  const apiKey = "pk_302c7bd6ee464d738f364961b88569ee"; // Your API key

  try {
    const stochastic = await fetchStockDataAndCalculateStochastic(
      stockSymbol,
      period,
      apiKey
    );
    res.json(stochastic);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).send("Error processing request");
  }
});

app.get("/fibonacci/:stockSymbol/:period", async (req, res) => {
  const { stockSymbol, period } = req.params;
  const apiKey = "pk_302c7bd6ee464d738f364961b88569ee"; // Your API key

  try {
    const fibonacciLevels = await fetchStockDataAndCalculateFibonacci(
      stockSymbol,
      period,
      apiKey
    );
    res.json(fibonacciLevels);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).send("Error processing request");
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Server running on port ${port}`));
