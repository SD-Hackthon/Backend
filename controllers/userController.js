const asyncHandler = require('express-async-handler');
const User = require('./../models/user.js');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, 'Lets check this secret', {
        expiresIn: '30d'
    })
}

// @desc Auth user & get token
// @route GET /api/users/login
// @access Public
const authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body

    console.log(req.body)

    const user = await User.findOne({ email })

    if(user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            token: generateToken(user._id)
        })
    } else {
        res.status(401)
        throw new Error ("Invalid email or password")
    }
})

// @desc Register a new user
// @route POST /api/users
// @access Public
const registerUser = asyncHandler(async (req, res) => {
    const { firstName, lastName, address, email, password } = req.body

    const userExists = await User.findOne({ email });

    if(userExists) {
        res.status(400)
        throw new Error ("User already exists")
    } 

    const user = await User.create({
        firstName,
        lastName,
        address,
        email, 
        password
    })

    if(user) {
        res.status(201).json({
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            token: generateToken(user._id)
        })
    } else {
        res.status(400)
        throw new Error ('Invalid user data')
    }
})

module.exports = {
    authUser,
    registerUser
}