
const { ResponseTemplate } = require('../helper/template.helper')
const jwt = require('jsonwebtoken')

async function Auth(req, res, next) {

    const { authorization } = req.headers

    if (!authorization) {
        let resp = ResponseTemplate(null, 'user unauthorized', null, 400)
        res.status(400).json(resp)
        return
    }

    try {

        const user = await jwt.verify(authorization, process.env.SECRET_KEY)

        req.user = user

        next()

    } catch (error) {
        let resp = ResponseTemplate(null, 'user not authorized', null, 401)
        res.status(401).json(resp)
        return
    }
}

module.exports = {
    Auth
}