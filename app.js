'use strict';

let express = require('express');
let app = express();

var server = require('http').createServer(app);
var io = require('socket.io')(server);
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

//MARK: Models
var User = require('./routes/User.js');
var Media = require('./routes/Media.js');
var Friend = require('./routes/Friend.js');
var Activity = require('./routes/Activity.js');

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
privateRouter.get('/users/search/:term', User.searchUsers);
privateRouter.get('/users/profile/:id', User.userProfile);
privateRouter.post('/friends', Friend.createFriend);
privateRouter.put('/friends', Friend.confirmFriend);
privateRouter.delete('/friends', Friend.destroyFriendship);
privateRouter.post('/media', Media.postMedia);
privateRouter.get('/activity/:type', Activity.getActivity);
privateRouter.get('/activityNewsfeed/:type', Activity.getActivityNewsfeed);

app.use('/token', privateRouter);



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

