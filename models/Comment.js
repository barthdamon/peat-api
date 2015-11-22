var Promise = require('bluebird');

var commentSchema = mongoose.Schema({
	sender: String,
	media: [String],
	witnessEvent: Boolean,
	text: String,
});

var Comment = mongoose.model('Comment', commentSchema);

exports.createMessage = function(req, res) {
		var newComment = new Comment({
		sender: req.body.params.sender,
		media: req.body.params.media,
		witnessEvent: req.body.params.witnessEvent,
		text: req.body.params.text,
	});

	newComment.save(function(err) {
		if (err) {
			res.status(400).json({ "message": "comment create failure: " + err });
		} else {
			res.status(200).json({ "message": "comment create success" });
		}
	});
}

//returns a list of comments to the getmedia function
exports.fetchComments = function(media) {
	var mediaId = media._id;
	return new Promise(function(resolve, reject){
		Comment.find({ media: mediaId }).sort({timestamp: -1}).limit(10).exec(function(err, comments) {
			if (err) {
				reject(err);
			} else if (comments) {
				resolve(comments);
			} else {
				reject(err);
			}
		});
	});
}
