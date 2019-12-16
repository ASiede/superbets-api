'use strict';

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

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
    firstName: {type: String, default: ""},
    lastName: {type: String, default: ""},
    email: {type: String, required: true, unique: true},
    trips:[{type: mongoose.Schema.Types.ObjectId, ref: 'Trip'}]
});


userSchema.methods.serialize = function() {
    return {
        id: this._id,
        username: this.username,
        password: this.password,
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
        trips: this.trips
    };
};

userSchema.methods.validatePassword = function(password) {
    return bcrypt.compare(password, this.password);
};

userSchema.statics.hashPassword = function(password) {
    return bcrypt.hash(password, 10);
};

// const Trip = mongoose.model("Trip", tripSchema);
const User = mongoose.model("User", userSchema);

module.exports = { User };