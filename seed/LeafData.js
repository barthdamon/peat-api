//for each activity have a list of leaves. Before seeding remove any of the default leaves (for now, later need to go update peoples). 
//then replace default activity leaves in the db with the new seeded ones.

//activity schema: Have an 'owner' and 'activity' field for each leaf which is listed as default for the default and the users id for the user.

'use strict';

let express = require('express');
let app = express();
var Promise = require('bluebird');


