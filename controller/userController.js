var db = require("../config/db");
var usermodel = require("../model/userModels");
const sendmail = require("../config/common");

exports.registeration = async function (req, res) {
  try {
    db.beginTransaction();
    var data = await usermodel.registeration(req.body);
    if (data.insertId) {
      db.commit();
      res.status(200).json({
        message: "Data Insert Successfully",
        token: "data",
      });
    } else {
      db.rollback();
      res
        .status(404)
        .json({ message: "failed to insert data", Data: req.body });
    }
  } catch (error) {
    db.rollback();
    console.log("error:-", error);
    res.status(500).json({ message: "operation failed" });
  }
};

exports.login = async function (req, res) {
  try {
    db.beginTransaction();
    var loginData = await usermodel.login(req.body);
    if (loginData.id) {
      var generateToken = await usermodel.sessionToken(loginData);
      db.commit();
      res.json({ message: "User Login Successfull", token: generateToken });
    } else {
      db.rollback();
      res.status(401).json({ error: "Datas Error" });
    }
  } catch (error) {
    db.rollback();
    res.status(401).json({ error: "Data Error" });
  }
};

exports.getUserData = async (req, res) => {
  try {
    db.query("SELECT * FROM tg_userdata ORDER BY id asc", function (err, rows) {
      if (err) {
        res.status(500).send({ error: "Data not Found" });
      } else {
        res.status(200).send({ data: "profile", rows });
      }
    });
  } catch (error) {
    db.rollback();
    res.status(401).json({ error: "Data Error" });
  }
};

exports.logOutData = async (req, res) => {
  try {
    db.beginTransaction();
    var loginData = await usermodel.logout(req.headers);
    const loginDataValue = loginData[0];

    if (loginDataValue) {
      var logOutUser = await usermodel.logOutUserData(loginDataValue);
      db.commit();
      res.json({ message: "User Successfull", logOutUser });
    } else {
      db.rollback();
      res.status(401).json({ error: "Datas Errorsssss" });
    }
  } catch (error) {
    db.rollback();
    res.status(401).json({ error: "Data Error" });
  }
};

exports.deleteUserdata = async (req, res) => {
  try {
    db.beginTransaction();
    var deletedData = await usermodel.deletedUser(req.body);
    if (deletedData.affectedRows) {
      db.commit();
      res.json({ message: "User Deleted Successfull" });
    } else {
      db.rollback();
      res.status(401).json({ error: "Datas Errorsssss" });
    }
  } catch (error) {
    db.rollback();
    res.status(401).json({ error: "Error" });
  }
};

exports.generateOTP = async (req, res) => {
  try {
    if (!req.body || !req.body.email) {
      res.status(401).json({ message: "User Email is Empty" });
    }
    db.beginTransaction();
    var userMail = await usermodel.findMail(req.body);
    if (userMail.email) {
      var otpSend = await usermodel.senOTP(req.body);
      if (otpSend.affectedRows) {
        db.commit();
        res.status(200).json({ message: "Success", data: req.body });
      }
    } else {
      db.rollback();
      res.status(401).json({ message: "Email is not Found:" });
    }
  } catch (error) {
    db.rollback();
    res.status(401).json({ error: "Data Error" });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    if (!req.body || !req.body.email || !req.body.otp) {
      res.status(401).json({ message: "invalid Credentials" });
    }
    db.beginTransaction();
    var otpVerify = await usermodel.findMail(req.body);

    if (otpVerify.email) {
      var otpSend = await usermodel.vrfyOTP(req.body);

      if (otpSend) {
        var gnrtRndmPswd = await usermodel.rndmPswd(req.body, otpSend);
        db.commit();
        res.status(200).json({ message: "Otp Verification Succefull" });
      }
    } else {
      db.rollback();
      res.status(401).json({ message: "Email is not Found:" });
    }
  } catch (error) {
    db.rollback();
    res.status(401).json({ error: "Data Error" });
  }
};

exports.chngePswd = async (req, res) => {
  try {
    db.beginTransaction();
    var changePswd = await usermodel.passwordChange(req.body);
    if (changePswd) {
      db.commit();
      res
        .status(200)
        .json({ message: "Password changed has been successfull" });
    } else {
      db.rollback();
      res.status(401).json({ message: "Email is not Found:" });
    }
  } catch (error) {
    db.rollback();
    res.status(401).json({ error: "Data Error" });
  }
};

exports.updtData = async (req, res) => {
  try {
    db.beginTransaction();
    var userData = await usermodel.changeUserData(req.body);
    console.log("userData", userData);
    if (userData) {
      var updatedUserData = await usermodel.updatedData(req.body);
      db.commit();
      res.status(200).json({
        message: "User data has been changed successfull",
        data: updatedUserData,
      });
    } else {
      db.rollback();
      0;
      res.status(401).json({ message: "Email not Found:" });
    }
  } catch (error) {
    db.rollback();
    res.status(401).json({ error: "Data Error" });
  }
};
