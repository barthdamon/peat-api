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
var publicRouter = express.Router();

publicRouter.get('/', function(req, res) {
	res.status(200).json({"message":"Server Online"});
});
publicRouter.post('/', function(req, res) {
	res.status(200).json({"message":"Server Online"});
});
publicRouter.post('/new', users.createUser);
publicRouter.post('/login', users.login);

app.use('/pub', publicRouter);

//Private Routes
var privateRouter = express.Router();

privateRouter.use(jwtauth);
privateRouter.post('/users/search', users.searchUsers);
privateRouter.get('/friends', users.getFriends);
privateRouter.put('/friends', users.putFriend);
//Media
privateRouter.post('/media', media.postMedia);
privateRouter.get('/media', media.getMedia);
privateRouter.post('/media/update', media.getUpdate);
privateRouter.post('/media/extend', media.extendNewsfeed);
//Tree
privateRouter.post('/leaves', leaf.createLeaf);
privateRouter.post('/leaves/get', leaf.getLeaves);

app.use('/priv', privateRouter);



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

