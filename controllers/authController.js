import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Generate Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      // Structure matches frontend `api.js` expectations
      res.json({
        token: generateToken(user._id),
        user: {
          id: user.empId,
          name: user.name,
          role: user.role.toLowerCase() === 'admin' ? 'admin' : user.role.toLowerCase() === 'hr' ? 'hr' : 'employee',
          originalRole: user.role,
        },
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile (current user)
// @route   GET /api/auth/me
// @access  Private
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        user: {
          id: user.empId,
          name: user.name,
          role: user.role.toLowerCase() === 'admin' ? 'admin' : user.role.toLowerCase() === 'hr' ? 'hr' : 'employee',
          originalRole: user.role,
        },
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

export { authUser, getUserProfile };
