'use strict';

//MARK: DEPENDENCIES
let express = require('express');
let app = express();

var Promise = require('bluebird');

var Friend = require('./../models/FriendSchema.js');
var Witness = require('./../models/WitnessSchema.js');
var User = require('./User.js');
var UserModel = require('./../models/UserSchema.js');
var Media = require('./Media.js');
var Leaf = require('./Leaf.js');
var Notification = require('./../models/NotificationSchema.js');

function createNotification(userToNotify_Id, userNotifying_Id, type, mediaId, leafId) {
	return new Promise(function(resolve, reject) {
		var currentTime = Date.now();
		//leaf.update
		//User has to be one of the other users friends though
		var newNotification = new Notification({
			userToNotify_Id: userToNotify_Id,
			userNotifying_Id: userNotifying_Id,
			seen: false,
			type: type,
			mediaId: mediaId,
			leafId: leafId,
			timestamp: currentTime
		});

		newNotification.save()
			.then(notification => {
				resolve(notification);
				// TODO: After creation, alert the push notification service! (tbcreated)
			})
			.catch(err => {
				reject(err);
			})
		.done();
	});
}

module.exports = {
	createNotifications: (usersToNotify_Ids, userNotifying_Id, type, mediaId, leafId) => {
		var notify = function notifyUser(user_Id) {
			createNotification(user_Id, userNotifying_Id, type, mediaId, leafId);
		}
		let action = usersToNotify_Ids.map(notify);
		return Promise.promisifyAll(action, {multiArgs: true});
	},

	markNotificationsSeen: (req, res) => {
		let notificationIds = req.body.notificationIds;
		Notification.update({ _id: { $in: notificationIds }}, { seen: true }).exec()
			.then(result => {
				res.status(200).json({message: "Notification seen updated"});
				// TODO: After creation, alert the push notification service.
			})
			.catch(err => {
				res.status(400).json({message: "Notification seen update failed"});
			})
		.done();
	},

//should be mapping the objects to attach whatever they need attached to them #es6Bitch
	getNotifications: (req, res) => {
		let user_Id = req.user._id;
		console.log(`Generating notifications for ${user_Id}`);
		Notification.find({ userToNotify_Id: user_Id, userNotifying_Id: {$ne: user_Id} }).sort( { timestamp: -1 } ).limit(10).exec()
			.then(notifications => {
				req.notifications = notifications;
				console.log("Notifications found: " + JSON.stringify(notifications));
				var mediaIds = [];
				notifications.forEach(notification => {
					if (notification.mediaId) {
						mediaIds.push(notification.mediaId);
					}
				});	
				return Media.getMediaWithQuery({mediaId: {$in: mediaIds}})				
			})
			.then(mediaObjects => {
				var userIds = [];
				req.notifications.forEach(notification => {
					//attach the mediaObjects
					mediaObjects.media.forEach(object => {
						if (object.mediaId = notification.mediaId) {
							notification._doc.mediaObject = object;
						}
					})
					//get userId
					userIds.push(notification.userNotifying_Id);
				});	
				return User.userProfilesForIds(userIds)	
			})
			.then(users => {
				console.log("Users for notifications found: " + JSON.stringify(users));
				var leafIds = [];
				req.notifications.forEach(notification => {
					leafIds.push(notification.leafId);
					users.forEach(user => {
						if (notification.userNotifying_Id == user.userInfo._id) {
							notification._doc.userNotifying = user.userInfo;
						}
					})
				});

				var leafInfo = function getInfo(leafId) {
					Leaf.generateLeafData(leafId);
				}

				let action = leafIds.map(leafInfo);
				return Promise.promisifyAll(action, {multiArgs: true})			
			})
			.then(leaves => {
				leaves.forEach(leaf => {
					req.notifications.forEach(notification => {
						if (notification.leafId != null) {
							if (notification.leafId == leaf.leafId) {
								notification._doc.leafInfo = leaf;
							}
						}
					});
				})
				res.status(200).json({ notifications: req.notifications });
			})
			.catch(err => {
				console.log("Error fetching notifications: " + err);
				res.status(400).json({ message: "Error fetching notifications: " + err});
			})
		.done();
	}

} //END EXPORTS



// exports.getRequests = function(req, res) {
// 	let user_Id = req.user._id;
// 	var user_Ids = [];
// 	Friend.find({$or : [{recipient_Id: user_Id}], confirmed: false}).exec()
// 		.then(function(friends){
// 			console.log("Friends: " + friends);
// 			req.unconfirmedFriends = friends;
// 			friends.forEach(function(friend){
// 				user_Ids.push(friend.sender_Id != user_Id ? friend.sender_Id : friend.recipient_Id);
// 			});
// 			return Witness.find({witnessed_Id: user_Id, confirmed: false}).exec()
// 		}).then(function(witnesses){
// 			req.unconfirmedWitnesses = witnesses;
// 			witnesses.forEach(function(witness){
// 				user_Ids.push(witness.witness_Id);
// 			})
// 			return UserModel.find({"_id": {$in: user_Ids}}).exec()
// 		})
// 		.then(function(users){
// 			var requestUsers = [];
// 			users.forEach(function(user){
// 				requestUsers.push({userInfo: User.userInfo(user)});
// 			});
// 			requestUsers.forEach(function(requestUser){
// 				let _id = requestUser._id;
// 				req.unconfirmedFriends.forEach(function(friendship){
// 					if (_id == friendship.sender_Id) {
// 						requestUser.unconfirmedFriendship = friendship;
// 					}
// 				});
// 				req.unconfirmedWitnesses.forEach(function(witness){
// 					if (_id == witness.witnessId) {
// 						requestUser.unconfirmedWitness = witness;
// 					}
// 				});
// 			})
// 			res.status(200).json({requestUsers: requestUsers});
// 		})
// 		.catch(function(err){
// 			res.status(400).json({message: "Error getting friends: " + err});
// 		})
// 	.done();
// }