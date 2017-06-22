var root_folder = process.cwd();

module.exports.time = 3000;

var db = require('../database/db_api').db_reference;
module.exports.f = function(){
//////////

db.query('select uid from UserStage where stage > 0 and stage < 4')
.then(
    data => {
        console.log('stage',data)
    }
)

//////////
}

/*

User stages:

0 - user just registered
1 - user was signed in. Send "introduction" email
2 - send "about project" email
3 - send "offer" email
4 - send "partnership" email

increase user stage each time we send an email

*/