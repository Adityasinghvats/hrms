import Role from "../model/role.model.js";
import User from "../model/user.model.js";
import Employee from "../model/employee.model.js";
import mongoose from "mongoose";
//create employee
//create role assign that to role for when creating user
//create user assign role and then add user._id to employeeId
const createEmployee = async(req, res) => {
    //add error handling for when user is not created or role is not created
    const {name, email, password, phoneNo, position, department, role} = req.body;
    const roleId = await Role.create({name:role});
    const userId = await User.create({
        username: name,
        email: email,
        fullname: name,
        password: password,
        role: roleId._id
    })
    const employee = await Employee.create({
        employeeId: userId._id,
        name,
        email,
        phoneNo,
        department,
        position,
        joiningDate: new Date(),
    })
}
//get all employee
//get employee by id
//update employee by id
//delete employee by id
//search for employee based on query parameter with search endpoint and parameter as query string
// export -> all data in json format