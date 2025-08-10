const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

const Timetable = require('../models/timetableModel');
const Session = require('../models/sessionModel');

// Function to create a dailyTimeTable for today (convert الأحد to الاحد)
const convertDayName = (dayName) => {
  return dayName.replace('أ', 'ا').replace('إ', 'ا').replace('آ', 'ا');
};

exports.getTimetable = catchAsync(async (req, res, next) => {
  const today = new Date();
  const formattedToday = today.toISOString().split('T')[0];
  const dayOfWeek = today.toLocaleDateString('ar-EG', { weekday: 'long' }); // Use 'ar-EG' for Arabic (Egypt) locale
  const formattedDayOfWeek = convertDayName(dayOfWeek);

  const timetableDate = req.query.date; // Retrieve date from query string

  //1) Check if there is a timetable in the database
  let timetable = await Timetable.findOne({ date: timetableDate });

  // If no timetable for this date,
  // then check if this date is today, if so create a timetable for today
  // if else return no timetable found
  if (!timetable) {
    if (timetableDate !== formattedToday)
      return next(new AppError('جدول اليوم غير موجود', 404));

    timetable = await Timetable.create({
      date: formattedToday,
      day: formattedDayOfWeek,
      sessions: [],
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      timetable,
    },
  });
});

exports.addPresentPatient = catchAsync(async (req, res, next) => {
  const today = new Date();
  const formattedToday = today.toISOString().split('T')[0];
  const dayOfWeek = today.toLocaleDateString('ar-EG', { weekday: 'long' }); // Use 'ar-EG' for Arabic (Egypt) locale
  const formattedDayOfWeek = convertDayName(dayOfWeek);

  const timetable = await Timetable.findOne({ date: formattedToday });

  if (!timetable) return next(new AppError('جدول اليوم غير متاح', 404));

  const patientTodaySessions = await Session.find({
    patient: req.params.id,
    day: formattedDayOfWeek,
  });

  if (patientTodaySessions.length === 0)
    return next(new AppError('هذا المريض ليس لديه أي جلسات اليوم', 400));

  timetable.sessions.push(...patientTodaySessions);
  await timetable.save();

  res.status(200).json({
    status: 'success',
    timetable,
  });
});

exports.updateSessionStatus = catchAsync(async (req, res, next) => {
  const today = new Date();
  const formattedToday = today.toISOString().split('T')[0];
  const dayOfWeek = today.toLocaleDateString('ar-EG', { weekday: 'long' }); // Use 'ar-EG' for Arabic (Egypt) locale
  const formattedDayOfWeek = convertDayName(dayOfWeek);

  const timetable = await Timetable.findOne({ date: formattedToday });

  if (!timetable)
    return next(new AppError('جدول اليوم غير متاح لتغيير حضور الجلسة', 404));

  let sessionFound = false;

  timetable.sessions.forEach((session) => {
    if (session._id.toString() === req.params.id) {
      session.status = req.body.status;
      sessionFound = true;
    }
  });

  if (!sessionFound) return next(new AppError('هذه الجلسة غير موجودة', 404));

  await timetable.save();

  res.status(200).json({
    status: 'success',
    data: {
      timetable,
    },
    //  message: 'تم تغيير حالة الجلسة بنجاح'
  });
});
