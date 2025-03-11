// controllers/storage.js
const fs = require("fs")
const path = require("path")
const { matchedData } = require("express-validator")
const { handleHttpError } = require("../utils/handleError")
const { storageModel, tracksModel } = require("../models")
// Asegúrate de tener implementada o importada la función uploadToPinata
const { uploadToPinata } = require("../utils/handleUploadIPFS") 

// Ruta física para los archivos almacenados localmente
const MEDIA_PATH = path.join(__dirname, "../storage")

// Obtiene todos los archivos almacenados
const getItems = async (req, res) => {
  try {
    const data = await storageModel.find({})
    res.send(data)
  } catch (error) {
    res.status(500).send({ error: "Error al obtener los archivos" })
  }
}

// Crea un nuevo registro de archivo y lo sube a Pinata/IPFS
const createItem = async (req, res) => {
  try {
    // Se asume que req.file contiene el archivo cargado
    const fileBuffer = req.file.buffer
    const fileName = req.file.originalname

    // Sube el archivo a Pinata y obtiene la respuesta con el hash IPFS
    const pinataResponse = await uploadToPinata(fileBuffer, fileName)
    const ipfsFile = pinataResponse.IpfsHash
    const ipfsUrl = `https://${process.env.PINATA_GATEWAY_URL}/ipfs/${ipfsFile}`

    // Prepara los datos a almacenar (asegúrate de que req.file.filename esté definido)
    const fileData = {
      filename: req.file.filename,
      url: process.env.PUBLIC_URL + "/" + req.file.filename,
      ipfs: ipfsUrl
    }
    const data = await storageModel.create(fileData)
    res.send(data)
  } catch (error) {
    console.error(error)
    res.status(500).send({ error: "Error al crear el archivo" })
  }
}

// Actualiza la imagen asociada a un registro (por ejemplo, subiendo una nueva versión a IPFS)
const updateImage = async (req, res) => {
  try {
    const id = req.params.id
    const fileBuffer = req.file.buffer
    const fileName = req.file.originalname

    const pinataResponse = await uploadToPinata(fileBuffer, fileName)
    const ipfsFile = pinataResponse.IpfsHash
    const ipfsUrl = `https://${process.env.PINATA_GATEWAY_URL}/ipfs/${ipfsFile}`

    const data = await storageModel.findOneAndUpdate({ _id: id }, { image: ipfsUrl }, { new: true })
    res.send(data)
  } catch (err) {
    console.error(err)
    res.status(500).send("ERROR_UPLOAD_COMPANY_IMAGE")
  }
}

// Elimina un registro de archivo y borra el archivo físico del servidor
const deleteItem = async (req, res) => {
  try {
    const { id } = matchedData(req)
    const dataFile = await storageModel.findById(id)
    if (!dataFile) {
      return res.status(404).send({ error: "Archivo no encontrado" })
    }
    await storageModel.deleteOne({ _id: id })
    const filePath = path.join(MEDIA_PATH, dataFile.filename)
    fs.unlinkSync(filePath)
    res.send({ message: "Archivo eliminado correctamente", data: dataFile })
  } catch (err) {
    handleHttpError(res, "ERROR_DELETE_FILE")
  }
}

module.exports = { getItems, createItem, updateImage, deleteItem }
