const WaitingList = require('../models/waitingListModel');
const Patient = require('../models/patientModel');

const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/APIFeatures');
const AppError = require('../utils/AppError');

exports.addToWaitingList = catchAsync(async (req, res, next) => {
  const waitingPatient = await WaitingList.create(req.body);

  res.status(200).json({
    status: 'success',
    data: {
      waitingPatient,
    },
  });
});

exports.getWaitingList = catchAsync(async (req, res, next) => {
  const { results, metadata } = await new APIFeatures(
    WaitingList.find(),
    req.query
  )
    .filter()
    .sort('createdAt')
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

exports.getWaitingPatient = catchAsync(async (req, res, next) => {
  const waitingPatient = await WaitingList.findById(req.params.id);

  res.status(200).json({
    status: 'success',
    waitingPatient,
  });
});

exports.updateWaitingPatient = catchAsync(async (req, res, next) => {
  const waitingPatient = await WaitingList.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: 'success',
    waitingPatient,
  });
});

exports.moveToPatients = catchAsync(async (req, res, next) => {
  const waitingListPatient = await WaitingList.findById(req.params.id);
  // console.log(waitingListPatient);

  if (!waitingListPatient)
    return next(new AppError('هذا المريض غير موجود في قائمة الانتظار', 400));

  // Extract the necessary fields from the waiting list patient
  const {
    name,
    birthday,
    age,
    nationalId,
    iq,
    rank,
    degree,
    fatherName,
    fatherId,
    motherName,
    motherId,
    address,
    photo,
    phone,
    whatsapp,
  } = waitingListPatient;

  // Create a patient using the extracted fields
  const patientData = {
    name,
    birthday,
    age,
    nationalId,
    iq,
    rank,
    degree,
    fatherName,
    fatherId,
    motherName,
    motherId,
    address,
    photo,
    phone,
    whatsapp,
  };

  // Remove from waiting list
  await WaitingList.findByIdAndDelete(req.params.id);

  // Add to patients
  const patient = await Patient.create(patientData);

  res.status(200).json({
    status: 'success',
    data: {
      patient,
    },
  });
});

exports.deleteFromWaitingList = catchAsync(async (req, res, next) => {
  const patient = await WaitingList.findByIdAndDelete(req.params.id);
  res.status(200).json({
    status: 'success',
  });
});
