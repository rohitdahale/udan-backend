import express from 'express';
import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from '../controllers/employeeController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

router
  .route('/')
  .get(protect, getEmployees)
  .post(protect, authorizeRoles('Admin'), createEmployee);

router
  .route('/:id')
  .get(protect, getEmployeeById)
  // HR can also update employee details
  .put(protect, authorizeRoles('Admin', 'HR', 'Employee'), updateEmployee)
  .delete(protect, authorizeRoles('Admin'), deleteEmployee);

export default router;
