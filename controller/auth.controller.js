const { HashPassword, ComparePassword } = require('../helper/hash_pass_helper')
const { ResponseTemplate } = require('../helper/template.helper')
const imagekit = require('../lib/imagekit')
// const transporter = require('../lib/nodemailer')
const nodemailer = require("nodemailer")
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()
var jwt = require('jsonwebtoken')

async function Create(req, res) {

    const { name, email, password, age } = req.body

    const hashPass = await HashPassword(password)

    const payload = {
        name,
        email,
        password: hashPass,
        age
    }

    const emailUser = await prisma.user.findUnique({
        where: {email: payload.email},
    });

    if (emailUser) {
        let resp = ResponseTemplate(null, 'Email already exist', null, 404)
        res.status(404).json(resp)
        return
    }

    // try {

        const stringFile = req.file.buffer.toString("base64");
    
        const uploadFile = await imagekit.upload({
            fileName: req.file.originalname,
            file: stringFile,
        });
        
        await prisma.user.create({
            data: {
                name: payload.name,
                email: payload.email,
                password: payload.password,
                age: parseInt(payload.age),
                profile_picture: uploadFile.url
            }
        })

        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_SMTP,
                pass: process.env.PASS_SMTP,
            },
        })

        await transporter.sendMail({
            from: process.env.EMAIL_SMTP, 
            to: payload.email, 
            subject: "Verification your email", 
            text: `${process.env.BASE_URL}/auth/verify-email?email=${payload.email}`,
        })

        const userView = await prisma.user.findUnique({
            where: {
                email: payload.email
            },
            select: {
                name: true,
                email: true,
                age: true,
                profile_picture: true
            },
        });

        let resp = ResponseTemplate(userView, 'success, check your email', null, 200)
        res.status(200).json(resp);
        return

    // } catch (error) {
    //     let resp = ResponseTemplate(null, 'internal server error', error, 500)
    //     res.status(500).json(resp)
    //     return
    // }
}

async function verifyEmail(req, res) {

    const { email } = req.query

    try {

        await prisma.user.update({
            where: {
                email: email
            },
            data: {
                is_verified: true
            }
        })

        let resp = ResponseTemplate(null, 'your email has been verified', null, 200)
        res.status(200).json(resp);
        return

    } catch (error) {
        let resp = ResponseTemplate(null, 'internal server error', error, 500)
        res.status(500).json(resp)
        return

    }
}

async function Login(req, res) {

    try {
        const { email, password } = req.body

        const checkUser = await prisma.user.findUnique({
            where: {
                email: email
            }
        })

        if (checkUser === null) {
            let resp = ResponseTemplate(null, 'email is not found or incorrect', null, 400)
            res.status(400).json(resp)
            return
        }

        const checkPassword = await ComparePassword(password, checkUser.password)

        if (!checkPassword) {
            let resp = ResponseTemplate(null, 'password is not correct', null, 400)
            res.status(400).json(resp)
            return
        }

        const token = jwt.sign({
            id: checkUser.id,
            email: checkUser.email,
        }, process.env.SECRET_KEY,
            {expiresIn: '24h'});

        let resp = ResponseTemplate(token, 'success', null, 200)
        res.status(200).json(resp)
        return

    } catch (error) {
        let resp = ResponseTemplate(null, 'internal server error', error, 500)
        res.status(500).json(resp)
        return
    }
}

async function updateProfile(req, res) {

    const id  = req.user.id

    try {

        const stringFile = req.file.buffer.toString("base64");
    
        const uploadFile = await imagekit.upload({
            fileName: req.file.originalname,
            file: stringFile,
        })

        const user = await prisma.user.update({
            where: {
                id: Number(id)
            },
            data: {
                profile_picture: uploadFile.url
            },
            select: {
                id: true,
                name: true,
                profile_picture: true
            }
        })

        let resp = ResponseTemplate(user, 'success', null, 200)
        res.status(200).json(resp)
        return

    } catch (error) {
        let resp = ResponseTemplate(null, 'internal server error', error, 500)
        res.status(500).json(resp)
        return
    }
}

module.exports = {
    Create,
    verifyEmail,
    Login,
    updateProfile
}