module.exports = function(mctx,cbfail,cbok){
///////////
var api = mctx.api;
var db = mctx.db;
var Email = mctx.Email;
if(!Email){
	console.log('Email class not available');
	return;
}

api.findEmail = function(obj,cbfail,cbok){
	var query, params;
	if(obj.key){
		query = 'select @rid,ref_link from Email where email = :email and key = :key and time > :time and used = false';
		params = {
			email: obj.email,
			key: obj.key,
			time: Date.now() - 14400000,// 4 hours
		}
	}else{
		query = 'select @rid from Email where email = :email and time > :time and used = false';
		params = {
			email: obj.email,
			time: Date.now() - 14400000,// 4 hours
		}
	}
	db.query(query,{
		params: params
	})
	.then(function(data){
		data.length?
		cbok(data[0]):
		cbfail();
	})
	.catch(
		err => {
			cbfail();
			console.log(err);
		}
	);
}

api.saveEmailSent = function(obj){
	if(!obj.key || !obj.ref_link){
		console.log("Email for registration not saved. Not enough data provided");
		return;
	}
	Email.create({
		email: obj.email,
		key: obj.key,
		ref_link: obj.ref_link,
		time: Date.now(),
		type: 'verify',
		used: false
	});
}

api.useRegistrationEmail = function(obj){
	db.query('update Email set used = true where email = :email and key = :key and type = "verify" and time > :time',{
		params:{
			email: obj.email,
			key: obj.key,
			time: Date.now() - 14400000,// 4 hours
		}
	});
}
cbok();
///////////
}