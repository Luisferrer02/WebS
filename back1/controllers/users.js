//controllers/users.js
const { encrypt, compare } = require("../utils/handlePassword");
const { usersModel } = require("../models");
const { matchedData } = require("express-validator");
const { handleHttpError } = require("../utils/handleError");
const { sendEmail } = require("../utils/handleMails");

const getUsers = async (req, res) => {
  try {
    const data = await usersModel.find({});
    res.send({ data });
  } catch (err) {
    handleHttpError(res, "ERROR_GET_USERS", 500);
  }
};

const getUser = async (req, res) => {
  try {
    const { id } = matchedData(req);
    const data = await usersModel.findById(id);
    res.send(data);
  } catch (err) {
    handleHttpError(res, "ERROR_GET_USER", 500);
  }
};

const updateUser = async (req, res) => {
  try {
    const { id, ...body } = matchedData(req);
    const data = await usersModel.findOneAndUpdate({ _id: id }, body, {
      new: true,
    });

    if (!data) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json({ message: "Usuario actualizado con éxito", data });
  } catch (error) {
    handleHttpError(res, "ERROR_UPDATE_USER");
  }
};

const deleteUser = async (req, res) => {
  try {
    // Se usa el usuario obtenido del token (req.user)
    const user = req.user;
    if (!user) {
      return handleHttpError(res, "USER_NOT_FOUND", 404);
    }

    // Si el query soft es "false", se hace hard delete; de lo contrario, soft delete
    const softDelete = req.query.soft !== "false"; // softDelete por defecto es true
    if (softDelete) {
      user.deleted = true;
      await user.save();
      return res.json({ message: "Usuario eliminado (soft delete) con éxito" });
    } else {
      await usersModel.deleteOne({ _id: user._id });
      return res.json({ message: "Usuario eliminado (hard delete) con éxito" });
    }
  } catch (error) {
    console.error("Error al eliminar el usuario:", error);
    return handleHttpError(res, "ERROR_DELETE_USER");
  }
};

const updateUserRoleCtrl = async (req, res) => {
  try {
    req = matchedData(req);
    const { id, role } = req;
    const updatedUser = await usersModel.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    );
    if (!updatedUser) {
      handleHttpError(res, "USER_NOT_FOUND", 404);
      return;
    }
    res.send(updatedUser);
  } catch (err) {
    handleHttpError(res, "ERROR_UPDATE_USER_ROLE");
  }
};

const recoverPasswordCtrl = async (req, res) => {
  try {
    const { email, newPassword } = matchedData(req);
    const user = await usersModel.findOne({ email });
    if (!user) {
      return handleHttpError(res, "USER_NOT_EXISTS", 404);
    }

    if (newPassword) {
      user.password = await encrypt(newPassword);
      await user.save();
      console.log(`La contraseña para ${email} se ha actualizado a: ${newPassword}`);

      // Enviar email confirmando cambio de contraseña
      const emailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: "Confirmación de Cambio de Contraseña",
        text: "Tu contraseña se ha actualizado exitosamente."
      };
      sendEmail(emailOptions)
        .then(() => console.log("Email de confirmación enviado"))
        .catch((error) => console.error("Error enviando email:", error));

      return res.json({ message: "Contraseña actualizada exitosamente" });
    } else {
      console.log(`Simulando el envío de instrucciones de recuperación a ${email}`);

      // Enviar email con instrucciones
      const emailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: "Instrucciones para Recuperar Contraseña",
        text: "Por favor, sigue el enlace para recuperar tu contraseña."
      };
      sendEmail(emailOptions)
        .then(() => console.log("Email de recuperación enviado"))
        .catch((error) => console.error("Error enviando email:", error));

      return res.json({
        message: "Instrucciones para recuperar la contraseña enviadas (stub)"
      });
    }
  } catch (error) {
    console.error(error);
    return handleHttpError(res, "ERROR_RECOVER_PASSWORD");
  }
};


const validateEmailCtrl = async (req, res) => {
  try {
    // authMiddleware inyecta req.user desde el token
    const user = req.user;
    if (!user) {
      return handleHttpError(res, "USER_NOT_FOUND", 404);
    }

    const { code } = req.body;

    // Validar que el código tenga 6 dígitos
    if (!code || code.length !== 6) {
      return handleHttpError(res, "INVALID_CODE_FORMAT", 400);
    }

    // Comparar con el valor guardado en la BD
    if (user.emailVerificationCode !== code) {
      // Incrementar intentos fallidos
      user.emailVerificationAttempts += 1;
      await user.save();
      return handleHttpError(res, "INVALID_CODE", 400);
    }

    // Marcar como verificado
    user.isEmailVerified = true;
    user.status = "active";
    user.emailVerificationCode = null;
    user.emailVerificationAttempts = 0;
    await user.save();

    return res.send({ message: "Email verificado correctamente" });
  } catch (error) {
    console.error(error);
    handleHttpError(res, "ERROR_VERIFY_EMAIL");
  }
};

const onboardingPersonalCtrl = async (req, res) => {
  try {
    // El middleware auth debe inyectar req.user
    const user = req.user;
    if (!user) {
      return handleHttpError(res, "USER_NOT_FOUND", 404);
    }
    // Extraer datos validados del body
    const { name, lastName, nif } = matchedData(req);
    // Actualizar datos personales
    user.name = name || user.name;
    user.lastName = lastName || user.lastName;
    user.nif = nif || user.nif;
    await user.save();
    return res.json({ message: "Datos personales actualizados", user });
  } catch (error) {
    console.error(error);
    return handleHttpError(res, "ERROR_UPDATE_USER");
  }
};

const onboardingCompanyCtrl = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return handleHttpError(res, "USER_NOT_FOUND", 404);
    }
    // Extraer datos validados del body
    const { companyName, cif, address } = matchedData(req);
    // Actualizar el campo company del usuario
    user.company = {
      companyName:
        companyName || (user.company && user.company.companyName) || "",
      cif: cif || (user.company && user.company.cif) || "",
      address: address || (user.company && user.company.address) || "",
    };
    await user.save();
    return res.json({
      message: "Datos de la compañía actualizados",
      company: user.company,
    });
  } catch (error) {
    console.error(error);
    return handleHttpError(res, "ERROR_UPDATE_COMPANY");
  }
};

const updateLogoCtrl = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return handleHttpError(res, "USER_NOT_FOUND", 404);
    }

    if (!req.file) {
      return handleHttpError(res, "NO_FILE_UPLOADED", 400);
    }

    // Control de tamaño: máximo 1MB (ejemplo)
    if (req.file.size > 1024 * 1024) {
      return handleHttpError(res, "FILE_TOO_LARGE", 400);
    }

    // Subir el logo a Pinata usando la función ya existente
    const { uploadToPinata } = require("../utils/handleUploadIPFS");
    const pinataResponse = await uploadToPinata(
      req.file.buffer,
      req.file.originalname
    );
    const ipfsHash = pinataResponse.IpfsHash;
    const logoUrl = `https://${process.env.PINATA_GATEWAY_URL}/ipfs/${ipfsHash}`;

    // Actualizar el campo logo del usuario
    user.logo = logoUrl;
    await user.save();

    return res.json({
      message: "Logo actualizado correctamente",
      logo: logoUrl,
    });
  } catch (error) {
    console.error(error);
    return handleHttpError(res, "ERROR_UPDATE_LOGO");
  }
};

const getUserByTokenCtrl = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return handleHttpError(res, "USER_NOT_FOUND", 404);
    }
    return res.json({ user });
  } catch (error) {
    console.error(error);
    return handleHttpError(res, "ERROR_GET_USER");
  }
};

const recoverPasswordCodeCtrl = async (req, res) => {
  try {
    // Se espera { email, currentPassword, from } en el body (el campo "from" es opcional)
    const { email, currentPassword, from } = matchedData(req);
    const user = await usersModel.findOne({ email });
    if (!user) {
      return handleHttpError(res, "USER_NOT_EXISTS", 404);
    }
    // Validar la contraseña actual
    const validPass = await compare(currentPassword, user.password);
    if (!validPass) {
      return handleHttpError(res, "INVALID_PASSWORD", 401);
    }
    // Generar código de recuperación de 6 dígitos
    const recoveryCode = Math.floor(100000 + Math.random() * 900000).toString();
    // (Opcionalmente, podrías agregar un contador de intentos)
    user.passwordRecoveryCode = recoveryCode;
    await user.save();
    
    console.log(`Código de recuperación generado para ${email}: ${recoveryCode}`);
    
    // Preparar email. Si se pasa "from" en el body, lo usa; sino usa process.env.EMAIL
    const emailOptions = {
      from: from || process.env.EMAIL,
      to: email,
      subject: "Código para Cambio de Contraseña",
      text: `Tu código de recuperación es: ${recoveryCode}`
    };
    sendEmail(emailOptions)
      .then(() => console.log("Email de recuperación enviado"))
      .catch((error) => console.error("Error enviando email de recuperación:", error));

    return res.json({ message: "Código de recuperación enviado al correo del usuario" });
  } catch (error) {
    console.error(error);
    return handleHttpError(res, "ERROR_RECOVER_PASSWORD");
  }
};

const changePasswordCtrl = async (req, res) => {
  try {
    // Se espera { email, recoveryCode, newPassword } en el body
    const { email, recoveryCode, newPassword } = matchedData(req);
    const user = await usersModel.findOne({ email });
    if (!user) {
      return handleHttpError(res, "USER_NOT_EXISTS", 404);
    }
    // Comprobar que el código enviado coincide con el guardado
    if (!user.passwordRecoveryCode || user.passwordRecoveryCode !== recoveryCode) {
      return handleHttpError(res, "INVALID_RECOVERY_CODE", 400);
    }
    // Actualizar la contraseña
    user.password = await encrypt(newPassword);
    // Limpiar el código de recuperación
    user.passwordRecoveryCode = null;
    await user.save();
    
    console.log(`Contraseña actualizada para ${email}`);
    
    // Enviar correo de confirmación
    const emailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Confirmación de Cambio de Contraseña",
      text: "Tu contraseña se ha actualizado exitosamente."
    };
    sendEmail(emailOptions)
      .then(() => console.log("Email de confirmación enviado"))
      .catch((error) => console.error("Error enviando email de confirmación:", error));
      
    return res.json({ message: "Contraseña actualizada exitosamente" });
  } catch (error) {
    console.error(error);
    return handleHttpError(res, "ERROR_CHANGE_PASSWORD");
  }
};

// Modificar la invitación de usuario
const inviteUserCtrl = async (req, res) => {
  try {
    const inviter = req.user;
    if (!inviter) {
      return handleHttpError(res, "USER_NOT_FOUND", 404);
    }
    const { email } = matchedData(req);
    let invitedUser = await usersModel.findOne({ email });
    if (invitedUser) {
      return handleHttpError(res, "USER_ALREADY_EXISTS", 409);
    }
    // Crear usuario invitado con password preliminar "1234"
    const preliminaryPassword = await encrypt("1234");
    invitedUser = await usersModel.create({
      email,
      password: preliminaryPassword,
      role: "guest",
      status: "pending"
    });
    
    // Enviar email de invitación con credenciales
    const emailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Invitación para unirse a la plataforma",
      text: `Has sido invitado a unirte a la plataforma.\nCredenciales:\nEmail: ${email}\nPassword: 1234`
    };
    sendEmail(emailOptions)
      .then(() => console.log("Email de invitación enviado"))
      .catch((error) => console.error("Error enviando email de invitación:", error));
    
    return res.json({
      message: "Invitación enviada correctamente",
      invitedUser
    });
  } catch (error) {
    console.error(error);
    return handleHttpError(res, "ERROR_INVITE_USER");
  }
};

module.exports = {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  updateUserRoleCtrl,
  validateEmailCtrl,
  onboardingPersonalCtrl,
  onboardingCompanyCtrl,
  updateLogoCtrl,
  getUserByTokenCtrl,
  //recoverPasswordCtrl,
  inviteUserCtrl,
  recoverPasswordCodeCtrl,
  changePasswordCtrl
};
