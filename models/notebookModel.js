const mongoose = require('mongoose');

const notebookSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  filename: {
    type: String,
    required: true,
  },
  modifiedAt: {
    type: Date,
    default: Date.now(),
  },
});

notebookSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'patient',
    select: 'name serial',
  });
  next();
});

const Notebook = mongoose.model('Notebook', notebookSchema);

module.exports = Notebook;
