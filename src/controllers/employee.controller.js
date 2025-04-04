import {Role} from "../model/role.model.js";
import {Employee} from "../model/employee.model.js";
import { registerUser } from "./user.controller.js";
import {asyncHandler} from "../utils/AsyncHandler.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {ApiError} from "../utils/ApiError.js";
import { User } from "../model/user.model.js";

const createEmployee = asyncHandler(async(req, res) => {
    try {
        const {name, email, password, phoneNo, position, department, role} = req.body;
        
        // Validate fields
        if(!name || !email || !password || !phoneNo || !position || !department || !role) {
            throw new ApiError(400, "All fields are required")
        }

        // Check for existing employee once
        const existingEmployee = await Employee.findOne({email});
        if(existingEmployee){
            return res.status(200).json(
                new ApiResponse(200, existingEmployee, "Employee already exists")
            )
        }

        // Handle role
        let roleId = await Role.findOne({ name: role.toLowerCase() });
        if (!roleId) {
            try {
                roleId = await Role.create({ name: role.toLowerCase() });
                // Wait for the role to be properly saved
                await roleId.save();
            } catch (error) {
                throw new ApiError(500, `Role creation failed: ${error.message}`);
            }
        }

        // Create user if doesn't exist
        let newUser = await User.findOne({email});
        if(!newUser){
            try {
                if (!roleId?._id) {
                    throw new ApiError(500, "Role ID is not properly initialized");
                }
                
                newUser = await registerUser({
                    username: email.split('@')[0],
                    email, 
                    fullname: name,
                    password,
                    roleId: roleId // Pass the entire role document
                });
                await newUser.save();

                if (!newUser?._id) {
                    throw new ApiError(500, "User creation failed - no ID returned");
                }
            } catch (error) {
                throw new ApiError(500, `User creation failed: ${error.message}`);
            }
        }

        const employee = await Employee.create({
            employeeId: newUser._id,
            name: newUser.fullname,
            email: newUser.email,
            phoneNo,
            department,
            position,
            joiningDate: new Date(),
        });

        return res.status(201).json(
            new ApiResponse(201, employee, "Employee created successfully")
        );

    } catch (error) {
        if(error.message !== "Employee already exists" && newUser?._id) {
            await User.findByIdAndDelete(newUser._id);
        }
        console.log("Employee creation failed:", error);
        throw new ApiError(error.statusCode || 500, error.message || "Employee creation failed")
    }
})
const getAllEmployees = asyncHandler(async(req, res) => {
    console.log("Fetching all employees")
    try {
        const employees = await Employee.find().populate('employeeId');
        
        if(!employees || employees.length === 0) {
            return res.status(200).json(
                new ApiResponse(200, [], "No employees found")
            );
        }
        
        return res.status(200).json(
            new ApiResponse(200, employees, "Employees fetched successfully")
        );
    } catch (error) {
        console.log("Error fetching employees", error?.message);
        throw new ApiError(500, "Error fetching employees", error?.error);
    }
})
const getEmployeeById = asyncHandler(async(req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if(!employee){
            return res.status(200).json(
                new ApiResponse(200, undefined, "User not found")
            )
        }
        return res.status(200).json(
            new ApiResponse(200, employee, "Employee fetched successfully")
        )
    } catch (error) {
        console.log("Error finding employee by id", error?.message)
        throw new ApiError(401, "Error finding employee by id", error?.error)
    }
})
const updateEmployee = asyncHandler(async(req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if(!employee){
            return res.status(200).json(
                new ApiResponse(200, undefined, "User not found")
            )
        }
        const updatedEmployee = await Employee.findByIdAndUpdate(
            req.params.id,
            req.body,
            {new: true}
        )
        return res.status(200).json(
            new ApiResponse(200, updatedEmployee, "Employee updated successfully")
        )
    } catch (error) {
        console.log("Error finding employee by id", error?.message)
        throw new ApiError(401, "Error finding employee by id", error?.error)
    }
})
const deleteEmployee = asyncHandler(async(req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        await User.findByIdAndDelete(employee.employeeId);
        await Employee.findByIdAndDelete(employee);
        return res.status(200).json(
            new ApiResponse(200, undefined, "Employee deleted successfully")
        )
    } catch (error) {
        console.log("Error deleting employee", error?.message)
        throw new ApiError(401, "Error deleting employee", error?.error)
    }
})
const getData = asyncHandler(async(req, res) => {
    try {
        const employees = await Employee.find().populate('employeeId');
        if(!employees || employees.length === 0) {
            return res.status(200).json(
                new ApiResponse(200, [], "No employees found")
            );
        }
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename=employees.json');
        res.send(JSON.stringify(employees, null, 2));
        res.end();
    } catch (error) {
        console.log("Error fetching employees data", error?.message);
        throw new ApiError(500, "Error fetching employees data", error?.error); 
    }
})
const searchEmployee = asyncHandler(async(req, res)=> {
    try {
        const {query} = req.query
        if(!query){
            return res.status(200).json(
                new ApiResponse(200, [], "No query found")
            );
        }
        const employees = await Employee.find(
            { $text: { $search : query}},// Project the text search score
            { score: {$meta: "textScore"}}
        ).sort({ score: { $meta: "textScore"}});

        return res.status(200).json(
            new ApiResponse(200, employees, "Employees fetched successfully using filter")
        );
    } catch (error) {
        console.log("Filter search failed", error?.message)
        throw new ApiError(500, "Error retrieving data")
    }
})

export {
    createEmployee,
    getAllEmployees,
    getEmployeeById,
    updateEmployee,
    deleteEmployee,
    getData,
    searchEmployee
}