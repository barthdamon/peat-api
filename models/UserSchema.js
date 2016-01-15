'use strict';

/*
Description: Base user schema
*/

let express = require('express');
let app = express();

var mongoose = require('mongoose');
var db = require('../config/db.js');
mongoose.Promise = require('bluebird');
var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;

// in the future (after everything is working) need to integrate with facebook, twitter, and instagram
var userSchema = mongoose.Schema({
	first: String,
	last: String,
	username: { type: String, unique: true},
	email: { type: String, unique: true }, 
	password: String,
	joined: Number
});

userSchema.pre('save', function(next) {
   var user = this;
	// only hash the password if it has been modified (or is new)
	if (!user.isModified('password')) return next();

	// generate a salt
	bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
	    if (err) return next(err);

	    // hash the password using our new salt
	    bcrypt.hash(user.password, salt, function(err, hash) {
	        if (err) return next(err);

	        // override the cleartext password with the hashed one
	        user.password = hash;
	        next();
	    });
	});
});

userSchema.methods.comparePassword = function(candidatePassword, callback) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return callback(err);
        callback(null, isMatch);
    });
};

mongoose.model('User', userSchema);
var User = db.model('User');

module.exports = User;