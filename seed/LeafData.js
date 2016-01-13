'use strict';

let express = require('express');
let app = express();


//MARK: Data
let activities = [
	"snowboarding",
	"trampoline"
];

/*Should be able to totally replace leaf structures when there are changes to the data
(ie, remove them all, then stick them back in. Just make sure the stableIds stay the same)
*/
//NOTE: connections are the previous leaves
var snowboardingStructures = [
	{
		activityType: "snowboarding",
		coordinates: {
	            x : 100,
	            y : 100
	   },
		abilityTitle: "Big Air",
		stableId: "BigAir_id",
		connections: [],
		demos: []
	},
	{
		activityType: "snowboarding",
		coordinates: {
	            x : 200,
	            y : 200
	   },
		abilityTitle: "180",
		stableId: "180_id",
		connections: ["BigAir_id"],
		demos: []
	},
	{
		activityType: "snowboarding",
		coordinates: {
	            x : 400,
	            y : 400
	   },
		abilityTitle: "360",
		stableId: "360_id",
		connections: ["180_id"],
		demos: []
	},
	{
		activityType: "snowboarding",
		coordinates: {
	            x : 200,
	            y : 600
	   },
		abilityTitle: "Boardslide",
		stableId: "Boardslide_id",
		connections: ["180_id"],
		demos: []
	},
];

var snowboardingVariations = [
	{
		activity: "snowboarding",
		leafStructure: "360_id",
		mediaId: null,
		meta : {
			grouping: "Grabs",
			title: "Indie"
		},
		custom: false
	},
	{
		activity: "snowboarding",
		leafStructure: "360_id",
		mediaId: null,
		meta : {
			grouping: "Grabs",
			title: "Melon"
		},
		custom: false
	},
	{
		activity: "snowboarding",
		leafStructure: "Boardslide_id",
		mediaId: null,
		meta : {
			grouping: "Rail Type",
			title: "Flat Box"
		},
		custom: false
	},
];


exports.getStructureData = function() {
	var dataStructures = [];
	//apply each activity array do dataStructures
	//snowboarding:
	dataStructures.push.apply(dataStructures, snowboardingStructures);
	//trampoline:
	// dataStructures.push.apply(dataStructures, trampolineStructures);	
	console.log("Parsing Structure JSON....");
	JSON.stringify(dataStructures);
	dataStructures.forEach(function(structure){
		console.log("Activity: " + structure.activityType + ", Ability Title: " + structure.abilityTitle);
	});
	console.log('Structure JSON Parse Complete....');
	console.log();
	return dataStructures;
}

exports.getVariationData = function() {
	var dataVariations = [];
	dataVariations.push.apply(dataVariations, snowboardingVariations);

	console.log("Parsing Variation JSON....");
	JSON.stringify(dataVariations);
	dataVariations.forEach(function(variation){
		console.log("Activity: " + variation.activityType + ", Grouping: " + variation.grouping + ", Title: " + variation.title);
	});
	console.log('Variation JSON Parse Complete....');
	console.log();
	return dataVariations;
}

//MARK: Exports
exports.isActivity = function(activityString) {
	var found = false;
	activities.forEach(function(activity){
		if (activity = activityString) {
			found = true;
		}
	});
	return found;
}




