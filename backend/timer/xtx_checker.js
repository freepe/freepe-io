var root_folder = process.cwd();
module.exports.time = 30000;

var db = require('../database/db_api');
module.exports.f = function(){
//////////

db.xtx_update_statuses();

//////////
}