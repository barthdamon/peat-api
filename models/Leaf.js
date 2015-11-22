// MARK: MODEL
/* NOTE: all connections are PREVIOUS connections to nodes above the node. 
That way when a node is incomplete the connections can just be gray */

var leafSchema = mongoose.Schema({
	user: String,
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

var Leaf = mongoose.model('Leaf', leafSchema);

exports.putMediaOnLeaf = function(media, res) {
	var leafId = media.leaf;
	console.log("MEDIA: " + media);
	var mediaId = media._id
	if (leafId) {
		Leaf.update({ '_id' : leafId }, { $addToSet : { 'media': mediaId } }, function (err, result) {
			if (err) {
				res.status(400).json({"message": "Error occured while adding media to leaf"});
			} else {
				console.log(result);
				res.status(200).json({"message": "media Added to leaf"});
			}
	   });
   } else {
   	res.status(400).json({"message": "Could not add media to leaf"});
   }	
}

exports.createLeaf = function(req, res) {
	var postedLeaf = new Leaf({
		user: req.user.email,
		coordinates: {
			x: req.body.params.coordinates.x,
			y: req.body.params.coordinates.y
		},
		abilityTitle: req.body.params.abilityTitle,
		completionStatus: req.body.params.completionStatus,
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
	var activity = req.body.activity;
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