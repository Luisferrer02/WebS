const mongoose = require("mongoose");
const UserScheme = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    age: {
      type: Number,
    },
    email: {
      type: String,
      unique: true,
    },
    password: {
      type: String, // TODO Guardaremos el hash
    },
    role: {
      type: String,
      enum: ["user", "admin"], // es el enum de SQL
      default: "user"
    },
  },
  {
    timestamps: true, // TODO createdAt, updatedAt
    versionKey: false,
  }
);
module.exports = mongoose.model("users", UserScheme); // “users” es el nombre de la colección en mongoDB (o de la tabla en SQL)
