//MARK: DEPENDENCIES
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var API_AUTH_PASSWORD = "fartpoop";
var moment = require('moment');
var jwt = require('jwt-simple');
var mongoose = require('mongoose');

//MARK: CONFIG
app.set('jwtTokenSecret', 'secretStringFTW');
mongoose.connect('mongodb://localhost/peatAPI');

//MARK: MIDDLEWARE
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//MARK: MODEL
var userSchema = mongoose.Schema({
	email: { type: String, unique: true }, 
	password: String
});
User = mongoose.model('User', userSchema);

module.exports = express, bodyParser, app, API_AUTH_PASSWORD, moment, jwt, mongoose, User;