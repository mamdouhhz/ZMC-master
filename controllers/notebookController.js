const multer = require('multer');
const path = require('path');
const fs = require('fs');

const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const Notebook = require('../models/notebookModel');
const APIFeatures = require('../utils/APIFeatures');

// Set up storage engine
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/notebooks/'); // Specify the folder to store the files
  },
  filename: (req, file, cb) => {
    // cb(null, `${file.originalname}`); // Specify the file naming convention
    cb(null, `Notebook-${req.params.patientId}-${Date.now()}`); // Specify the file naming convention
    // cb(null, `Notebook-${Date.now()}.docx`); // Specify the file naming convention
  },
});

const upload = multer({ storage: multerStorage });

exports.uploadFile = upload.single('file');

exports.uploadNotebook = catchAsync(async (req, res, next) => {
  if (!req.file) return next(new AppError('لم يتم العثور على ملف', 400));

  //   const department = req.user.department;

  const notebook = await Notebook.create({
    filename: req.file.filename,
    patient: req.params.patientId,
    department: req.user.department,
  });

  res.status(201).json({
    status: 'success',
    data: {
      notebook,
    },
  });
});

exports.deleteNotebook = catchAsync(async (req, res, next) => {
  // Find the notebook by ID
  const notebook = await Notebook.findById(req.params.notebookId);

  // Ensure that the notebook exists
  if (!notebook) {
    return next(new AppError('كراسة المريض غير موجودة', 404));
  }

  // Construct the file path
  const filePath = path.join(
    __dirname,
    '..',
    'public',
    'notebooks',
    notebook.filename
  );

  // Delete the file from the file system
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  // Remove the notebook document from the database
  await Notebook.findByIdAndDelete(req.params.notebookId);

  // Respond with success message
  res.status(200).json({
    status: 'success',
    message: 'تم حذف الكراسة بنجاح',
  });
});

exports.downloadNotebook = catchAsync(async (req, res, next) => {
  const { notebookId } = req.params;
  const notebook = await Notebook.findById(notebookId);

  // Ensure that the notebook exists
  if (!notebook) {
    return next(new AppError('كراسة المريض غير موجودة', 404));
  }

  // Construct the file path
  const filePath = path.join(
    __dirname,
    '..',
    'public',
    'notebooks',
    notebook.filename
  );

  // Check if the file exists
  if (!fs.existsSync(filePath)) {
    return next(new AppError('الكراسة غير موجودة على المنظومة', 404));
  }

  // Set the Content-Disposition header with both filename and filename* for better compatibility
  // const filename = notebook.filename;
  // res.setHeader(
  //   'Content-Disposition',
  //   `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(
  //     filename
  //   )}`
  // );

  // Set the Content-Type header based on the file extension
  // res.setHeader(
  //   'Content-Type',
  //   'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  // );
  // res.setHeader(
  //   'Content-Disposition',
  //   `attachment; filename=${undefined} filename*=UTF-8''${encodeURIComponent(
  //     notebook.filename
  //   )}`
  // );

  // Send the file to the client
  res.download(filePath, notebook.filename, (err) => {
    if (err) {
      return next(new AppError('حدث خطأ أثناء تحميل الكراسة', 500));
    }
  });
});

exports.getPatientAllNotebooks = catchAsync(async (req, res, next) => {
  const patientNotebooks = await Notebook.find({
    patient: req.params.patientId,
  });

  res.status(200).json({
    status: 'success',
    data: {
      patientNotebooks,
    },
  });
});

exports.getNotebook = catchAsync(async (req, res, next) => {
  const notebook = await Notebook.findById(req.params.notebookId);

  res.status(200).json({
    status: 'success',
    data: {
      notebook,
    },
  });
});

// Specialist notebooks
exports.getMyNotebooks = catchAsync(async (req, res, next) => {
  // const notebooks = await Notebook.find({ department: req.user.department})

  // res.status(200).json({
  //   status: 'success',
  // data: {

  // }
  // })

  const { results, metadata } = await new APIFeatures(
    Notebook.find({ department: req.user.department }),
    req.query
  )
    .filter()
    .sort('-modifiedAt')
    .limitFields()
    .search('patient')
    .paginate();

  if (results.length === 0)
    return next(new AppError('لم يتم العثور على أي كراسات'));

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
});

exports.getPatientNotebook = catchAsync(async (req, res, next) => {
  const notebook = await Notebook.findOne({
    patient: req.params.patientId,
    department: req.user.department,
  });

  res.status(200).json({
    status: 'success',
    data: {
      notebook,
    },
  });
});

exports.updateNotebook = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('لم يتم العثور على ملف', 400));
  }

  const notebook = await Notebook.findById(req.params.notebookId);

  if (!notebook) {
    return next(new AppError('الكراسة غير موجودة', 404));
  }

  // Construct the file path of the existing notebook
  const oldFilePath = path.join(
    __dirname,
    '..',
    'public',
    'notebooks',
    notebook.filename
  );

  // Delete the existing file
  if (fs.existsSync(oldFilePath)) {
    fs.unlinkSync(oldFilePath);
  }

  // Update notebook with the new one
  notebook.filename = req.file.filename;
  notebook.modifiedAt = Date.now();

  await notebook.save();

  res.status(200).json({
    status: 'success',
    data: {
      notebook,
    },
  });
});
