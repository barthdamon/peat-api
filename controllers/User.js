//MARK: DEPENDENCIES
var jwt = require('jwt-simple');
var moment = require('moment');
var users = require('../models/User.js');

exports.login = function(req, res) {
	User.find({ email: req.body.params.user.email }, function(err, user) {
		if (user) {
			console.log(user);
			var userID = user[0]['id'];
			console.log(userID);
				if (req.body.params.user.password == user[0]['password']) {
					var expires = moment().add(7, 'days').valueOf();
					//encode using the jwt token secret
					var token = jwt.encode({
					  	iss: userID,
					  	exp: expires
					}, app.get('jwtTokenSecret'));

					res.status(200).json({
					  api_authtoken : token,
					  authtoken_expiry: expires,
					  user_email: user.email
					});
				} else {
					res.status(403).json({"message": "User password incorrect"});
				}
		} else {
			res.status(400).json({"message": "User not found"});
		}
	});
}