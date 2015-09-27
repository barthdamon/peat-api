//MARK: DEPENDENCIES
var jwt = require('jwt-simple');
var moment = require('moment');

// MARK: MODEL
var userSchema = mongoose.Schema({
	email: { type: String, unique: true }, 
	password: String
});
var User = mongoose.model('User', userSchema);

exports.findUser = function (req) {
	var token = req.get('token');
	if (token) {
	  	try {
   		var decoded = jwt.decode(token, app.get('jwtTokenSecret'));
	  	} catch (err) {
	  		res.status(404).json({"message" : "Incorrect Auth Token: "+err});
	  	}
		if (decoded.exp < moment()) {res.status(300).json({"message" : "Auth Token Expired"})};
	  	User.find({ _id: decoded.iss }, function (err, user) {
	  		if (user) {
	  			// console.log(user[0]);
				return(user[0].email);		  			
	  		} else {
				res.status(400).json({"message": "Token not matched to user"});					  			
	  		}
	  	});
	} else {
	res.status(400).json({"message" : "Invalid tokenAuth request format"});
	}
};

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

exports.User = User;