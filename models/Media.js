//MARK: DEPENDENCIES
var moment = require('moment');



// MARK: MODEL
var mediaSchema = mongoose.Schema({
	userID: String,
	mediaID: String,
	mediaType: String,
	timestamp: String
});

var Media = mongoose.model('Media', mediaSchema);



exports.postMedia = function(req, res) {
	// console.log(req.body.params.mediaInfo.mediaID)
	// console.log(req.user._id)
	var currentTime = moment()
	var postedMedia = new Media({
		userID: req.user._id,
		mediaID: req.body.params.mediaInfo.mediaID,
		mediaType: req.body.params.mediaInfo.mediaType,
		timestamp: currentTime
	});

	postedMedia.save(function(err){
		if(err){
			res.status(400).json({ "message": "server media post failure: " + err });
		} else {
			res.status(200).json({ "message": "server media post successful" });
		}
	});
}

exports.getMedia = function(req, res) {
	Media.find({ email: req.user.email }, function(err, media) {
		if (media) {
			res.status(200).json(media);
		} else {
			res.status(300).json({"message": "No Media for user found"});
		}
	});
}