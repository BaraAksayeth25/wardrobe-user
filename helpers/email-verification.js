const nodemailer = require("nodemailer");
const smtpConfig = require("../config/email");

const sendEmail = async (to, subject, token = null) => {
  const transport = nodemailer.createTransport(smtpConfig);
  const htmlText = token
    ? `
  <div style="line-height: 1.6;">
  <h1 style="color: purple;">Mori</h1>
  <p>Hi dear,</p>
  <p>We're happy you signed up for <span style="color: blue">Mori</span>.To make sure you can exploring the <span style="color: blue">Mori</span> App</p>
  <p>Please confirm your email addres</p>
  <a href="${process.env.URL_EMAIL_VERIFICATION}/${token}">
  <button type="button" style="outline:none;background-color:rgb(214, 14, 114);padding:10px 20px;color:white;width:auto;height:39px;display:flex;justify-content:center;align-items:center;border:none;">Click Here</button>
  </a>
  <p style='font-size: 12px;'>This verification link will expire in 24 hour</p>
  </div>
  `
    : `<div style="line-height: 1.6;">
  <h1 style="color: purple;">Mori</h1>
  <p>Hi dear,</p>
  <p>Your password account successfuly updated</p>
  </div>`;
  try {
    await transport.sendMail({
      to: to,
      subject: subject,
      from: process.env.EMAIL_SENDER,
      html: htmlText,
    });
  } catch (err) {
    throw new Error(err.message);
  }
  return "Success send email";
};

module.exports = sendEmail;
