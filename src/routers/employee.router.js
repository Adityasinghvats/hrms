import { Router } from "express";
import { verifyRole, verifyJwt } from "../middlewares/auth.middleware";
import { 
    createEmployee,
    getAllEmployees,
    getEmployeeById,
    updateEmployee,
    deleteEmployee,
    getData
} from "../controllers/employee.controller.js"

const router = Router()
router.route("/").post(verifyJwt, verifyRole(["admin"]), createEmployee);
router.route("/").get(verifyToken, getAllEmployees);
router.route("/:id").get(verifyToken, getEmployeeById);
router.route("/:id").put(verifyToken, verifyRole(["admin"]), updateEmployee);
router.route("/:id").delete(verifyToken, verifyRole(["admin"]), deleteEmployee);
router.route("/").get(verifyToken, verifyRole(["admin"]), getData);

export default router;