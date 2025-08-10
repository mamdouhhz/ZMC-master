const multer = require('multer');
const sharp = require('sharp');

const User = require('../models/userModel');
const Session = require('../models/sessionModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const APIFeatures = require('../utils/APIFeatures');

// // UPLOAD PHOTO FUNCTIONALITY
// const multerStorage = multer.memoryStorage();
// const multerFilter = (req, file, cb) => {
//   if (file.mimetype.startsWith('image')) {
//     cb(null, true);
//   } else {
//     cb(new AppError('من فضلك ادخل صورة فقط', 400), false);
//   }
// };
// const upload = multer({
//   storage: multerStorage,
//   fileFilter: multerFilter,
// });
// exports.uploadUserPhoto = upload.single('photo');

// // Middleware to resize patient photo
// exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
//   if (!req.file) return next();
//   req.file.filename = `user-${req.params.id}-${Date.now()}.jpeg`;
//   await sharp(req.file.buffer)
//     .resize(500, 500)
//     .toFormat('jpeg')
//     .jpeg({ quality: 90 })
//     .toFile(`public/img/patients/${req.file.filename}`);
//   next();
// });

// exports.updateUserPhoto = catchAsync(async (req, res, next) => {
//   console.log(req);
//   if (!req.file) return next(new AppError('لم يتم العثور على صورة', 400));
//   const photoPath = `public/img/patients/${req.file.filename}`;
//   const patient = await Patient.findByIdAndUpdate(
//     req.params.id,
//     { photo: req.file.filename },
//     { new: true }
//   );
//   res
//     .status(200)
//     .json({ status: 'success', message: 'تم تعديل صورة المريض', patient });
// });

// exports.deleteUserPhoto = catchAsync(async (req, res, next) => {
//   const patient = await Patient.findByIdAndUpdate(
//     req.params.id,
//     {
//       photo: 'default.jpg',
//     },
//     {
//       new: true,
//       runValidators: true,
//     }
//   );

//   res.status(200).json({
//     status: 'success',
//     dataa: {
//       patient,
//     },
//   });
// });

// Managing users (ADMIN ONLY)
exports.createUser = catchAsync(async (req, res, next) => {
  const user = await User.create(req.body);

  res.status(201).json({
    status: 'success',
    data: { user },
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) return next(new AppError('لم يتم العثور على المستخدم.'));
  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const { results, metadata } = await new APIFeatures(User.find(), req.query)
    .filter()
    .sort('role')
    .limitFields()
    .search('username')
    .paginate();

  // if (results.length === 0)
  //   return next(new AppError('لم يتم العثور على أي مستخدم.'));

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

exports.updateUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!user) return new next(AppError('لم يتم العثور على المستخدم.'));

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return new next(AppError('لم يتم العثور على المستخدم.'));
  await Session.deleteMany({ specialist: req.params.id });

  res.status(200).json({
    status: 'success',
    // message: 'User Deleted Successfully',
  });
});
