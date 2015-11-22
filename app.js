   //MARK: GLOBAL DEPENDENCIES
var express = require('express');
app = express();
mongoose = require('mongoose');
var server = require('http').createServer(app);
var io = require('socket.io')(server);

//MARK: MODULES
var bodyParser = require('body-parser');

//MARK: CUSTOM DEPENDENCIES
var jwtauth = require('./middleware/jwtauth.js');
var users = require('./models/User.js');
var media = require('./models/Media.js');
var leaf = require('./models/Leaf.js');


//MARK: CONFIG
app.set('jwtTokenSecret', 'secretStringFTW');
mongoose.connect('mongodb://localhost/peatAPI');

//MARK: MIDDLEWARE
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(jwtauth);


//MARK: ROUTES
app.get('/', function(req, res) {
	res.status(200).json({"message":"Server Online"});
});
app.post('/', function(req, res) {
	res.status(200).json({"message":"Server Online"});
});

//User
app.post('/login', users.login);
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

// server.listen(8080);
app.listen(3000);
