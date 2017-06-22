module.exports = function(mctx,cbfail,cbok){
///////////
var api = mctx.api;
var db = mctx.db;
var UserStage = mctx.UserStage;
if(!UserStage){
	console.log('UserStage class not available');
	return;
}

api.checkUserStage = function(obj,cbfail,cbok){
	if(!obj.uid)return cbfail('undefined user');
	db.query('select stage from UserStage where uid = :uid',{
		params: {
			uid: obj.uid
		}
	})
	.then(function(data){
		console.log('stage',data);
		data.length?
		cbok(data[0]):
		cbfail('user not found');
	})
	.catch(function(err){
		// console.log(err)
		cbfail("user not found");
	});
}

cbok();
///////////
}