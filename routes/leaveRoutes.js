import express from 'express';
import { getLeaves, createLeave, updateLeave } from '../controllers/leaveController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getLeaves)
  .post(protect, createLeave);

router.route('/:id')
  .put(protect, authorizeRoles('Admin', 'HR', 'Employee'), updateLeave);

export default router;
