
var threadSchema = mongoose.Schema({
	sender: String,
	recipient: String,
	media: [String],
	request: Boolean,
	text: String,
	history: [{ type: String, ref: 'Thread' }]
});

var Thread = mongoose.model('Thread', messageSchema);

exports.createMessage = function(thread) {
		var newThread = new Thread({
		sender: thread.sender,
		recipient: thread.recipient,
		media: thread.media,
		request: thread.request,
		text: thread.text,
		history: thread.history
	});

	newMessage.save(function(err) {
		if (err) {
			res.status(400).json({ "message": "thread create failure: " + err });
		} else {
			res.status(200).json({ "message": "thread create success" });
		}
	});
}

exports.recieveMessage = function(thread) {
	


}