const express = require("express");
const cors = require("cors");
require("dotenv").config();
const dbConnect = require('./config/mongo');

const app = express();

// Connect to the database
dbConnect();

// Use CORS to avoid Cross-Domain errors
app.use(cors());
app.use(express.json());
app.use("/api", require("./routes"))
app.use("/api/tracks", require("./routes"))
app.use(express.static("storage"));

// Set the port from environment variables or default to 3000
const port = process.env.PORT || 3000;

// Start the server
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
