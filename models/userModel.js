const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unqiue: true,
    required: [true, 'من فضلك ادخل اسم المستخدم'],
    trim: true,
    minLength: 3,
    maxLength: 20,
  },
  email: {
    type: String,
    // required: [true, 'من فضلك ادخل البريد الالكتروني للمستخدم'],
    validate: [validator.isEmail, 'من فضلك ادخل البريد الالكتروني بشكل صحيح'],
    unique: true,
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  password: {
    type: String,
    required: [true, 'من فضلك ادخل كلمة السر'],
    minLength: 8,
    // maxLength: 50,
    select: false,
  },
  // passwordConfirm: {
  //   type: String,
  //   required: [true, 'من فضلك ادخل تأكيد كلمة السر'],
  //   validate: {
  //     // This validator only works for create and save queries only
  //     validator: function (el) {
  //       return el === this.password;
  //     },
  //   },
  //   select: false,
  // },

  role: {
    type: String,
    enum: ['ادمن', 'اخصائي', 'رعاية نهارية'],
    required: [true, 'من فضلك ادخل نوع المستخدم'],
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
      'منعكسات',
      'منتسوري',
      'تعديل سلوك',
      'صعوبات تعلم',
      'اورال موتور',
      'تخاطب',
    ],
  },
  createdAt: {
    type: String,
    default: Date.now(),
  },
});

// If the password has changed, hash and save it
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
    next();
  }
});

// Compare candidate password with the correct one
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
