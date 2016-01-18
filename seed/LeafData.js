'use strict';

let express = require('express');
let app = express();


//MARK: Data
let activities = [
	{
		name: "Snowboarding",
		category: "Snowsports",
		approved: true
	},
	{
		name: "Trampoline",
		category: "Gymnastics",
		approved: true
	}
];


exports.getActivityData = function() {
	var presetActivities = [];
	//apply each activity array do dataStructures
	//snowboarding:
	presetActivities.push.apply(presetActivities, activities);
	//trampoline:
	// dataStructures.push.apply(dataStructures, trampolineStructures);	
	console.log("Parsing Structure JSON....");
	JSON.stringify(presetActivities);
	presetActivities.forEach(function(activity){
		console.log("Preset Activity: " + activity.name + ", Activity Category: " + activity.category);
	});
	console.log('Preset Activity JSON Parse Complete....');
	console.log();
	return presetActivities;
}



