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

exports.User = User;