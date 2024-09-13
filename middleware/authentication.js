const CustomError = require('../errors')
const {isTokenValid} = require('../utils')

const authenticateUser = async(req,res,next) => {

const token = req.signedCookies.token;

if(!token){
    // console.log('error, no token present')
    throw new CustomError.UnauthenticatedError('Authentication invalid');
}

try{
    const {name, userId, role} = isTokenValid({token})
    // console.log(payload)
    req.user = {name, userId, role}
    next()
}catch(error){
    throw new CustomError.UnauthenticatedError('Authentication invalid');
}


}

const authorizePermissions = (...roles) => {
    
    // if(user.req.role !== 'admin'){
    //     throw new CustomError.UnauthorizeError('Unauthorize access to this route')
    // }

    return (req, res, next) => {
        if(!roles.includes(req.user.role)){
            throw new CustomError.UnauthorizeError('Unauthorize access to this route');
        }
        next()
    }
  
}


module.exports = {
    authenticateUser,
    authorizePermissions
}