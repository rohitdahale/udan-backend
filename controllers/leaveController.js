import Leave from '../models/Leave.js';

// @desc    Get all leaves
// @route   GET /api/leaves
// @access  Private
const getLeaves = async (req, res, next) => {
  try {
    // If standard employee, only see their own leaves. If Admin/HR, see all.
    const filter = {};
    if (req.user.role === 'Employee') {
      filter.empId = req.user.empId;
    }

    const leaves = await Leave.find(filter).sort({ createdAt: -1 });

    // Ensure frontend compatibility wrapped in "data" array
    res.json({ data: leaves });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a leave request
// @route   POST /api/leaves
// @access  Private
const createLeave = async (req, res, next) => {
  try {
    const { type, startDate, endDate, reason } = req.body;
    let { empId, empName } = req.body;

    // Standard employee is confined to their own ID
    if (req.user.role === 'Employee' || !empId) {
      empId = req.user.empId;
      empName = req.user.name;
    }

    const leave = await Leave.create({
      empId,
      empName,
      type,
      startDate,
      endDate,
      reason,
      status: 'Pending',
      comments: []
    });

    res.status(201).json({ data: leave });
  } catch (err) {
    next(err);
  }
};

// @desc    Update a leave request
// @route   PUT /api/leaves/:id
// @access  Private
const updateLeave = async (req, res, next) => {
  try {
    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      res.status(404);
      throw new Error('Leave record not found');
    }

    // Only HR/Admin can modify status
    if (req.body.status && req.user.role === 'Employee') {
      res.status(403);
      throw new Error('Unauthorized to approve/reject leaves');
    }
    
    // Updates
    leave.status = req.body.status || leave.status;
    leave.type = req.body.type || leave.type;
    leave.startDate = req.body.startDate || leave.startDate;
    leave.endDate = req.body.endDate || leave.endDate;
    leave.reason = req.body.reason || leave.reason;

    if (req.body.comment) {
      leave.comments.push(req.body.comment);
    }

    const updatedLeave = await leave.save();

    res.json({ data: updatedLeave });
  } catch (err) {
    next(err);
  }
};

export { getLeaves, createLeave, updateLeave };
