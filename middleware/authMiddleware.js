const { verifyAccessToken } = require ('../utils/jwtUtils')


function authenticate(req , res , next){
    try {
        const token = req.cookies[process.env.COOKIE_NAME];
        console.log(req.cookies)


        if(!token) {
            return res.status(401).json({ message: 'No access token provided'})
        } 

        const payload = verifyAccessToken(token);

        req.user = {
            user_id: payload.user_id,
            role: payload.role
        }

        if(!payload) {
            return res.status(403).json({message: 'Invalid or expired access token'})
        }

        next();

    } catch (error) {
        next(error)
    }
}

module.exports = { authenticate }