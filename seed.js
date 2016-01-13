'use strict';

let express = require('express');
let app = express();

var Promise = require('bluebird');
var chalk = require('chalk');

var Variation = require('./models/VariationSchema.js');
var LeafStructure = require('./models/LeafStructureSchema.js');
// var LeafStructureRoute = require('./routes/LeafStructure.js');
var LeafData = require('./seed/LeafData.js');

console.log(chalk.magenta('Running seed database process'));
console.log();

//MARK: Script Actions
var dataStructures = LeafData.getStructureData();
var dataVariations = LeafData.getVariationData();
console.log("LeafStructures to be seeded: " + dataStructures);
console.log("Variations to be seeded: " + dataVariations);

LeafStructure.remove({}).exec()
	.then(function(result){
		console.log(chalk.green("SEED REPORT: LeafStructure Database Clear Successful: "+ result));
		return LeafStructure.collection.insert(dataStructures)
	})
	.then(function(result){
		console.log(chalk.green("SEED REPORT: LeafStructure Seed Successfully: " + result));
		return Variation.remove({custom: false}).exec()
	})
	.then(function(result){
		console.log(chalk.green("SEED REPORT: Variation Database Clear Successful: " + result));
		return Variation.collection.insert(dataVariations)
	})
	.then(function(result){
		console.log(chalk.green("SEED REPORT: Variation Database Seed Successful: " + result));
		console.log();
		process.exit();
	})
	.catch(function(err){
		console.log(chalk.red("SEED FAILURE: Database Seed Unsuccessful: " + err));
		process.exit();
	})
.done();