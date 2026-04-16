import User from '../models/User.js';

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res, next) => {
  try {
    const totalEmployees = await User.countDocuments();
    
    // Departments count - aggregate unique departments
    const departmentsArray = await User.distinct('dept');
    const departmentsCount = departmentsArray.filter(d => d).length; // Filter out null/undefined

    // Recent hires - past 30 days logic based on joinDate
    // For now we get the last 5 added users to proxy "recent hires" count
    const recentHires = await User.countDocuments({
      createdAt: { $gte: new Date(new Date() - 30 * 24 * 60 * 60 * 1000) }
    });

    // TEMPORARY PHASE 2 MOCK: Attendance and Leaves (Until Phase 3 Schemas)
    // We'll return hardcoded logical values based on totalEmployees
    const presentToday = Math.floor(totalEmployees * 0.9); // 90% attendance mock
    const onLeave = totalEmployees - presentToday; 

    res.json({
      data: {
        totalEmployees,
        presentToday,
        onLeave,
        departmentsCount,
        recentHires
      }
    });
  } catch (err) {
    next(err);
  }
};

export { getDashboardStats };
