import User from '../models/User.js';

// @desc    Get all employees (with pagination and filtering)
// @route   GET /api/employees
// @access  Private (All authenticated)
const getEmployees = async (req, res, next) => {
  try {
    const pageSize = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;

    // Filter build up
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.dept) filter.dept = req.query.dept;
    if (req.query.status) filter.status = req.query.status;

    // Search by name optionally
    if (req.query.name) {
      filter.name = {
        $regex: req.query.name,
        $options: 'i',
      };
    }

    const count = await User.countDocuments(filter);
    const employees = await User.find(filter)
      .select('-password') // Never return passwords
      .sort({ createdAt: -1 }) // Newest first
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    // Response structure strictly matching frontend contract + future proofing
    res.json({
      data: employees,
      page,
      pages: Math.ceil(count / pageSize),
      total: count,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get a single employee
// @route   GET /api/employees/:id
// @access  Private
const getEmployeeById = async (req, res, next) => {
  try {
    const employee = await User.findById(req.params.id).select('-password');
    if (employee) {
      res.json({ data: employee });
    } else {
      res.status(404);
      throw new Error('Employee not found');
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Create an employee
// @route   POST /api/employees
// @access  Private/Admin
const createEmployee = async (req, res, next) => {
  try {
    const { empId, name, role, dept, email, password, phone, status, joinDate, avatar } = req.body;

    const userExists = await User.findOne({ email });
    const empIdExists = await User.findOne({ empId });

    if (userExists) {
      res.status(400);
      throw new Error('User with this email already exists');
    }

    if (empIdExists) {
      res.status(400);
      throw new Error('User with this Employee ID already exists');
    }

    const employee = await User.create({
      empId,
      name,
      role,
      dept,
      email,
      password: password || 'Default@123', // Admin handles first password
      phone,
      status: status || 'Active',
      joinDate: joinDate || new Date().toISOString().split('T')[0],
      avatar,
    });

    if (employee) {
      res.status(201).json({
        data: {
          _id: employee._id,
          empId: employee.empId,
          name: employee.name,
          email: employee.email,
          role: employee.role,
        },
      });
    } else {
      res.status(400);
      throw new Error('Invalid employee data');
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Private/Admin/HR
const updateEmployee = async (req, res, next) => {
  try {
    const employee = await User.findById(req.params.id);

    if (!employee) {
      res.status(404);
      throw new Error('Employee not found');
    }

    // Standard employee protection: Only HR/Admin can update another user's info. 
    // Standard employee can only update themselves (and only specific fields).
    if (req.user.role !== 'Admin' && req.user.role !== 'HR' && req.user._id.toString() !== employee._id.toString()) {
       res.status(403);
       throw new Error('You can only update your own profile');
    }

    // Role restrictions
    if (req.body.role && req.user.role !== 'Admin') {
      res.status(403);
      throw new Error('Only an Admin can change roles');
    }

    employee.name = req.body.name || employee.name;
    employee.email = req.body.email || employee.email;
    employee.dept = req.body.dept !== undefined ? req.body.dept : employee.dept;
    employee.role = req.body.role || employee.role;
    employee.phone = req.body.phone !== undefined ? req.body.phone : employee.phone;
    employee.status = req.body.status || employee.status;
    employee.joinDate = req.body.joinDate || employee.joinDate;
    employee.avatar = req.body.avatar !== undefined ? req.body.avatar : employee.avatar;

    if (req.body.password) {
      employee.password = req.body.password;
    }

    const updatedEmployee = await employee.save();

    // Prevent returning password
    updatedEmployee.password = undefined;

    res.json({ data: updatedEmployee });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete employee
// @route   DELETE /api/employees/:id
// @access  Private/Admin
const deleteEmployee = async (req, res, next) => {
  try {
    const employee = await User.findById(req.params.id);

    if (employee) {
      await User.deleteOne({ _id: employee._id });
      res.json({ success: true, message: 'Employee removed' });
    } else {
      res.status(404);
      throw new Error('Employee not found');
    }
  } catch (err) {
    next(err);
  }
};

export { getEmployees, getEmployeeById, createEmployee, updateEmployee, deleteEmployee };
