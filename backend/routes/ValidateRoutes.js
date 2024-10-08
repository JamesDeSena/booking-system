const express = require("express");
const router = express.Router();
const requireAuth = require("../utils/requireAuth");

const {
  ValidateUserData,
  LoginUser,
  LoginAdmin,
  CheckPass,
  ResetPassword,

  CheckPassWithAuth,
  ResetPasswordWithAuth,
} = require("../controllers/Validate");

router.post("/validate", ValidateUserData);
router.post("/login/user", LoginUser);
router.post("/login/admin", LoginAdmin);
router.use(requireAuth);
router.post("/check", CheckPassWithAuth);
router.patch("/resetpass/:id", ResetPasswordWithAuth);

module.exports = router;
