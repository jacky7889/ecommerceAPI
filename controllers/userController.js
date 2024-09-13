const User = require('../models/user')
const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors')
// const user = require('../models/user')
const {createTokenUser, attachCookiesToResponse, checkPermissions} = require('../utils')


const getAllUsers = async (req, res) => {
    // res.send('get all users route')
    console.log(req.user)
    const users = await User.find({ role: 'user' }).select('-password')
    res.status(StatusCodes.OK).json({ users })
}

const getSingleUser = async (req, res) => {
    // res.send(req.params)
    const user = await User.findOne({ _id: req.params.id }).select('-password')
    if (!user) {
        throw new CustomError.NotFoundError(`no user with id: ${req.params.id}`);
    }
    checkPermissions(req.user, user._id)
    res.status(StatusCodes.OK).json({ user })
}

const showCurrentUser = async (req, res) => {
    res.status(StatusCodes.OK).json({ user: req.user });
}

const updateUser = async (req, res) => {
    const { name, email } = req.body;
    if (!email || !name) {
        throw new CustomError.BadRequestError('provide all values');
    }
    const user = await User.findOne({_id:req.user.userId});
    console.log(user)
    user.name = name
    user.email = email

    await user.save()

    const tokenUser = createTokenUser(user)
    attachCookiesToResponse({res,user:tokenUser})
    res.status(StatusCodes.OK).json({user:tokenUser})
    // res.send('update user')
}

const updateUserPassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
        throw new CustomError.BadRequestError('Please provide both values');
    }

    const user = await User.findOne({ _id: req.user.userId });

    const isPasswordCorrect = await user.comparePassword(oldPassword)
    if (!isPasswordCorrect) {
        throw new CustomError.UnauthenticatedError('Invalid credentials');
    }

    user.password = newPassword;
    await user.save();
    res.status(StatusCodes.OK).json({ msg: 'success! password updated' });
}

module.exports = {
    getAllUsers, getSingleUser, showCurrentUser, updateUser, updateUserPassword
}


//update with findandOne//
// const updateUser = async (req, res) => {
//     const { name, email } = req.body;
//     if (!email || !name) {
//         throw new CustomError.BadRequestError('provide all values');
//     }
//     const user = await User.findOneAndUpdate({ _id: req.user.userId }, { email, name }, { new: true, runValidators: true })
//     const tokenUser = createTokenUser(user)
//     attachCookiesToResponse({res,user:tokenUser})
//     res.status(StatusCodes.OK).json({user:tokenUser})

// }