const authService = require('../services/services');
const { verifyPassword } = require ('../utils/passwordUtils');
const {
     generateAccessToken,
     generateRefreshToken,
     verifyAccessToken,
     verifyRefreshToken
} = require ('../utils/jwtUtils')
const User = require ('../models/user');
const { success } = require('zod');
const { ValidationError, NotFoundError, AppError } = require('../errors/error');
const { hashToken } = require('../utils/hash');
const { hashPassword } = require ('../utils/passwordUtils')



exports.signUp = async (req , res , next) => {

    const { email, password } = req.body;

    if(!password || password.length < 8)
    {
        throw new AppError ('Password too short!', 400)
        return null;
    }

    const passwordHash = await hashPassword(password);

    const user = new User(email, passwordHash);


    try {
        const data = await authService.create(user);

        res.status(201).json({success : true})
    } catch (error) {
        next(error)
    }
}


exports.signIn = async (req , res , next) => 
{
    const { email, password } = req.body;
    const ip = req.ip;

    try {
        const user = await authService.fetchByEmail(email);

        if (!user) {
            throw new NotFoundError()
            }
    

        const isVerified = await verifyPassword(user.password_hash, password);

        const userDetails = {
            user_id: user.user_id,
            email: user.email,
            role: user.role
        }

        if(isVerified == false){
            throw new ValidationError()
            res.json( "Invalid credentials")
        }

      const accessToken = generateAccessToken ({
        user_id: user.user_id,
        role: user.role
      })

      const refreshToken = generateRefreshToken({
        user_id : user.user_id,
        role: user.role
      })

      const token_hash = hashToken(refreshToken);
      const expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await authService.addRefreshToken(token_hash, user.id, expires_at );

      await authService.logActvity(user.user_id, "SIGN IN", ip);

      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15* 60 *60 * 1000
      })

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 *24 * 60 * 60 * 1000
      })

      return res.status(200).json({
        success: true,
        data: userDetails
      })

      
    } catch (error) {

        if(error instanceof NotFoundError ) {
            return next (new AppError('Invalid credentials', 401))
        }

        next(error)
        
    }
}


exports.fetchMe = async ( req, res , next )=> {
    const { user_id } = req.user;

    try {
        const user = await authService.fetchById(user_id);

        res.status(200).json({data: user})

    } catch (error) {
        next (error);
    }
}


exports.refreshAccessToken = async ( req, res, next )=> {
    const { user_id } = req.user;
    const ip = req.ip;

    console.log(user_id);

    try {
        const token = req.cookies.refreshToken;

        if(!token){
            throw new AppError("No refresh token", 401);
        }

        const decoded = verifyRefreshToken(token)

        if(!decoded || !decoded.user_id) {
            throw new AppError ("Invalid or expired refresh token", 403)
        }

        const user = await authService.fetchById(user_id);

       const tokenHash = await authService.fetchTokenHash(user_id)

       if(tokenHash.revoked == 1){
        throw new AppError("Revoked refresh token", 403)
       }

       await authService.logActvity(user_id, "REFRESHING ACCESS TOKEN", ip )

        const accessToken = generateAccessToken({
            user_id: user.user_id,
            role: user.role
        })

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 15 * 60 * 1000
        })

        res.status(200).json({
            success: true,
            message : 'Access token refreshed'
        })

    } catch (error) {
        next(error)
    }
}


exports.revokeRefreshToken = async (req , res , next) => {
    const { user_id } = req.params;

    try {
        const result = await authService.revokeToken(user_id);

        res.status(200).json({ success: true});
    } catch (error) {
        next(error)
    }
}

exports.signOut = async (req, res, next) => 
{
    const { user_id } = req.user;
    const ip = req.ip;

    try {
         res.clearCookie('authToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });

        await authService.revokeToken(user_id);

        await authService.logActvity(user_id, "USER LOGGED OUT", ip)

        res.status(200).json({ success : true})
    } catch (error) {
        
    }

}

exports.deleteUser = async (req , res , next ) => 
{
    const { user_id } = req.user;
    const ip = req.ip;

    try {
        await authService.logActvity(user_id, 'ACCOUNT DELETION', ip);
        await authService.deleteById(user_id);


        res.json({ success: true });

    } catch (error) {
        next(error)
    }
}