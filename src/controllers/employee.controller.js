import {Role} from "../model/role.model.js";
import {Employee} from "../model/employee.model.js";
import { registerUser } from "./user.controller.js";
import {asyncHandler} from "../utils/AsyncHandler.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {ApiError} from "../utils/ApiError.js";
import { User } from "../model/user.model.js";

const createEmployee = asyncHandler(async(req, res) => {
    try {
        console.log(req.body)
        const {name, email, password, phoneNo, position, department, role} = req.body;
        if(!name || !email || !password || !phoneNo || !position || !department || !role) {
            throw new ApiError(400, "All fields are required")
        }
        let existingEmployee = await Employee.findOne({email});
        if(existingEmployee){
            return res.status(200).json(
                new ApiResponse(200, existingEmployee, "Employee already exists")
            )
        }

        // First try to find if role already exists
        let roleId = await Role.findOne({ name: role.toLowerCase() });
    
        // If role doesn't exist, create it
        if (!roleId) {
            roleId = await Role.create({ name: role.toLowerCase() });
            if (!roleId) {
                throw new ApiError(500, "Role not created while registering a user")
            }
        }
        console.log("Role:", roleId);

        let newUser = await User.findOne({email});
        if(!newUser){
            try {
                newUser = await registerUser({
                    username: email.split('@')[0], // Create username from email
                    email, 
                    fullname: name,
                    password: password,
                    roleId // Pass the role ID, not the entire role object
                });
            } catch (error) {
                throw new ApiError(500, `NewUser creation failed: ${error.message}`)
            }
        }
        console.log(newUser)

        const employeeData = {  // Fixed typo from employeData to employeeData
            employeeId: newUser._id,
            name: newUser.fullname,
            email: newUser.email,
            phoneNo,
            department,
            position,
            joiningDate: new Date(),
        };
        console.log("Creating employee with data:", employeeData);
        let employee = await Employee.findOne({email});
        if(employee){
            return res.status(200).json(
                new ApiResponse(200, employee, "Employee already exists")
            )
        }
        
        try {
            employee = await Employee.create(employeeData);  // Using correct variable name
        } catch (error) {
            console.log("Error creating employee:", error);
            // Cleanup the created user if employee creation fails
            await User.findByIdAndDelete(newUser._id);
            throw new ApiError(500, `Employee object creation failed: ${error.message}`);
        }
        console.log(employee)

        return res
        .status(201)
        .json( new ApiResponse(201, employee, "Employee created successfully"))
    } catch (error) {
        console.log("Employee creation failed")
        throw new ApiError(500, "Employee was not created while registering a user")
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
    //get all the employee in a csv file
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

export {
    createEmployee,
    getAllEmployees,
    getEmployeeById,
    updateEmployee,
    deleteEmployee,
    getData
}