'use strict';

let express = require('express');
let app = express();

var server = require('http').createServer(app);
//var io = require('socket.io')(server);
app.set('port', (process.env.PORT || 3000));

//MARK: MIDDLEWARE
var bodyParser = require('body-parser');
var jwtauth = require('./middleware/jwtauth.js');
var standardLogs = require('./middleware/standardLogs.js');
var standardSecurity = require('./middleware/standardSecurity.js');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(standardLogs);
app.use(standardSecurity);

//Mark: Route Vars
var User = require('./routes/User.js');
var Media = require('./routes/Media.js');
var Friend = require('./routes/Friend.js');
var Activity = require('./routes/Activity.js');
var Profile = require('./routes/Profile.js');
var Follow = require('./routes/Follow.js');
var Tree = require('./routes/Tree.js');
var Leaf = require('./routes/Leaf.js');
var Mailbox = require('./routes/Mailbox.js');
var Witness = require('./routes/Witness.js');
var Comment = require('./routes/Comment.js');
var News = require('./routes/News.js');
var Gallery = require('./routes/Gallery.js');

//MARK: ROUTES
//Public Routes
var publicRouter = express.Router();

publicRouter.get('/', function(req, res) {
	res.status(200).json({"message":"Server Online"});
});
publicRouter.post('/new', User.createUser);
publicRouter.post('/login', User.login);

app.use('/', publicRouter);

//Private Routes
var privateRouter = express.Router();

privateRouter.use(jwtauth);

//User Admin Related
privateRouter.post('/friends/:id', Friend.createFriend);
privateRouter.put('/friends/:id', Friend.confirmFriend);
privateRouter.put('/friends/remove/:id', Friend.destroyFriendship);
privateRouter.put('/friends/reinitialize/:id', Friend.reinitializeFriend);
privateRouter.get('/friends/:id', Friend.getFriends);

privateRouter.post('/follow/new', Follow.newFollow);
privateRouter.delete('/follow/:id', Follow.removeFollow);
privateRouter.get('/follow/:id', Follow.getFollowing);

privateRouter.get('/mail/notifications', Mailbox.getNotifications);
privateRouter.put('/mail/notifications', Mailbox.markNotificationsSeen);

privateRouter.get('/gallery/:id', Gallery.getGallery);

privateRouter.post('/witness/new', Witness.createWitness);
privateRouter.delete('/witness/remove/:id', Witness.destroyWitness);

//General
privateRouter.get('/users/search/:term', User.searchUsers);
privateRouter.get('/currentUser/profile', Profile.currentUserProfile);
privateRouter.get('/user/profile/:id', Profile.userProfile);
privateRouter.put('/user/update', User.updateUser);

//News
privateRouter.get('/news/leaf/:activityName/:abilityName', News.getLeafFeed);
privateRouter.get('/news/:activityName', News.getNewsfeed);
//Tree Related
privateRouter.get('/activities/:activityTerm', Activity.searchActivities);
privateRouter.get('/abilities/:activityName/:abilityTerm', Leaf.findExistingAbility);

//Media
privateRouter.post('/media', Media.postMedia);
privateRouter.put('/media/update', Media.updateMedia);
privateRouter.post('/gallery/media', Gallery.mediaToGallery);
privateRouter.post('/media/comment/new', Comment.createComment);
privateRouter.post('/media/like/new', Comment.newLike);

privateRouter.post('/leaf/new', Leaf.newLeaf);
privateRouter.put('/leaf/update', Leaf.updateLeaf);
privateRouter.get('/tree/:activityName/:id', Tree.getTree);
privateRouter.get('/leaves/:leafId', Leaf.getLeafData);
privateRouter.put('/tree/:activityName/update', Tree.saveTree);

app.use('/token', privateRouter);

/*
NOTE:
Dont use sockets unless you have to, it drains the server.... send notifications using your notification service, duh
*/

//MARK: SOCKET CONNECTIONS
// io.on('connection', function(socket){
//   console.log("Connected With Client");
//   socket.on('message', function(data){
//     console.log("message recieved: " + JSON.stringify(data));
//   });

//   socket.on('disconect', function(){
//     console.log("Client disconnected");
//   });
// });

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

