// controllers/auth.js
const { matchedData } = require("express-validator");
const { tokenSign } = require("../utils/handleJwt");
const { encrypt, compare } = require("../utils/handlePassword");
const { handleHttpError } = require("../utils/handleError");
const { usersModel } = require("../models");
const { sendEmail } = require("../utils/handleMails"); // Importa el módulo de mails

const registerCtrl = async (req, res) => {
  try {
    // 1) Obtener datos validados
    req = matchedData(req);

    // 2) Verificar si ya existe el usuario
    const existingUser = await usersModel.findOne({ email: req.email });
    if (existingUser) {
      return handleHttpError(res, "EMAIL_ALREADY_EXISTS", 409);
    }

    // 3) Cifrar la contraseña
    const passwordHash = await encrypt(req.password);

    // 4) Generar un código de verificación de 6 dígitos
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // 5) Construir objeto para la creación
    const body = {
      ...req,
      password: passwordHash,
      isEmailVerified: false,
      emailVerificationCode: verificationCode,
      emailVerificationAttempts: 0,
      status: "pending"
    };

    // 6) Crear el usuario en la BD
    const dataUser = await usersModel.create(body);

    // 7) No devolver la contraseña en la respuesta
    dataUser.set('password', undefined, { strict: false });

    // 8) Generar el token JWT
    const token = await tokenSign(dataUser);

    // 9) Enviar email de verificación al usuario
    const emailOptions = {
      from: process.env.EMAIL, // Remitente (debe coincidir con el configurado en OAuth2)
      to: dataUser.email,
      subject: "Verificación de Email",
      text: `Hola ${dataUser.name}, tu código de verificación es: ${verificationCode}`
    };
    // Enviar email sin bloquear el proceso (fire-and-forget)
    sendEmail(emailOptions)
      .then(() => console.log("Email de verificación enviado"))
      .catch((error) => console.error("Error enviando email:", error));

    // 10) Responder con los datos del usuario y el token
    const data = {
      token,
      user: {
        _id: dataUser._id,
        email: dataUser.email,
        role: dataUser.role,
        isEmailVerified: dataUser.isEmailVerified,
        status: dataUser.status
      }
    };
    res.send(data);
  } catch (err) {
    console.log(err);
    handleHttpError(res, "ERROR_REGISTER_USER");
  }
};

const loginCtrl = async (req, res) => {
  try {
    req = matchedData(req);
    const user = await usersModel
      .findOne({ email: req.email })
      .select("password name role email isEmailVerified");

    if (!user) {
      return handleHttpError(res, "USER_NOT_EXISTS", 404);
    }

    if (!user.isEmailVerified) {
      return handleHttpError(res, "EMAIL_NOT_VERIFIED", 403);
    }

    const hashPassword = user.password;
    const check = await compare(req.password, hashPassword);

    if (!check) {
      return handleHttpError(res, "INVALID_PASSWORD", 401);
    }

    // No devolver el hash del password
    user.set('password', undefined, { strict: false });
    const data = {
      token: await tokenSign(user),
      user
    };

    res.send(data);
  } catch (err) {
    console.log(err);
    handleHttpError(res, "ERROR_LOGIN_USER");
  }
};

module.exports = { registerCtrl, loginCtrl };
