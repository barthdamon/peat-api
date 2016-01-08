'use strict';

let express = require('express');
let app = express();

var LeafStructure = require('./../LeafStructure.js');


//MARK: Data
let activities = [
	"snowboarding",
	"trampoline"
];

var dataStructures = [];

/*Should be able to totally replace leaf structures when there are changes to the data
(ie, remove them all, then stick them back in. Just make sure the stableIds stay the same)
*/
//NOTE: connections are the previous leaves
let snowboardingStructures = [
	{
		activityType: "snowboarding",
		coordinates: {
	            "x" : 100,
	            "y" : 100
	   },
		abilityTitle: "Big Air",
		stableId: "BigAir_id",
		connections: [],
		demos: "null"
	},
	{
		activityType: "snowboarding",
		coordinates: {
	            "x" : 200,
	            "y" : 200
	   },
		abilityTitle: "180",
		stableId: "180_id",
		connections: ["BigAir_id"],
		demos: "null"
	},
	{
		activityType: "snowboarding",
		coordinates: {
	            "x" : 400,
	            "y" : 400
	   },
		abilityTitle: "360",
		stableId: "360_id",
		connections: ["180_id"],
		demos: "null"
	},
	{
		activityType: "snowboarding",
		coordinates: {
	            "x" : 200,
	            "y" : 600
	   },
		abilityTitle: "Boardslide",
		stableId: "Boardslide_id",
		connections: ["180_id"],
		demos: "null"
	},
];

//MARK: Script Actions
dataStructures.concat(snowboardingStructures);

LeafStructure.clearStructuresForSeed().then(function(result){
	LeafStructure.createStructuresFromSeedJson(dataStructures).then(function(structures) {
		console.log("SEED REPORT: Leaf Structures Seeded Successfully");
	}).catch(function(err){
		console.log("SEED REPORT: Leaf Structure Seed Failed");
	});
}).catch(function(err){
	console.log("SEED REPORT: Leaf Structure Database Clear Unsuccessful");
});



//MARK: Exports
exports.isActivity = function(activityString) {
	activities.forEach(function(activity){
		if (activity = activityString) {
			return true
		}
	});
	return false
}




