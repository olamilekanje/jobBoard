const jwt = require('jsonwebtoken'); 
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  try {
    const token = req.cookies.token; // match the cookie name from login
    if (!token) {
      return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user by ID
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) {
      return res.status(401).json({ error: 'User not found, authorization denied' });
    }

    next();
  } catch (error) {
    res.status(401).json({ error: 'Not authorized, token failed' });
  }
};


exports.adminOnly = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admins only' });
  next();
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
