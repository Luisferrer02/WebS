// controllers/tracks.js
const { matchedData } = require("express-validator")
const { handleHttpError } = require("../utils/handleError")
const tracksModel = require("../models/nosql/tracks")

// Obtiene todos los tracks
const getItems = async (req, res) => {
  try {
    const data = await tracksModel.find({})
    res.send(data)
  } catch (err) {
    handleHttpError(res, 'ERROR_GET_ITEMS', 403)
  }
}

// Obtiene un track específico por id
const getItem = async (req, res) => {
  try {
    const { id } = matchedData(req)
    const data = await tracksModel.findById(id)
    res.send(data)
  } catch (err) {
    handleHttpError(res, 'ERROR_GET_ITEM')
  }
}

// Crea un nuevo track
const createItem = async (req, res) => {
  try {
    const body = matchedData(req) // Datos filtrados mediante validación
    const data = await tracksModel.create(body)
    res.send(data)
  } catch (err) {
    handleHttpError(res, 'ERROR_CREATE_ITEM')
  }
}

// Actualiza un track existente
const updateItem = async (req, res) => {
  try {
      const {id, ...body} = matchedData(req); // Extrae el id y asigna el resto a body
      const data = await tracksModel.findOneAndUpdate({_id: id}, body, {new: true});

      if (!data) {
          return res.status(404).json({error: "Elemento no encontrado"});
      }

      res.json({message: "Elemento actualizado con éxito", data});
  } catch (error) {
      console.error("Error al actualizar el ítem:", error);
      handleHttpError(res, "ERROR_UPDATE_ITEM");
  }
};

// Realiza un borrado lógico (soft delete) de un track
const deleteItem = async (req, res) => {
  try {
      const {id} = matchedData(req);
      const datas = await tracksModel.deleteOne({_id: id});

      if (datas.deletedCount === 0) {
          return res.status(404).json({error: "Elemento no encontrado"});
      }

      res.json({message: "Elemento eliminado con éxito", datas});
  } catch (error) {
      console.error("Error al eliminar el ítem:", error);
      handleHttpError(res, "ERROR_DELETE_ITEM");
  }
};

module.exports = { getItems, getItem, createItem, updateItem, deleteItem }
