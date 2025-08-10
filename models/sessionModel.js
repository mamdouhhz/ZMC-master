const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
  },
  specialist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  department: {
    type: String,
    enum: [
      'تكامل حسي',
      'عمود فقري',
      'علاج وظيفي',
      'تنمية مهارات',
      'عيادة الاسنان',
      'علاج طبيعي',
      'رعاية نهارية',
      'منعكسات',
      'منتسوري',
      'تعديل سلوك',
      'صعوبات تعلم',
      'اورال موتور',
      'تخاطب',
    ],
  },
  day: {
    type: String,
    required: true,
    enum: ['السبت', 'الاحد', 'الاثنين', 'الثلاثاء', 'الاربعاء', 'الخميس'],
  },
  from: {
    type: String,
    required: true,
    enum: [
      '09:00',
      '09:15',
      '09:30',
      '09:45',
      '10:00',
      '10:15',
      '10:30',
      '10:45',
      '11:00',
      '11:15',
      '11:30',
      '11:45',
      '12:00',
      '12:15',
      '12:30',
      '12:45',
      '01:00',
      '01:15',
      '01:30',
      '01:45',
      '02:00',
    ],
  },
  to: {
    type: String,
    required: true,
    enum: [
      '09:15',
      '09:30',
      '09:45',
      '10:00',
      '10:15',
      '10:30',
      '10:45',
      '11:00',
      '11:15',
      '11:30',
      '11:45',
      '12:00',
      '12:15',
      '12:30',
      '12:45',
      '01:00',
      '01:15',
      '01:30',
      '01:45',
      '02:00',
      '02:15',
    ],
  },

  status: {
    type: String,
    enum: ['حاضر', 'غائب'],
  },
});

sessionSchema.index({ deparment: 1, patient: 1 }, { unique: false });

sessionSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'patient',
    select: 'name serial',
  });
  next();
});

sessionSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'specialist',
    select: 'username',
  });
  next();
});

const Session = mongoose.model('Session', sessionSchema);

module.exports = Session;

// patient: محمد
// department: 'تكامل حسي'
// day: 'السبت'
// from: '09:00'
// to: '09:30'
