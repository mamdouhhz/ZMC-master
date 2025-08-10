const mongoose = require('mongoose');

const waitingListSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'من فضلك ادخل اسم المريض'],
    minLength: 3,
    //? NAME LENGTH
    maxLength: 50,
  },
  //   serial: Number,
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

const WaitingList = mongoose.model('WaitingList', waitingListSchema);

module.exports = WaitingList;
