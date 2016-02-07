'use strict';

//MARK: DEPENDENCIES
let express = require('express');
let app = express();

var Promise = require('bluebird');

var Witness = require('./../models/WitnessSchema.js');
var User = require('./User.js');
var UserModel = require('./../models/UserSchema.js');
var Profile = require('./../models/ProfileSchema.js');

exports.createWitness = function(req, res) {
	let witness = req.user._id;
	let witnessed = req.body.witnessed_Id;
	let currentTime = Date.now();
	console.log("Witness: " + witness + "Witnessed: " + witnessed);

	let newWitness = new Witness({
		witness_Id: witness,
		witnessed_Id: req.body.witnessed_Id,
		leafId: req.body.leafId,
		timestamp: currentTime
	});

	console.log("new witness: " + newWitness);

	newWitness.save(function(err) {
		if (err) {
			res.status(400).json({ message: "witness create failure: " + err });
		} else {
			res.status(200).json({ message: "witness create success" });
		}
	});
}

// exports.confirmWitness = function(req, res) {
// 	//user confirming must have recieved
// 	let witnessObject_Id = req.params.id;
// 	let user_Id = req.user._id;

// 	Witness.update({ '_id' : witnessObject_Id, 'witnessed_Id' : user_Id }, { 'confirmed' : true }, function(err, result) {
// 		if (err) {
// 		console.log("Error confirming witness: " + err);
// 		res.status(400).json({ message: "Error occured while confirming witness"});
// 		} else {
// 			console.log("witness confirmation result: " + result);
// 			res.status(200).json({ message: "Witness confirmed"});
// 		}
// 	});
// }

//when user denies request same as destroying friendship. NO it should be an update that changes confirmed to false.
//We need an ended by field on the friendship, or do we? YES. THen if that doesnt exist and the friendship is false that means the user still needs to confirm the friend request
exports.destroyWitness = function(req, res) {
	//either sender or recipient must be able to destroy
	let witnessObject_Id = req.params.witnessObject_Id;

	console.log("Witness being destroyed, destructor: "+ req.body.user._id + " destructed: " + witnessObject_Id);
	Witness.remove({ _id: witnessObject_Id }, function(err, result) {
		if (err) {
			console.log("Error destroying friend: "+ err);
			res.status(400).json({ message: "Error occured while destroying friend"});
		} else {
			console.log("friend destruction result: " + result);
			res.status(200).json({ message: "Friend destroyed"});
		}		
	});
}

