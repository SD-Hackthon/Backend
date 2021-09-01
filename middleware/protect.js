const asyncHandler = require('express-async-handler');
const User = require('./../models/user.js');
const jwt = require('jsonwebtoken');

const protect = asyncHandler(async (req, res, next) => {
    let token

    if(
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ){
        try {
            token = req.headers.authorization.split(' ')[1]

            const decoded = jwt.verify(token, 'Lets check this secret')
            // console.log(decoded)

            req.user = await User.findById(decoded.id).select('-password')

            next()
        } catch (error) {
            console.error(error)
            res.status(401)
            throw new Error ('Not authorized, token failed')
        }
    }

    if(!token) {
        res.status(401)
        throw new Error ('Not authorized, no token')
    }
})

module.exports = protect