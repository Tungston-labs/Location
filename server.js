require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/location", require("./routes/locationRoutes"));
// app.get("/api/welcome", (req,res)=>{
//   res.sendFile(Path2D.join)
// });

app.listen(process.env.PORT, () =>
  console.log("🚀 Server running on port", process.env.PORT)
);
