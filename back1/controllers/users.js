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
        const {id} = matchedData(req);
        const datas = await usersModel.deleteOne({_id: id});

        if (datas.deletedCount === 0) {
            return res.status(404).json({error: "Usuario no encontrado"});
        }

        res.json({message: "Usuario eliminado con éxito", datas});
    } catch (error) {
        console.error("Error al eliminar el usuario:", error);
        handleHttpError(res, "ERROR_DELETE_USER");
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

module.exports = {
    getUsers,
    getUser,
    updateUser,
    deleteUser,
    updateUserRoleCtrl
};

/*

*/