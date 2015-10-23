//MARK: DEPENDENCIES
var jwt = require('jwt-simple');
var moment = require('moment');

// MARK: MODEL
var userSchema = mongoose.Schema({
	name: String,
	userName: { type: String, unique: true},
	email: { type: String, unique: true }, 
	password: String,
	friends: [String]
});

var User = mongoose.model('User', userSchema);

//MARK: Utility

exports.findUser = function (req) {
	var token = req.get('token');
	if (token) {
	  	try {
   		var decoded = jwt.decode(token, app.get('jwtTokenSecret'));
	  	} catch (err) {
	  		res.status(404).json({"message" : "Incorrect Auth Token: "+err});
	  	}
		// if (decoded.exp < moment()) {res.status(300).json({"message" : "Auth Token Expired"})};
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

//MARK: Basic Auth

exports.login = function(req, res) {
	User.find({ email: req.body.params.user.email }, function(err, user) {
		if (user) {
			// console.log(user);
			var userID = user[0]['id'];
			// console.log(userID);
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

//MARK: Friends

exports.putFriend = function(req, res) {
	//find the user in the db and then add the friend sent to that users array of friends
	var newFriendId = req.body.params.friend;
	var updatedFriends = [];
	var friendExists = false;
	console.log("1");

	User.find({ _id: req.user._id }, function(err, user) {
		if (user) {
			var foundUser = user[0]
			console.log("USERTEST" + user)
			console.log("USER: " + user.friends)
			if (foundUser.friends) {
				updatedFriends = foundUser.friends;
				console.log("2");
			}

			updatedFriends.forEach(function(friend){
				if (friend._id = newFriendId) {
					friendExists = true;
					console.log("3");
				}
				console.log("3.5");
			});

			if (!friendExists) {
				updatedFriends.push(newFriendId);
				console.log(newFriendId);
				console.log(updatedFriends);
				console.log("4");

				User.update(
				   { '_id' : req.user._id }, 
				   { $set: { 'friends': updatedFriends } },
				   function (err, result) {
		    			if (err) {
							res.status(400).json({"message": "Error occured while adding friend"});
		    			} else {
		    				console.log(result);
		    				res.status(200).json({"message": "Friend Added"});
		    			}
				   });			
			} else {
				res.status(400).json({"message": "Friend already exists"});				
			}
		} else {
			res.status(400).json({"message": "Friend Not found"});
		}
	});
}

exports.getFriends = function(req, res) {
	var friends = req.user.friends;
	var fetchedFriends = [];
	User.find( { _id: { $in: friends }}, function(err, users) {
		if (err) {
			console.log(err);
		} else {
			fetchedFriends = users;
			if (fetchedFriends.length > 0) {
				res.status(200).json({"friends": fetchedFriends});
			} else {
				res.status(400).json({"message": "YOU HAVE NO FRIENDS"});
			}
		}
	});
}

exports.searchUsers = function(req, res) {
	var searchTerm = req.body.params.searchTerm
	console.log("User Search Term: " +searchTerm);
	User.find( {$or : [ {username: {$regex : searchTerm, $options: 'i'}}, {name: {$regex: searchTerm, $options: 'i'}} ] }, function(err, users) {
		if (users) {
			res.status(200).json({"users": users});
		} else {
			res.status(400).json({"message": "Error finding users"});
		}
	});
}

exports.User = User;