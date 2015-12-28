'use strict';

let express = require('express');
let app = express();

module.exports = function(req, res, next) {
	console.log("Request Recieved");
	next();
}