import jwt from 'jsonwebtoken';
import User from "../model/user.model.js";
//verify jwt
const verifyJwt = async(req,_, next) => {
  const token = req.cookies.accessToken || req.header("Authorization")?.replace("Bearer", "")
  if(!token){

  }
  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    if(!user){
      throw new ApiError(401, "Unauthorized , token not found")
    }
    req.user = user
    next()
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token")
  }
}
//verify role
const verifyRole = (roles) => {
    return async (req, res, next) => {
        try {
          const user = await User.findById(req.user.id).populate('role')
          if(!user || !roles.map(role => role.toLowerCase()).includes(user?.role?.name?.toLowerCase())){
            //make into api response
            return res.status(403).json({ message: "Access denied" });
          }
          next();  
        } catch (error) {
            //make into api error
            res.status(500).json({ message: "Internal server error" });
        }
    }
}

export {
  verifyJwt,
  verifyRole
}