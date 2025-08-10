const Session = require('../models/sessionModel');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const APIFeatures = require('../utils/APIFeatures');

exports.createSession = catchAsync(async (req, res, next) => {
  const session = await Session.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      session,
    },
  });
});

exports.getSession = catchAsync(async (req, res, next) => {
  const session = await Session.findById(req.params.id);

  res.status(200).json({
    status: 'success',
    data: {
      session,
    },
  });
});

exports.getAllSessions = catchAsync(async (req, res, next) => {
  const { results, metadata } = await new APIFeatures(Session.find(), req.query)
    .filter()
    .sort('day')
    .limitFields()
    .search('patient')
    .paginate();

  //   if (results.length === 0)
  //     return next(new AppError('لم يتم العثور على أي مستخدم.'));
  //   console.log(results[0].patient);

  res.status(200).json({
    status: 'success',
    metadata: {
      totalElements: metadata.totalResult,
      totalPages: metadata.totalPages,
      currentPage: req.query.page * 1,
      pageSize: req.query.limit * 1,
    },
    data: {
      results,
    },
  });
});

//? Will have deleteSession?

exports.deleteSession = catchAsync(async (req, res, next) => {
  const session = await Session.findByIdAndDelete(req.params.id);

  // if(!session) return next(new AppError('No sessions found!', 400))

  res.status(200).json({
    status: 'success',
  });
});

// SPECIALISTS ACCESS
//--------------------------------

exports.getMyTodaySessions = catchAsync(async (req, res, next) => {
  // Function to create a dailyTimeTable for today (convert الأحد to الاحد)
  const convertDayName = (dayName) => {
    return dayName.replace('أ', 'ا').replace('إ', 'ا').replace('آ', 'ا');
  };
  const today = new Date();
  const dayOfWeek = today.toLocaleDateString('ar-EG', { weekday: 'long' }); // Use 'ar-EG' for Arabic (Egypt) locale
  const formattedDayOfWeek = convertDayName(dayOfWeek);

  const sessions = await Session.find({
    department: req.user.department,
    day: formattedDayOfWeek,
  });

  res.status(200).json({
    status: 'success',
    results: sessions.length,
    data: {
      sessions,
    },
  });
});

exports.getMySessions = catchAsync(async (req, res, next) => {
  const sessions = await Session.find({
    department: req.user.department,
  });

  res.status(200).json({
    status: 'success',
    results: sessions.length,
    data: {
      sessions,
    },
  });
});

exports.getSpecialistSessions = catchAsync(async (req, res, next) => {
  const sessions = await Session.find({
    specialist: req.params.specialistId,
  });

  res.status(200).json({
    status: 'success',
    results: sessions.length,
    data: {
      sessions,
    },
  });
});
