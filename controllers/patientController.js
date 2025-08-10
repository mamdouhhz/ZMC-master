const multer = require('multer');
const sharp = require('sharp');

const Patient = require('../models/patientModel');
const Session = require('../models/sessionModel');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const APIFeatures = require('../utils/APIFeatures');

const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('من فضلك ادخل صورة فقط', 400), false);
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
exports.uploadPatientPhoto = upload.single('photo');

// Middleware to resize patient photo
exports.resizePatientPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();
  req.file.filename = `patient-${req.params.id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/patients/${req.file.filename}`);
  next();
});

exports.updatePatientPhoto = catchAsync(async (req, res, next) => {
  console.log(req);
  if (!req.file) return next(new AppError('لم يتم العثور على صورة', 400));
  const photoPath = `public/img/patients/${req.file.filename}`;
  const patient = await Patient.findByIdAndUpdate(
    req.params.id,
    { photo: req.file.filename },
    { new: true }
  );
  res
    .status(200)
    .json({ status: 'success', message: 'تم تعديل صورة المريض', patient });
});

// exports.deletePatientPhoto = catchAsync(async (req, res, next) => {
//   const patient = await Patient.findByIdAndUpdate(
//     req.params.id,
//     { photo: undefined },
//     { new: true }
//   );

//   await fs.unlink(patient.photo);

//   res.status(200).json({
//     status: 'success',
//     data: {
//       patient,
//     },
//   });
// });

// exports.deletePatientPhoto = catchAsync(async (req, res, next) => {
//   const patient = await Patient.findById(req.params.id);
//   if (!patient || !patient.photo) {
//     return next(new AppError('لم يتم العثور على صورة مريض', 404));
//   }
//   console.log(patient.photo);
//   const filePath = path.join(
//     `public/img/patients/${patient.photo}`,
//     patient.photo
//   );
//   console.log(filePath);
//   // Delete the Image File from the file system
//   await fs.unlink(filePath, (err) => {
//     if (err) {
//       console.log(err);
//     }
//   });

//   // Update the Patient Record in the database
//   const updatedPatient = await Patient.findByIdAndUpdate(
//     req.params.id,
//     { photo: 'default.jpg' }, // Remove the 'photo' field
//     { new: true }
//   );

//   res.status(200).json({
//     status: 'success',
//     // data: null,
//     updatedPatient,
//   });
// });

exports.deletePatientPhoto = catchAsync(async (req, res, next) => {
  const patient = await Patient.findByIdAndUpdate(
    req.params.id,
    {
      photo: 'default.jpg',
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: 'success',
    dataa: {
      patient,
    },
  });
});

exports.createPatient = catchAsync(async (req, res, next) => {
  const patient = await Patient.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      patient,
    },
  });
});

exports.getAllPatients = catchAsync(async (req, res, next) => {
  const { results, metadata } = await new APIFeatures(Patient.find(), req.query)
    .filter()
    .sort('serial')
    .limitFields()
    .search('name')
    .paginate();

  // if (results.length === 0)
  //   return next(new AppError('لم يتم العثور على أي مريض.'));

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

exports.getPatient = catchAsync(async (req, res, next) => {
  const patient = await Patient.findById(req.params.id);

  res.status(200).json({
    status: 'success',
    data: {
      patient,
    },
  });
});

exports.updatePatient = catchAsync(async (req, res, next) => {
  const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      patient,
    },
  });
});

exports.deletePatient = catchAsync(async (req, res, next) => {
  // Delete patient with all his sessions
  const sessions = await Session.deleteMany({ patient: req.params.id });
  await Patient.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: 'success',
  });
});

exports.getPatientAllSessions = catchAsync(async (req, res, next) => {
  const sessions = await Session.find({ patient: req.params.id });

  res.status(200).json({
    status: 'success',
    data: {
      sessions,
    },
  });
});

// SPECIALIST ACCESS

exports.getMyPatients = catchAsync(async (req, res, next) => {
  // Get the specialist's ID from the request
  const myDepartment = req.user.department; // Assuming the specialist ID is stored in req.user.id
  // console.log(req.user);

  // Find sessions where the specialist is associated
  const sessions = await Session.find({ department: myDepartment });

  // Extract patient IDs from the sessions
  const patientIds = sessions.map((session) => session.patient);

  // Find patients associated with these sessions
  // const patients = await Patient.find({ _id: { $in: patientIds } });

  const { results, metadata } = await new APIFeatures(
    Patient.find({ _id: { $in: patientIds } }),
    req.query
  )
    .filter()
    .sort('serial')
    .limitFields()
    .search('name')
    .paginate();

  // console.log(results);

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

// CLASS ACCESS
exports.getClassPatients = catchAsync(async (req, res, next) => {
  const { results, metadata } = await new APIFeatures(
    Patient.find({ inClass: true }),
    req.query
  )
    .filter()
    .sort('serial')
    .limitFields()
    .search('name')
    .paginate();
  // if (results.length === 0)
  //   return next(new AppError('لم يتم العثور على أي مريض.'));
  res.status(200).json({
    status: 'success',
    metadata: {
      totalElements: metadata.totalResult,
      totalPages: metadata.totalPages,
      currentPage: req.query.page * 1 || 1,
      pageSize: req.query.limit * 1 || 10,
    },
    data: {
      results,
    },
  });
  // const classPatients = await Patient.find({ inClass: true });
  // res.status(200).json({
  //   status: 'success',
  //   data: {
  //     classPatients,
  //   },
  // });
});
