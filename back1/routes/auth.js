
// Pruébalo con una petición POST a http://localhost:3000/api/auth/register con {name, age, email, password}
// Después copia el token de la respuesta, y pégalo en el debugger de https://jwt.io (necesitarás la MasterKey)
// routes/auth.js
const express = require("express")
const { validatorRegister, validatorLogin } = require("../validators/auth")
const { registerCtrl, loginCtrl } = require("../controllers/auth")
const router = express.Router()

router.post("/register", validatorRegister, registerCtrl)
router.post("/login", validatorLogin, loginCtrl)

module.exports = router
