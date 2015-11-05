// MARK: MODEL
var leafSchema = mongoose.Schema({
	user: String,
	coordinates: {
		x: Number,
		y: Number
	},
	activity: String,
	connections: []
});

var Leaf = mongoose.model('Leaf', leafSchema);

exports.createLeaf = function(req, res) {
	console.log(req.body.params.leafLa)
	var postedLeaf = new Leaf({
		user: req.user.email,
		coordinates: {
			x: req.body.params.coordinates.x,
			y: req.body.params.coordinates.y
		},
		activity: req.body.params.activity,
		connections: req.body.params.connections
	});

	postedLeaf.save(function(err) {
		if (err) {
			res.status(400).json({ "message": "server leaf post failure: " + err });
		} else {
			res.status(200).json({ "message": "server leaf post successful" });
		}
	});
}

exports.getLeaves = function(req, res) {
	var activity = req.body.activity
	console.log("ACTIVITY: " +activity);
	Leaf.find({activity: activity, user: req.user.email }, function(err, leaves) {
		if (err) {
			console.log("ERROR: "+err);
			res.status(400).json({"message": "Error featching leaves"});
		} else if (leaves.length > 0) {
			console.log(leaves);
			res.status(200).json({"leaves": leaves});
		} else {
			res.status(204).json({"message": "No leaves found"});
		}
	});
}