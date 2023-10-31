const express = require("express");
const userController = require("../controller/userController");
var router = express.Router();
const jwt = require("jsonwebtoken");
const secretKey = "HELLOBHAIKYAHALCHALHAIORSABBADHIYAHAINABHEEDULOG";

router.get("/", (req, res) => {
  res.send("api vala route");
});

const authenticateToken = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token)
    return res.status(401).json({ message: "Access denied. Token missing." });

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid token." });
    req.user = decoded;
    next();
  });
  g;
};

router.post("/registeration", userController.registeration);
router.post("/login", userController.login);
router.get("/user-data", userController.getUserData);
router.post("/log-out", userController.logOutData);
router.post("/delete", authenticateToken, userController.deleteUserdata);
router.post("/generate-otp", userController.generateOTP);
router.post("/verify-otp", userController.verifyOTP);
router.post("/change-password", userController.chngePswd);
router.post("/update-data", userController.updtData);

module.exports = router;
