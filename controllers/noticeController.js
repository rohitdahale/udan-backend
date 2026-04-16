import Notice from '../models/Notice.js';

// @desc    Get all notices
// @route   GET /api/notices
// @access  Private
const getNotices = async (req, res, next) => {
  try {
    const notices = await Notice.find().sort({ createdAt: -1 });

    res.json({ data: notices });
  } catch (err) {
    next(err);
  }
};

export { getNotices };
