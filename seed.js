'use strict';

let express = require('express');
let app = express();

var Promise = require('bluebird');
var chalk = require('chalk');

var Activity = require('./models/ActivitySchema.js');
// var LeafStructureRoute = require('./routes/LeafStructure.js');
var LeafData = require('./seed/LeafData.js');

console.log(chalk.magenta('Running seed database process'));
console.log();

//MARK: Script Actions
var presetActivities = LeafData.getActivityData();
console.log("Preset activities to be seeded: " + presetActivities);

Activity.collection.insert(presetActivities)
	.then(function(result){
		console.log(chalk.green("SEED REPORT: Preset Activity Database Seed Successful: " + result));
		console.log();
		process.exit();
	})
	.catch(function(err){
		console.log(chalk.red("SEED FAILURE: Database Seed Unsuccessful: " + err));
		process.exit();
	})
.done();