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
var users = require('./routes/User.js');
var media = require('./routes/Media.js');
var leaf = require('./routes/Leaf.js');

//MARK: ROUTES
//Public Routes
app.get('/', function(req, res) {
	res.status(200).json({"message":"Server Online"});
});
app.post('/', function(req, res) {
	res.status(200).json({"message":"Server Online"});
});
app.post('/new', users.createUser);
app.post('/login', users.login);

//Private Routes
app.use(jwtauth);
app.post('/users/search', users.searchUsers);
app.get('/friends', users.getFriends);
app.put('/friends', users.putFriend);
//Media
app.post('/media', media.postMedia);
app.get('/media', media.getMedia);
app.post('/media/update', media.getUpdate);
app.post('/media/extend', media.extendNewsfeed);
//Tree
app.post('/leaves', leaf.createLeaf);
app.post('/leaves/get', leaf.getLeaves);


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

