module.exports = function(mctx,cbfail,cbok){
///////////
var api = mctx.api;
var db = mctx.db;
var Administration = mctx.Administration;
api.getAdminInfo = function(obj,cbfail,cbok){
	if(!Administration){
		console.log('Administration class not available');
		return;
	}
	var query, params;
	if(obj.access && obj.uid){
		query = 'select access, level from Administration where uid = :uid and access = :access';
		params = {
			uid: obj.uid,
			access: obj.access
		}
	}
	else if(obj.uid){
		query = 'select access, level from Administration where uid = :uid';
		params = {
			uid: obj.uid
		}
	}else{
		cbfail('undefined user id');
		return;
	}
	db.query(query,{
		params: params
	})
	.then(function(data){
		data.length?
		cbok(data[0]):
		cbfail();
	});
}
cbok();
///////////
}