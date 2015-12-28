'use strict'

var express = require('express');
var app = express();
var mongoose = require('mongoose');

var env = process.env.NODE_ENV;
var db = mongoose.createConnection(env == "development" ? 'mongodb://localhost/peatAPI' : process.env.PROD_MONGODB);

db.on('error', function(err){
  if(err) throw err;
});

db.once('open', function callback () {
  console.info('Mongo db connected successfully');
});

module.exports = db;