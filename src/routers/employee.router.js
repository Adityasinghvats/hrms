import { Router } from "express";
import { verifyRole, verifyJwt } from "../middlewares/auth.middleware.js";
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
// router.route("/").post(createEmployee);
router.route("/").get(getAllEmployees);
router.route("/download").get(verifyJwt, verifyRole(["admin"]), getData);
router.route("/:id").get(verifyJwt, getEmployeeById);
router.route("/:id").put(verifyJwt, verifyRole(["admin"]), updateEmployee);
router.route("/:id").delete(verifyJwt, verifyRole(["admin"]), deleteEmployee);

export default router;