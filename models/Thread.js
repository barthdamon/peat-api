
//emit notifications needs to be called whenever the thread is updated. That way the socket can work with whatever it has to send out to?

//recieved here is a string for the last recieved message in the thread history
var threadSchema = mongoose.Schema({
	sender: String,
	recipient: String,
	media: String,
	notification: Boolean,
	request: Boolean,
	text: String,
	recieved: String
	history: [{ type: String, ref: 'Thread' }],
	timestamp: Number,
});

var Thread = mongoose.model('Thread', messageSchema);

exports.createMessage = function(thread) {
	var currentTime = Date.now();
	var newThread = new Thread({
		sender: thread.sender,
		recipient: thread.recipient,
		media: thread.media,
		request: thread.request,
		text: thread.text,
		recieved: thread.recieved,
		history: thread.history,
		timestamp: currentTime
	});

	newMessage.save(function(err) {
		if (err) {
			res.status(400).json({ "message": "thread create failure: " + err });
		} else {
			res.status(200).json({ "message": "thread create success" });
		}
	});
}

exports.messageRecieved = function(thread) {

}

exports.emitNotifications = function() {

}


