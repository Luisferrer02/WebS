const express = require("express")
const router = express.Router()
const { 
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
} = require("../controllers/users")
const { validatorUpdateUser, validatorGetUser } = require("../validators/users")
const authMiddleware = require("../middleware/session")
const checkRol = require("../middleware/rol")

router.get("/", authMiddleware, getUsers)
router.get("/:id", authMiddleware, validatorGetUser, getUser)
router.patch("/:id", authMiddleware, checkRol(['admin']), validatorUpdateUser, updateUser)
router.delete("/:id", authMiddleware, checkRol(['admin']), validatorGetUser, deleteUser)
router.patch("/role/:id", authMiddleware, checkRol(['admin']), updateUserRoleCtrl)

// Nuevos endpoints:
router.post("/validate-email", authMiddleware, validateEmailCtrl)
router.patch("/onboarding/personal", authMiddleware, onboardingPersonalCtrl)
router.patch("/onboarding/company", authMiddleware, onboardingCompanyCtrl)
router.patch("/logo", authMiddleware, updateLogoCtrl)
router.get("/me", authMiddleware, getUserByTokenCtrl)
router.post("/recover-password", recoverPasswordCtrl)
router.post("/invite", authMiddleware, inviteUserCtrl)

module.exports = router
