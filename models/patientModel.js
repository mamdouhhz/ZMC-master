const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'من فضلك ادخل اسم المريض'],
    minLength: 3,
    //? NAME LENGTH
    maxLength: 50,
  },
  serial: Number,
  birthday: {
    type: Date,
    // required: ['true', 'من فضلك ادخل تاريخ ميلادالمريض'],
  },
  age: {
    type: Number,
    // required: ['true', 'من فضلك ادخل السن'],
  },
  nationalId: {
    type: String,
  },
  iq: {
    type: Number,
  },
  inClass: {
    type: Boolean,
    default: false,
  },
  //TODO EDIT TYPES
  rank: {
    type: String,
  },
  degree: {
    type: String,
    enum: ['مدني', 'عسكري', 'اجنبي'],
  },
  fatherName: {
    type: String,
    // required: [true, 'من فضلك ادخل اسم الأب'],
  },
  fatherId: {
    type: String,
  },
  motherName: {
    type: String,
    // required: [true, 'من فضلك ادخل اسم الأم'],
  },
  motherId: {
    type: String,
  },
  address: {
    type: String,
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  phone: {
    type: String,
  },
  whatsapp: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

patientSchema.pre('save', async function (next) {
  if (this.isNew) {
    const highestSerial = await this.constructor
      .findOne({}, { serial: 1 })
      .sort({ serial: -1 })
      .limit(1);
    // if no patients return serial 1
    this.serial = highestSerial ? highestSerial.serial + 1 : 1;
    next();
  }
});

const Patient = mongoose.model('Patient', patientSchema);

module.exports = Patient;
