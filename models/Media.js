//MARK: DEPENDENCIES


// MARK: MODEL
var mediaSchema = mongoose.Schema({
	user: String,
	mediaID: String,
	url: String,
	mediaType: String,
	timestamp: Number
});

var Media = mongoose.model('Media', mediaSchema);



exports.postMedia = function(req, res) {
	// console.log(req.body.params.mediaInfo.mediaID)
	// console.log(req.user._id)
	var currentTime = Date.now();
	var postedMedia = new Media({
		user: req.user.email,
		mediaID: req.body.params.mediaInfo.mediaID,
		url: req.body.params.mediaInfo.url,
		mediaType: req.body.params.mediaInfo.mediaType,
		timestamp: currentTime
	});

	postedMedia.save(function(err) {
		if(err){
			res.status(400).json({ "message": "server media post failure: " + err });
		} else {
			res.status(200).json({ "message": "server media post successful" });
		}
	});
}

exports.getMedia = function(req, res) {
	//TODO: Add more here to return just the most recent 5 or so. Then in extend make that a post and send down the next most recent 5
	Media.find({ user: req.user.email }).sort({timestamp: -1}).limit(5).exec(function(err, media) {
		if (err) {
			res.status(400).json({"message": "Error finding media"});
		} else if (media) {
			console.log(media);
			res.status(200).json({ "media": media });
		} else {
			res.status(204).json({"message": "No Media for user found"});
		}
	});
}

exports.getUpdate = function(req, res) {
	var lastUpdated = req.body.mostRecent;
	console.log("LAST UPDATED:" +lastUpdated);
	Media.find({timestamp: {$gt: lastUpdated} }).sort({timestamp: -1}).limit(5).exec(function(err, media) {
		if (err) {
			res.status(400).json({"message": "Error fetching media update"});
		} else if (media.length > 0) {
			console.log(media);
			res.status(200).json({"media": media});
		} else {
			res.status(204).json({"message": "No updates found"});
		}
	});
}

exports.extendNewsfeed = function(req, res) {
	var lastRecieved = req.body.lastRecieved;
	Media.find({timestamp: {$lt: lastRecieved} }).sort({timestamp: -1}).limit(5).exec(function(err, media) {
		if (err) {
			res.status(400).json({"message": "Error fetching media for newsfeed extension"});
		} else if (media.length >0) {
			console.log(media);
			res.status(200).json({"media": media});
		} else {
				res.status(204).json({"message": "No updates found"});
		}
	});
}