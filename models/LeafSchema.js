'use strict';

/*
Description: Leaves are what users pull and manipulate and add media to in their tree. 
Users can add, remove, and change the relationships of leaves.
They can also group leaves into categories, like folders on an iphone.

Need to figure out:
When in a grouping, the coordinates of the leaf are based off of the coordinates of the grouping?
Or groupings just have color codes and can have links drawn from them and to other groupings....
Groupings could have moving goo around them that looks like liquid. when you click on the goo you get a name for the grouping
Groupings would then have to overlap. Would basically have to draw the goo over them. For now groupings can just be colors
z index determines which color is on top (others, which MUST be larger, would be on the bottom)

People should be able to totally customize all teh colors on their tree. The background, and the goo colors.

There need to be In progress leaves that you can create, but that are grayed out and have an in construction feel to them (like half filled with juice or something)

Different types of goo would be cool too!

status can be either Completed, Learning, Future Goal
--Future Goal is always faded gray, learning is more prominent gray and complete is white.
--background a deep black like the stars
--groupings can be any color people want them to be (except white and black)
*/

let express = require('express');
let app = express();
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var db = require('./../config/db.js');

var leafSchema = mongoose.Schema({
	user_Id: String,
	activity: String,
	leafId: String,
	mediaIds: [String],
	witness_Ids: [String],
	layout: {
		coordinates: {
			x: Number,
			y: Number
		},
		connections: [{leafId: String, type: String,}],
		groupings: [{name: String, color: String, zIndex: Number}]
	},
	status: String,
	title: String,
	description: String
});

mongoose.model('Leaf', leafSchema);
var Leaf = db.model('Leaf');

module.exports = Leaf;
