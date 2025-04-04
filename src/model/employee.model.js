import mongoose, { Schema } from "mongoose";

const employeeSchema = new Schema(
    {
        employeeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        name: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        phoneNo: {
            type: Number,
            required: +91,
            unique: true,
            lowercase: true,
            trim: true,
        },
        department: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },
        position:{
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },
        joiningDate: {
            type: Date,
            required: true,
            validate: {
                validator: function(value){
                    return value <= new Date();
                },
                message: 'Joining date cannot be in the future'
            },
            default: Date.now
        }
    },
    {timestamps: true}
)

export const Employee = mongoose.model("Employee", employeeSchema)