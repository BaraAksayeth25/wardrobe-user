const nodemailer = require("nodemailer");
const smtpConfig = require("../config/email");

const sendEmail = async (to, subject, token) => {
  const transport = nodemailer.createTransport(smtpConfig);
  try {
    await transport.sendMail({
      to: to,
      subject: subject,
      from: process.env.EMAIL_SENDER,
      text: `please follow this link ${process.env.URL_EMAIL_VERIFICATION}/${token} for activate your account`,
    });
  } catch (err) {
    throw new Error(err.message);
  }
};

module.exports = sendEmail;
