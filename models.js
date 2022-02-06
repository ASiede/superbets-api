const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const betEventSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: false
  },
  // password: {
  //   type: String,
  //   required: false,
  // },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  // questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
  questions: [
    {
      questionId: {
        type: Number,
        required: true
      },
      text: {
        type: String,
        required: true
      },
      answers: [
        {
          answerId: { type: Number },
          text: {
            type: String,
            required: true
          },
          odds: {
            type: Number
          },
          confirmed: {
            type: Boolean
          }
        }
      ]
    }
  ]
});

// const questionSchema = mongoose.Schema({
//   questionId: { type: Number },
//   text: {
//     type: String,
//     required: true,
//   },
//   // answers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Answer" }],
// });

// const answerSchema = mongoose.Schema({
//   answerId: { type: Number },
//   text: {
//     type: String,
//     required: true,
//   },
//   odds: {
//     type: Number,
//   },
//   confirmed: {
//     type: Boolean,
//   },
// });

const submissionSchema = mongoose.Schema({
  bettor: {
    type: String,
    required: true,
    unique: true
  },
  bets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Bet', required: true }],
  betEvent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BetEvent',
    required: true
  }
});

const betSchema = mongoose.Schema({
  questionId: { type: { Number } },
  answerId: { type: { Number } }
});

const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: false
  },
  lastName: {
    type: String,
    required: false
  },
  email: { type: String, required: true, unique: true },
  betEvents: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BetEvent'
    }
  ]
});

userSchema.methods.serialize = function () {
  return {
    id: this.id,
    // id: this._id,
    username: this.username,
    password: this.password,
    firstName: this.firstName,
    lastName: this.lastName,
    email: this.email,
    betEvents: this.betEvents
  };
};

userSchema.methods.validatePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

userSchema.statics.hashPassword = (password) => bcrypt.hash(password, 10);

const User = mongoose.model('User', userSchema);

const BetEvent = mongoose.model('BetEvent', betEventSchema);
const Submission = mongoose.model('Submission', submissionSchema);
// const Question = mongoose.model("Question", questionSchema);
// const Answer = mongoose.model("Answer", answerSchema);
const Bet = mongoose.model('Bet', betSchema);

module.exports = {
  User,
  BetEvent,
  Submission,
  // Question,
  // Answer,
  Bet
};
