import jwt from 'jsonwebtoken';
import {User} from "../model/user.model.js";
import {ApiError} from '../utils/ApiError.js';
import {ApiResponse} from '../utils/ApiResponse.js';
//verify jwt
const verifyJwt = async(req,_, next) => {
  const token = req.cookies.accessToken || req.header("Authorization")?.replace("Bearer ", "")
  if(!token){
    return res.status(401).json(new ApiResponse(401, "Unauthorized, user not found"));
  }
  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    if(!user){
      return res.status(401).json(new ApiResponse(401, user, "Unauthorized, user not found"));
    }
    req.user = user
    next()
  } catch (error) {
    return res.status(401).json(new ApiResponse(401, null, error?.message || "Invalid access token"));
  }
}
//verify role
const verifyRole = (roles) => {
    return async (req, res, next) => {
        try {
          const user = await User.findById(req.user.id).populate('role')
          if(!user || !roles.map(role => role.toLowerCase()).includes(user?.role?.name?.toLowerCase())){
            return res.status(403).json(new ApiResponse(403, "Access denied"));
          }
          req.user = user;
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