const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  let token;

  // Get token from header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Also try to get token from cookies
  if (!token && req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};


exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    console.log('User info in restrictTo:', req.user);
    const userRole = String(req.user?.role); // 🔧 force string
    if (!roles.includes(userRole)) {
      console.log('Access denied for role:', userRole);
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
};
