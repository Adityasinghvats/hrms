import Role from "../model/role.model.js";
import Employee from "../model/employee.model.js";
import { registerUser } from "./user.controller.js";
import {asyncHandler} from "../utils/AsyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

const createEmployee = asyncHandler(async(req, res) => {
    //add error handling for when user is not created or role is not created
    try {
        const {name, email, password, phoneNo, position, department, role} = req.body;
        const roleId = await Role.create({name:role});
        if(!roleId){
            throw new ApiError(500, "Role not created while registering a user")
        }
        const newUser = await registerUser({name, email, password, roleId})
        if(!newUser){
            throw new ApiError(500, "User not created while registering a user")
        }
        const employee = await Employee.create({
            employeeId: newUser._id,
            name,
            email,
            phoneNo,
            department,
            position,
            joiningDate: new Date(),
        })
        if(!employee){
            throw new ApiError(500, "Employee not created while registering a user")
        }
        return res
        .status(201)
        .json( new ApiResponse(201, employee, "Employee created successfully"))
    } catch (error) {
        console.log("Employee creation failed")
        throw new ApiError(500, "Employee was not created while registering a user")
    }
})
const getAllEmployees = asyncHandler(async(req, res) => {
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
            new ApiResponse(200, updatedEmployee, "Employee fetched successfully")
        )
    } catch (error) {
        console.log("Error finding employee by id", error?.message)
        throw new ApiError(401, "Error finding employee by id", error?.error)
    }
})
const deleteEmployee = asyncHandler(async(req, res) => {
    try {
        await Employee.findByIdAndDelete(req.params.id);
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