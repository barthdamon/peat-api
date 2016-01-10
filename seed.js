'use strict';

let express = require('express');
let app = express();

var chalk = require('chalk');

console.log(chalk.magenta('Running seed database process'));
console.log();

var LeafStructure = require('./routes/LeafStructure.js');
var LeafData = require('./seed/LeafData.js');

//MARK: Script Actions
var dataStructures = LeafData.getData();

LeafStructure.clearStructuresForSeed().then(function(result){
	console.log("Leaf Structure Database Clear Successful");
	return LeafStructure.createStructuresFromSeedJson(dataStructures).then(function(){
		endProcess("Leaf Structures Seeded Successfully", true);
	}).catch(function(err){
		endProcess("Leaf Structure Seed Unsuccessful: "+err, false);
	});
}).catch(function(err){
	endProcess("Leaf Structure Database Clear Unsuccessful: "+err, false);
});

function endProcess(report, success) {
	console.log(success ? chalk.green("SEED REPORT: " + report) : chalk.red("SEED REPORT: " + report));
	console.log();
	console.log();
	process.exit();
}