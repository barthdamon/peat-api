'use strict';

/*
Description: Base user schema

valid types are:

single - can be sponsored by organizations (this goes in the profile)
organization - organizations can have their atheltes or their own instructional videos if they want to. users can send
sponsor and admin requests to users and vice versa. Then if the user is an admin they can edit the organizations tree, if they
are sponsored they get that on their profile......

for organizations there is no first or last name, only the username (name of the organization)

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
	type: String,
	joined: Number,
	profile: {
		summary: String,
		avatarURL: String,
		contact: String,
		activeActivityNames: [String]
	}
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