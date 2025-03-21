// models/User.js
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    lastName: {
      type: String,
      default: ""
    },
    nif: {
      type: String,
      default: ""
    },
    age: {
      type: Number,
    },
    email: {
      type: String,
      unique: true,
    },
    password: {
      type: String,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    },
    // Verificación de email:
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    emailVerificationCode: {
      type: String,
      default: null
    },
    emailVerificationAttempts: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      default: "pending"
    },
    // Datos de la compañía:
    company: {
      companyName: { type: String, default: "" },
      cif: { type: String, default: "" },
      address: { type: String, default: "" }
    },
    // Logo del usuario:
    logo: {
      type: String,
      default: ""
    },
    // Campo para soft delete:
    deleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("User", UserSchema);
