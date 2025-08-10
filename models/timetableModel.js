const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    default: Date.now(),
    // delete timetable after 7 days
    expires: 60 * 60 * 24 * 7,
  },
  day: {
    type: String,
    enum: ['السبت', 'الاحد', 'الاثنين', 'الثلاثاء', 'الاربعاء', 'الخميس'],
  },
  sessions: [
    {
      patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
      },
      department: String,
      from: String,
      to: String,
      status: String,
    },
  ],
  // sessions: [
  //   {
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: 'Session',
  //     // required: true
  //   },
  // ],
  // patients: [
  //   {
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: 'Patient',
  //   },
  // ],
});

// Ensure TTL index for automatic document expiration
timetableSchema.index({ date: 1 }, { expireAfterSeconds: 0 });

// timetableSchema.pre(/^find/, function (next) {
//   this.populate({
//     path: 'sessions',
//     select: 'name department from to status',
//   });
//   next();
// });

timetableSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'sessions.patient',
    select: 'name serial',
  });
  next();
});

const Timetable = mongoose.model('Timetable', timetableSchema);

module.exports = Timetable;
