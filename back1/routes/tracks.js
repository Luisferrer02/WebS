const express = require("express")
const router = express.Router()
const { getItems, getItem, createItem, updateItem, deleteItem } = require("../controllers/tracks")
const { validatorCreateItem, validatorGetItem, validatorUpdateItem } = require("../validators/tracks")
const authMiddleware = require("../middleware/session")
const checkRol = require("../middleware/rol")

router.get("/", authMiddleware, checkRol(['user', 'admin']), getItems)
router.post("/", validatorCreateItem, authMiddleware, createItem)
router.get("/:id", validatorGetItem, authMiddleware, checkRol(['admin']), getItem)
router.put("/:id", validatorUpdateItem, authMiddleware, checkRol(['admin']), updateItem)
router.delete("/:id", validatorGetItem, authMiddleware, checkRol(['admin']), deleteItem)

module.exports = router