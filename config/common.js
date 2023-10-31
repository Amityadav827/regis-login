const nodemailer = require("nodemailer");
require("dotenv").config({ path: "./.env" });

const sendmail = async function (email, mailsubject, content) {
  try {
    const transport = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: "ssingh98915@gmail.com",

        pass: "glayedosqzaubtbj",
      },
    });

    const mailoptions = {
      from: "ssingh98915@gmail.com",

      to: email,
      subject: mailsubject,
      html: content,
    };

    transport.sendMail(mailoptions, function (err, info) {
      if (err) {
        console.log(err);
      } else {
        console.log("Mail sent successfully :- ", info.response);
      }
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = sendmail;
