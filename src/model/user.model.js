import mongoose, {Schema} from "mongoose";

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        fullname: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        password:{
            type: String,
            required: [true, "Password is required"] //error when password is not provided is also provided
        },
        refreshToken: {
            type: String
        },
        role:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Role",
            required: true
        },
    },
    {timestamps: true}
)
export default User = mongoose.model("User", userSchema);
//implement auth