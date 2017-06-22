module.exports = function(mctx,cbfail,cbok){
///////////
var api = mctx.api;
var db = mctx.db;
var EmailTrigger = mctx.EmailTrigger;
if(!EmailTrigger){
	console.log('EmailTrigger class not available');
	return cbfail();
}

api.saveEmailTrigger = function(obj,cbfail,cbok){
	if(!obj.email || !obj.type || !obj.data)return cbfail('not enough data provided for saving EmailTrigger');
	EmailTrigger.create({
		email: obj.email,
		type: obj.type,
		time: Date.now(),
		data: obj.data
	})
	.then(
		data => {
			cbok(data);
		}
	)
	.catch(
		err => {
			cbfail();
			console.log(err);
		}
	);
}

cbok();
///////////
}