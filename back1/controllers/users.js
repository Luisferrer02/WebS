const { usersModel } = require('../models')
const { matchedData } = require('express-validator')
const { handleHttpError } = require('../utils/handleError')

const getUsers = async (req, res) => {
    try {
        const data = await usersModel.find({})
        res.send({data})
    } catch (err) {
        handleHttpError(res, 'ERROR_GET_USERS', 500);
    }
}

const getUser = async (req, res) => {
    try {
        const { id } = matchedData(req)
        const data = await usersModel.findById(id)
        res.send(data)
    } catch (err) {
        handleHttpError(res, 'ERROR_GET_USER', 500);
    }
}

const updateUser = async (req, res) => {
    try {
        const {id, ...body} = matchedData(req);
        const data = await usersModel.findOneAndUpdate({_id: id}, body, {new: true});

        if (!data) {
            return res.status(404).json({error: "Usuario no encontrado"});
        }

        res.json({message: "Usuario actualizado con éxito", data});
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
    req = matchedData(req)
    const { id, role } = req
    const updatedUser = await usersModel.findByIdAndUpdate(id, { role }, { new: true })
    if (!updatedUser) {
      handleHttpError(res, "USER_NOT_FOUND", 404)
      return
    }
    res.send(updatedUser)
  } catch (err) {
    handleHttpError(res, "ERROR_UPDATE_USER_ROLE")
  }
}

const recoverPasswordCtrl = async (req, res) => {
    try {
      const { email } = matchedData(req);
      // Aquí se implementaría la lógica para generar un link/token de recuperación y enviar un correo.
      return res.json({ message: "Instrucciones para recuperar la contraseña enviadas (stub)" });
    } catch (error) {
      console.error(error);
      return handleHttpError(res, "ERROR_RECOVER_PASSWORD");
    }
  };

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
      
      invitedUser = await usersModel.create({
        email,
        password: "", // Valor temporal o nulo; se deberá gestionar la activación
        role: "guest",
        status: "pending"
      });
      
      // Aquí se enviaría un correo con la invitación (stub)
      return res.json({ message: "Invitación enviada correctamente", invitedUser });
    } catch (error) {
      console.error(error);
      return handleHttpError(res, "ERROR_INVITE_USER");
    }
  };

/**
 * Valida el email de un usuario con un código de 6 dígitos
 * Requiere un token JWT para identificar al usuario (req.user)
 */
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
        companyName: companyName || (user.company && user.company.companyName) || "",
        cif: cif || (user.company && user.company.cif) || "",
        address: address || (user.company && user.company.address) || ""
      };
      await user.save();
      return res.json({ message: "Datos de la compañía actualizados", company: user.company });
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
      const pinataResponse = await uploadToPinata(req.file.buffer, req.file.originalname);
      const ipfsHash = pinataResponse.IpfsHash;
      const logoUrl = `https://${process.env.PINATA_GATEWAY_URL}/ipfs/${ipfsHash}`;
      
      // Actualizar el campo logo del usuario
      user.logo = logoUrl;
      await user.save();
      
      return res.json({ message: "Logo actualizado correctamente", logo: logoUrl });
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
    recoverPasswordCtrl,
    inviteUserCtrl
};
