const db = require("../config/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const otpGene = require("otp-generator");
const sendmail = require("../config/common");

var User = function (data) {};

User.registeration = async function (postdata) {
  return new Promise(async (resolve, reject) => {
    try {
      var saltRounds = 12;
      var hashedPassword = await bcrypt.hash(postdata.password, saltRounds);
      var insertdata = {
        name: postdata.name ? postdata.name : "",
        email: postdata.email ? postdata.email : "",
        phone: postdata.phone ? postdata.phone : "",
        city: postdata.city ? postdata.city : "",
        state: postdata.state ? postdata.state : "",
        address: postdata.address ? postdata.address : "",
        message: postdata.message ? postdata.message : "",
        password: hashedPassword,
      };

      var querystring = "insert into tg_userdata set ?";
      db.query(querystring, insertdata, (err, res) => {
        if (err) {
          return reject(err);
        } else {
          console.log(res);
          return resolve(res);
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};

User.login = async function (postdata) {
  return new Promise((resolve, reject) => {
    var queryString = "SELECT * FROM tg_userdata WHERE email = ?";
    var filter = [postdata.email];
    db.query(queryString, filter, function (err, res) {
      if (err) {
        console.log("Error:", err);
        return reject(err);
      } else {
        if (res.length === 0) {
          return resolve(null);
        }
        const userData = res[0];
        bcrypt.compare(
          postdata.password,
          userData.password,
          function (bcryptErr, bcryptRes) {
            if (bcryptErr) {
              console.log("bcrypt Error:", bcryptErr);
              return reject(bcryptErr);
            } else if (bcryptRes) {
              return resolve(userData);
            } else {
              return resolve(null);
            }
          }
        );
      }
    });
  });
};

User.sessionToken = async (data) => {
  return new Promise((resolve, reject) => {
    var tokenData = { id: data.id, email: data.email, password: data.password };
    var token = jwt.sign(
      { tokenData },
      "HELLOBHAIKYAHALCHALHAIORSABBADHIYAHAINABHEEDULOG",
      { algorithm: "HS256" }
    );
    data.sessionToken = token;
    var queryString = `UPDATE tg_userdata SET token= ? WHERE id = '${data.id}' `;
    var filter = [data.sessionToken];
    db.query(queryString, filter, function (err, res) {
      if (err) {
        console.log("erty", err);
        return reject(err);
      } else {
        return resolve(token);
      }
    });
  });
};

User.logout = async function (postdata) {
  return new Promise((resolve, reject) => {
    if (!postdata || !postdata.authorization) {
      return reject("Authorization token is missing");
    }

    var token = postdata.authorization;

    var queryString = `SELECT * FROM tg_userdata where token = ?`;
    var filter = [token];

    db.query(queryString, filter, (error, results) => {
      if (error) {
        console.error("Error logging out user:", error);
        return reject(error);
      } else {
        if (results.affectedRows === 0) {
          return reject("Invalid token or user not found");
        }
        return resolve(results);
      }
    });
  });
};

User.logOutUserData = async function (postdata) {
  return new Promise((resolve, reject) => {
    if (!postdata || !postdata.id) {
      return reject("User ID is missing");
    }
    const userId = postdata.id;
    const queryString = "UPDATE tg_userdata SET token = NULL WHERE id = ?";
    const filter = [userId];

    db.query(queryString, filter, function (err, res) {
      if (err) {
        console.error("Error logging out user:", err);
        return reject(err);
      } else {
        if (res.affectedRows === 0) {
          return reject("User not found");
        }

        return resolve({ message: "User logged out successfully" });
      }
    });
  });
};

User.deletedUser = async function (postdata) {
  return new Promise((resolve, reject) => {
    if (!postdata || !postdata.id) {
      return reject("User ID is missing");
    }
    const userId = postdata.id;
    const queryString = "DELETE FROM tg_userdata WHERE id = ?";
    const filter = [userId];

    db.query(queryString, filter, function (err, res) {
      if (err) {
        console.error("Error deleting user:", err);
        return reject(err);
      } else {
        if (res.affectedRows === 0) {
          return reject("User not found");
        }
        return resolve(res);
      }
    });
  });
};

User.findMail = async function (postdata) {
  return new Promise((resolve, reject) => {
    const userEmail = postdata.email;
    const queryString = "SELECT email FROM tg_userdata WHERE email = ?";
    const filter = [userEmail];

    db.query(queryString, filter, function (err, res) {
      if (err) {
        console.log("err", err);
        return reject(err);
      } else {
        console.log("res", res);
        var data = {};
        if (res.length > 0) {
          data = res[0];
        }
        return resolve(data);
      }
    });
  });
};

User.senOTP = async function (postdata) {
  return new Promise((resolve, reject) => {
    var queryString = "UPDATE tg_userdata SET otp = ? WHERE email = ?";
    const otp = otpGene.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
    });

    filter = [otp, postdata.email];

    db.query(queryString, filter, function (err, res) {
      if (err) {
        console.log("Error :-", err);
        return reject(err);
      } else {
        let mailsubject = "Reset Password";
        let content =
          " Hi <br> Your One Time Password to Reset your password is :- " +
          otp +
          "";
        sendmail(postdata.email, mailsubject, content);
        console.log("Resp :-", res);
        return resolve(res);
      }
    });
  });
};

function generateRandomPassword(length) {
  const charset = "abcdejvwxyzABCDEFG-u23456789!@#$%^&*()_+";
  let password = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset.charAt(randomIndex);
  }

  return password;
}

User.vrfyOTP = async function (postdata) {
  return new Promise((resolve, reject) => {
    const userOTP = postdata.otp;
    const queryString = "SELECT otp FROM tg_userdata WHERE otp = ? ";
    const randomPassword = generateRandomPassword(12);
    const filter = [userOTP];
    db.query(queryString, filter, function (err, res) {
      if (err) {
        console.error("Wrong OTP:", err);
        return reject(err);
      } else {
        let mailsubject = "Password Changed";
        let content = " Hi <br> Your new password is :- " + randomPassword + "";
        sendmail(postdata.email, mailsubject, content);
        console.log("Resp :-", res);
        return resolve(randomPassword);
      }
    });
  });
};

User.rndmPswd = async function (data, postdata) {
  return new Promise(async (resolve, reject) => {
    const userEmail = data.email;
    const queryString = "UPDATE tg_userdata SET password = ? WHERE email = ?";
    var hashedPassword = await bcrypt.hash(postdata, 12);

    const filter = [hashedPassword, userEmail];
    db.query(queryString, filter, function (err, res) {
      if (err) {
        console.error("Wrong OTP:", err);
        return reject(err);
      } else {
        console.log("Resp :-", res);
        return resolve(res);
      }
    });
  });
};

User.passwordChange = async function (postdata) {
  return new Promise(async (resolve, reject) => {
    const userEmail = postdata.email;
    const userPswd = postdata.password;
    const queryString = "UPDATE tg_userdata SET password = ? WHERE email = ?";
    var hashedPassword = await bcrypt.hash(userPswd, 12);

    const filter = [hashedPassword, userEmail];
    db.query(queryString, filter, function (err, res) {
      if (err) {
        console.error("Wrong OTP:", err);
        return reject(err);
      } else {
        console.log("Resp :-", res);
        return resolve(res);
      }
    });
  });
};

User.changeUserData = async function (postdata) {
  return new Promise(async (resolve, reject) => {
    const userEmail = postdata.email;

    const queryString = "SELECT * FROM tg_userdata WHERE email = ?";
    const filter = [userEmail];

    db.query(queryString, filter, function (err, res) {
      if (err) {
        console.error("Wrong OTP:", err);
        return reject(err);
      } else {
        var data = {};
        if (res.length) {
          data = res[0];
        }

        return resolve(data);
      }
    });
  });
};

User.updatedData = async function (postdata) {
  return new Promise(async (resolve, reject) => {
    const { name, email, phone, city, state, address } = postdata;

    db.query(
      "update tg_userdata set name = ?, phone = ?, city=?,  state = ?, address=? where email = ?",
      [name, phone, city, state, address, email],
      (err, res) => {
        if (!err) {
          db.query(
            "select * from tg_userdata where email = ?",
            [email],
            (err, res) => {
              if (err) {
                return reject(err);
              } else {
                return resolve(res);
              }
            }
          );
        } else {
          return resolve(res);
        }
      }
    );
  });
};

module.exports = User;
