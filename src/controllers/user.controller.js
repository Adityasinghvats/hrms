import User from "../model/user.model.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {asyncHandler} from "../utils/AsyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import jwt from 'jsonwebtoken';
//login,logout,refreshtoken
//create refreshtoken so that  we can use it while creating the user
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
const registerUser = asyncHandler(async (req, res) => {
    const {name, email, password, role} = req.body
    if(
        [name, email, password, role].some((field) => field?.trim()==="")
      ){
          throw new ApiError(400, "All fields are required")
      }
      //check if user already exists in mongodb using or operator
      const existedUser = await User.findOne({
          $or: [{username}, {email}]
      })
  
      if(existedUser){
          throw new ApiError(409, "User with email or username already exists")
      }
    try {
        const user = await User.create({
            username: name,
            email: email,
            fullname: name,
            password: password,
            role: role._id
        })
        const createdUser = await User.findById(user._id).select("-password -refreshToken")
        if(!createdUser){
            throw new ApiError(500, "User not created while registering a user")
        }
        return res
        .status(201)
        .json( new ApiResponse(201, createdUser, "User registered successfully"))
    } catch (error) {
        console.log("user creation failed");
        throw new ApiError(500, "User not created while registering a user and images where deleted")

    }
})
const loginUser = asyncHandler(async(req, res) => {
    const {name, email, password} = req.body
    if(!email || !password){
        throw new ApiError(400, "Email and password is required");
    }
    const user = User.findOne({
        $or: [{name}, {email}]
    })
    if(!user){
        throw new ApiError(409, "User with email or username not found")
    }
    const isPasswordValid = await user.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiError(409, "Invalid user credentials");
    }
    const {accessToken, refreshToken} = await 
    generateAccessAndRefreshToken(user._id);
    const loggedInUser = await User.findById(user._id)
    .select("-password -refreshToken")
    if(!loggedInUser){
        throw new ApiError(409, "Logged in user not found in DB");
    }
    const options = {
        httpOnly: true,
        sceure: process.eventNames.NODE_ENV === "production"
    }
    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(
        200, 
        {user: loggedInUser, accessToken: accessToken}, 
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

})

export {
    loginUser,
    logoutuser,
    registerUser,
    refreshAccessToken
}