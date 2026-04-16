import Attendance from '../models/Attendance.js';

// @desc    Get attendance records
// @route   GET /api/attendance
// @access  Private
const getAttendance = async (req, res, next) => {
  try {
    const attendance = await Attendance.find().sort({ date: -1 }).limit(30);

    res.json({ data: attendance });
  } catch (err) {
    next(err);
  }
};

export { getAttendance };
