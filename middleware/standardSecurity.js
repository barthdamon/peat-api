'use strict';

let express = require('express');
let app = express();

let API_AUTH_PASSWORD = process.env.API_PASSWORD;


module.exports = function(req, res, next) {
	if (req.get('api_auth_password') == API_AUTH_PASSWORD) {
		next();
	} else {
		res.status(403).json({"message": "I'ma give you til the count of ten... To get your yella, dirty, no good keister off my property"});
	}
}
