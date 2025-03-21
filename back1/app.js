const express = require("express");
const cors = require("cors");
require("dotenv").config();
const dbConnect = require('./config/mongo');
const { sequelize, dbConnectMySql } = require("./config/mysql")
const app = express();

// Connect to the database
if (process.env.ENGINE_DB !== 'mysql'){
    dbConnect()
    // Crea las colecciones por defecto si no existieran
    }else{
    dbConnectMySql()
    sequelize.sync() // Crea las tablas en la base de datos si no existieran
    }

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
