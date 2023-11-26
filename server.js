require("dotenv").config();
const express = require("express");
const http = require("http");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const app = express();
const mainLogic = require("./routes/mainLogic");
const cloudPosting = require("./routes/cloudPosting");
const rateLimit = require("express-rate-limit");
const newLogic = require("./routes/newLogic");

// Create a rate limiter middleware
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // limit each IP to 100 requests per windowMs
// });

// app.use(limiter);
app.use(
  cors({
    origin: [
      "http://localhost:5500",
      "http://127.0.0.1:5500",
      "https://simple-insta-download.netlify.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

multer({
  limits: { fieldSize: 2 * 1024 * 1024 },
});
app.use(multer().any());

app.get("/", (req, res) => {
  res.send("welcome to instagram downloader backend system...");
});

app.use("/api", mainLogic);
app.use("/api", cloudPosting);
app.use("/api", newLogic);

app.listen(process.env.PORT || 8088, () => {
  console.log("app is listening");
});
