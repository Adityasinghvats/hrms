import jwt from 'jsonwebtoken';
import User from "../model/user.model.js";
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
//verify jwt
const verifyJwt = async(req,_, next) => {
  const token = req.cookies.accessToken || req.header("Authorization")?.replace("Bearer", "")
  if(!token){
    throw new ApiError(401, "Unauthorized , token not found")
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
            return res.status(403).json(new ApiResponse(403, user, "Access denied"));
          }
          next();  
        } catch (error) {
            throw new ApiError(500, error?.message || "Internal server error");
        }
    }
}

export {
  verifyJwt,
  verifyRole
}