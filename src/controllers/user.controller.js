import {User} from "../model/user.model.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {asyncHandler} from "../utils/AsyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import jwt from 'jsonwebtoken';

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        if(!user){
            throw new ApiError(500, "User not found while trying to genrate access and refresh token")
        }
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
    
        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false})
        return {accessToken, refreshToken}
    } catch (error) {
        console.log("Failed to generate access and refresh token", error);
        
        throw new ApiError(500, "Failed to generate access and refresh token")
    }
}
const loginUser = asyncHandler(async(req, res) => {
    console.log("Login request incoming")
    const { email, password} = req.body
    if(!email || !password){
        throw new ApiError(400, "Email and password is required");
    }
    const user = await User.findOne({
       email
    }).select("+password");
    if(!user){
        throw new ApiError(401, "User with email or username not found")
    }
    const isPasswordValid = await user.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiError(401, "Invalid user credentials");
    }
    const {accessToken, refreshToken} = await 
    generateAccessAndRefreshToken(user._id);
    const loggedInUser = await User.findById(user._id).populate('role')
    .select("-password -refreshToken")//return everything except password and token
    if(!loggedInUser){
        throw new ApiError(401, "Logged in user not found in DB");
    }
    const options = {
        httpOnly: true,
        sceure: process.eventNames.NODE_ENV === "production"
    }
    //added rolename in res to verify admin in frontend
    console.log(loggedInUser?.role?.name)
    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(
        200, 
        {user: loggedInUser, accessToken: accessToken, roleName: loggedInUser?.role?.name}, 
        "User logged in successfully"
    ))
})
const logoutuser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken: undefined,
            }
        },
        {new: true}
    )
    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
    }
     return res
     .status(200)
     .clearCookie("accessToken", options)
     .clearCookie("refreshToken", options)
     .json(new ApiResponse(200, "User logged out successfully"))
})
const refreshAccessToken = asyncHandler(async(req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if(!incomingRefreshToken){
        throw new ApiError(401, "Unauthorized request")
    }
    try {
       const decodedToken = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
       )
       const user = await User.findById(decodedToken?._id) 
       if(!user){
        throw new ApiError(401, "Invalid refresh token")
       }
       if(incomingRefreshToken !== user?.refreshToken){
        throw new ApiError(401, "Refresh token is expired or used")
       }

       const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV==="production",
       }
       const {accessToken, refreshToken: newRefreshToken} = 
       await generateAccessAndRefreshToken(user._id)
       return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json( new ApiResponse(
            200, 
            {accessToken, refreshToken: newRefreshToken}, 
            "User logged in successfully"
        ));

    } catch (error) {
        throw new ApiError(500,
            "Something went wrong while refreshing access token")
    }
})

export {
    loginUser,
    logoutuser,
    refreshAccessToken
}