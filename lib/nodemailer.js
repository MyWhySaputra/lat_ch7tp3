const nodemailer = require("nodemailer")

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_SMTP,
        pass: process.env.PASS_SMTP,
    },
})

module.exports = transporter
