'use strict';

let express = require('express');
let app = express();

var chalk = require('chalk');

console.log(chalk.magenta('Running seed database process'));
console.log();

var LeafStructure = require('./routes/LeafStructure.js');
var Variation = require('./routes/Variation.js');
var LeafData = require('./seed/LeafData.js');

var greenLight = false;

//MARK: Script Actions
var dataStructures = LeafData.getStructureData();
var dataVariations = LeafData.getVariationData();

seedStructures();

function seedStructures() {
	LeafStructure.clearStructuresForSeed().then(function(result){
		console.log("Leaf Structure Database Clear Successful");
		return LeafStructure.createStructuresFromSeedJson(dataStructures).then(function(){
			endStructureProcess("Leaf Structures Seeded Successfully", true);
		}).catch(function(err){
			endStructureProcess("Leaf Structure Seed Unsuccessful: "+err, false);
		});
	}).catch(function(err){
		endStructureProcess("Leaf Structure Database Clear Unsuccessful: "+err, false);
	});
}

function seedVariations() {
	Variation.clearDefaultVariationsForSeed(function(err, data){
		if (err) {
			endVariationProcess("Variation Database Clear Unsuccessful: "+err, false);
		} else {
			console.log("Variation Database Clear Successful");
			return Variation.createVariationsFromSeedJson(dataStructures).then(function(){
				endVariationProcess("Variations Seeded Successfully", true);
			}).catch(function(err){
				endVariationProcess("Variation Seed Unsuccessful: "+err, false);
			});
		}
	})
}

function endStructureProcess(report, success) {
	console.log(success ? chalk.green("SEED REPORT: " + report) : chalk.red("SEED REPORT: " + report));
	console.log();
	seedVariations();
}

function endVariationProcess(report, success) {
	console.log(success ? chalk.green("SEED REPORT: " + report) : chalk.red("SEED REPORT: " + report));
	console.log();
	console.log();
	process.exit();
}