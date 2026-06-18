const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { sendEmail } = require('../utils/email');

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (user && (await user.matchPassword(oldPassword))) {
      user.password = newPassword; // Trigger pre-save hook to hash
      await user.save();
      res.json({ message: 'Password changed successfully' });
    } else {
      res.status(400).json({ message: 'Invalid current password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const tempPassword = Math.random().toString(36).substring(2, 10);
    user.password = tempPassword; // Trigger pre-save hook to hash
    await user.save();

    await sendEmail({
      to: email,
      subject: 'Temporary Password Reset - By Jonathan Studio',
      text: `Hello ${user.name},\n\nWe received a request to reset your password.\n\nYour temporary password is: ${tempPassword}\n\nPlease log in to the admin panel using this temporary password and change it in the Settings panel immediately.\n\nBest Regards,\nBy Jonathan Studio`
    });

    res.json({ message: 'Temporary password sent to email' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { 
  authUser, 
  registerUser,
  changePassword,
  forgotPassword
};
