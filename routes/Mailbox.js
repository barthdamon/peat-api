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

var Notification = require('./../models/NotificationSchema.js');


module.exports = {
	createNotification: (userToNotify_Id, userNotifying_Id, type, mediaId) => {
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
				timestamp: currentTime
			});

			newNotification.save()
				.then(notification => {
					resolve(notification);
					// TODO: After creation, alert the push notification service.
				})
				.catch(err => {
					reject(err);
				})
			.done();
		});
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
		// if a notification has a certain mediaId on it then ask for that piece of media again from the store
		Notification.find({ $query: {userToNotify_Id : req.user._id}, $orderby: { timestamp : -1 }}).limit(10).exec()
			.then(notifications => {
				req.notifications = notifications;
				var mediaIds = [];
				if (notifications) {
					notifications.forEach(notification => {
						if (notification.mediaId) {
							mediaIds.append(notification.mediaId);
						}
					});	
					return Media.getMediaWithQuery({mediaId: {$in: mediaIds}})				
				} else {
					return Promise.resolve(null);
				}
			})
			.then(mediaObjects => {
				var userIds = [];
				if (mediaObjects) {
					req.notifications.forEach(notification => {
						//attach the mediaObjects
						mediaObjects.forEach(object => {
							if (object.mediaId = notification.mediaId) {
								notification._doc.mediaObject = object;
							}
						})
						//get userId
						userIds.append(notification.userNotifying_Id);
					});		
					return User.userProfilesForIds(userIds)			
				} else {
					return Promise.resolve(null);
				}
			})
			.then(users => {
				let notifications = req.notifications != null ? req.notifications : [] ;
				if (users && notifications.count > 0) {
					notifications.forEach(notification => {
						users.forEach(user => {
							if (notification.userNotifying_Id == user._id) {
								notification._doc.userNotifying = user;
							}
						})
					});					
				}
				res.status(200).json({ notifications: notifications });
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