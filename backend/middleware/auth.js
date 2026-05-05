import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const protect = async (req, res, next)=>{
    let token;

    //check if token exists in authorization header
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        try {
            //get token from header
            token = req.headers.authorization.split(' ')[1];

            //verify token
            const decoded = jwt.verify(token,process.env.JWT_SECRET);

            //get user from token
            req.user = await User.findById(decoded.id).select('-password');

            if(!req.user){
                return res.status(401).json({
                    success:false,
                    error:'User not found',
                    statusCode:401
                });
            }

            next();
        } catch (error) {
            console.error('Auth middleware error:',error.message);

            if(error.name === 'TokenExpiredError'){
                return res.status(401).json({
                    success:false,
                    error:'Token has Expired',
                    statusCode:401
                })
            }
            return res.status(401).json({
                success:false,
                error:'Not authorized',
                statusCode:401
            })
        }
    }

    if(!token){
        return res.status(401).json({
            success:false,
            error:'Not Authorized, no token!',
            statusCode:401
        });
    };

}

export default protect;