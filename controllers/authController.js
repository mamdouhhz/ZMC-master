const mongoose = require('mongoose');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

const User = require('../models/userModel');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expiresIn: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 1000 * 60 * 60 * 24
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  // prevent password from showing on create
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};
// Specialist login
exports.login = catchAsync(async (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password)
    return next(new AppError('من فضلك ادخل الاسم وكلمة السر', 400));

  const user = await User.findOne({ username, role: 'اخصائي' }).select(
    '+password'
  );

  if (!user || !(await user.correctPassword(password, user.password)))
    return next(
      new AppError('خطأ في اسم المستخدم او كلمة السر ، حاول مرة أخرى', 401)
    );

  createSendToken(user, 200, res);
});

// Class Login
exports.classLogin = catchAsync(async (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password)
    return next(new AppError('من فضلك ادخل الاسم وكلمة السر', 400));

  const user = await User.findOne({ username, role: 'رعاية نهارية' }).select(
    '+password'
  );

  if (!user || !(await user.correctPassword(password, user.password)))
    return next(
      new AppError('خطأ في اسم المستخدم او كلمة السر ، حاول مرة أخرى', 401)
    );

  createSendToken(user, 200, res);
});

exports.adminLogin = catchAsync(async (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password)
    return next(new AppError('من فضلك ادخل الاسم وكلمة السر', 400));

  const user = await User.findOne({ username, role: 'ادمن' }).select(
    '+password'
  );
  console.log(user);

  console.log(`password: ${password}`);
  console.log(`user.password: ${user.password}`);
  if (!user || !(await user.correctPassword(password, user.password)))
    return next(
      new AppError('خطأ في اسم المستخدم او كلمة السر ، حاول مرة أخرى', 401)
    );

  createSendToken(user, 200, res);
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedOut', {
    expiresIn: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({ status: 'success' });
};

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Get the token and check if it exists
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) return next(new AppError('من فضلك سجل دخولك أولا', 401));

  // 2) Verify token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists not deleted
  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(new AppError('من فضلك سجل دخول اولا', 401));
  }
  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('عفوا! ليس لديك الصلاحية لهذا الطلب', 403));
    }
    next();
  };
};