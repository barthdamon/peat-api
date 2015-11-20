
var messageSchema = mongoose.Schema({
	sender: String,
	recipient: String,
	media: [String],
	coordinates: {
		x: Number,
		y: Number
	},
	media: [{ type: String, ref: 'Media' }],
	activity: String,
	abilityTitle: String,
	completionStatus: Boolean,
	connections: [String]
});

var Message = mongoose.model('Message', messageSchema);