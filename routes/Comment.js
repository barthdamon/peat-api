'use strict';

let express = require('express');
let app = express();
var Promise = require('bluebird');

var Comment = require('../models/CommentSchema.js');
var Leaf = require('../models/LeafSchema.js');
var Media = require('../models/MediaSchema.js');
var Like = require('../models/LikeSchema.js');
var Witness = require('../models/WitnessSchema.js');

exports.createComment = function(req, res) {
	var currentTime = Date.now();
	var newComment = new Comment({
		sender_Id: req.body.sender,
		mediaId: req.body.mediaId,
		text: req.body.text,
		timestamp: currentTime		
	});

	newComment.save(function(err) {
		if (err) {
			res.status(400).json({ message: "comment create failure: " + err });
		} else {
			res.status(200).json({ message: "comment create success" });
		}
	});
}


//MARK: Witness
exports.newWitness = function(req, res) {
	var currentTime = Date.now();
	var newWitness = new Witness({
		witness_Id: req.user._id,
		witnessed_Id: req.body.witnessed_Id,
		leafId: req.body.leafId,
		message: req.body.message,
		location: req.body.location,
		confirmed: false,
		timestamp: currentTime
	});

	newWitness.save(funciton(err){
		if (err) {
			res.status(400).json({ message: "witness create failure: " + err });
		} else {
			res.status(200).json({ message: "witness create success" });
		}
	});
}

exports.approveWitness = function(req, res) {
	var currentTime = Data.now();
	Witness.update({leafId: req.body.leafId, witnessed_Id: req.user._Id, witness_Id: req.witness_Id}, {confirmed: true}, function(err, result){
		if (err) {
			res.status(400).json({ message: "witness approve failure: " + err });
		} else {
			res.status(200).json({ message: "witness approve success" });
		}
	});
}

//MARK: Like

exports.newLike = function(req, res) {
	var currentTime = Date.now();
	//leaf.update
	//User has to be one of the other users friends though
	var newLike = new Like({
		user_Id: req.user._id,
		mediaId: req.body.mediaId,
		comment_Id: req.body.comment_Id,
		timestamp: currentTime
	});

	newLike.save(funciton(err){
		if (err) {
			res.status(400).json({ message: "like create failure: " + err });
		} else {
			res.status(200).json({ message: "like create success" });
		}
	});	
}