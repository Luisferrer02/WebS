// controllers/storage.js
const { matchedData } = require("express-validator");
const { handleHttpError } = require("../utils/handleError");
const { storageModel } = require("../models");
const { uploadToPinata } = require("../utils/handleUploadIPFS");

// Obtiene todos los ítems
const getItems = async (req, res) => {
  try {
    const data = await storageModel.find({});
    res.send(data);
  } catch (error) {
    res.status(500).send({ error: "Error al obtener los archivos" });
  }
};

// Obtiene un ítem por su id
const getItem = async (req, res) => {
  try {
    const { id } = matchedData(req);
    const item = await storageModel.findById(id);
    if (!item) {
      return res.status(404).send({ error: "Archivo no encontrado" });
    }
    res.send(item);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Error al obtener el archivo" });
  }
};

// Crea un nuevo ítem subiéndolo a Pinata
const createItem = async (req, res) => {
  try {
    const fileBuffer = req.file.buffer;
    const fileName = req.file.originalname;
    
    // Llama a la función para subir a Pinata
    const pinataResponse = await uploadToPinata(fileBuffer, fileName);
    const ipfsFile = pinataResponse.IpfsHash;
    // Construye la URL usando la variable PINATA_GATEWAY_URL de tu .env
    const ipfsUrl = `https://${process.env.PINATA_GATEWAY_URL}/ipfs/${ipfsFile}`;

    // Guarda en la BD la URL de IPFS y el nombre original
    const fileData = {
      originalName: fileName,
      ipfs: ipfsUrl
    };
    const data = await storageModel.create(fileData);
    res.send(data);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Error al crear el archivo" });
  }
};

// Actualiza la imagen de un ítem (subiendo una nueva versión a Pinata)
const updateImage = async (req, res) => {
  try {
    const id = req.params.id;
    const fileBuffer = req.file.buffer;
    const fileName = req.file.originalname;
    
    const pinataResponse = await uploadToPinata(fileBuffer, fileName);
    const ipfsFile = pinataResponse.IpfsHash;
    const ipfsUrl = `https://${process.env.PINATA_GATEWAY_URL}/ipfs/${ipfsFile}`;

    const data = await storageModel.findOneAndUpdate({ _id: id }, { ipfs: ipfsUrl }, { new: true });
    res.send(data);
  } catch (error) {
    console.error(error);
    res.status(500).send("ERROR_UPLOAD_COMPANY_IMAGE");
  }
};

// Elimina un ítem (solo elimina el registro en la BD)
const deleteItem = async (req, res) => {
  try {
    const { id } = matchedData(req);
    const dataFile = await storageModel.findById(id);
    if (!dataFile) {
      return res.status(404).send({ error: "Archivo no encontrado" });
    }
    await storageModel.deleteOne({ _id: id });
    res.send({ message: "Archivo eliminado correctamente", data: dataFile });
  } catch (err) {
    handleHttpError(res, "ERROR_DELETE_FILE");
  }
};

module.exports = { getItems, getItem, createItem, updateImage, deleteItem };
