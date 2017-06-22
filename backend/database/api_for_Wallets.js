module.exports = function(mctx,cbfail,cbok){
///////////
var api = mctx.api;
var db = mctx.db;
var Wallets = mctx.Wallets;
if(!Wallets){
	console.log('Wallets class not available');
	return cbfail('Wallets not available yet');
}
api.getMyWallets = function(obj,cbfail,cbok){
	var query, params;
	if(obj.uid){
		query = 'select address, name, description from Wallets where owner = :uid';
		params = {
			uid: obj.uid
		}
	}else{
		return cbfail('undefined user id');
	}
	db.query(query,{
		params: params
	})
	.then(function(data){
		cbok(data);
	});
}
api.setMyWallets = function(obj,cbfail,cbok){
	api.getMyWallets({
		uid: obj.uid
	}, fail => {
		cbfail(fail);
	}, ok => {
		if(!ok.length){
			// var query, params;
			// if(obj.uid){
			// 	query = 'select address, name, description from Wallets where owner = :uid';
			// 	params = {
			// 		uid: obj.uid
			// 	}
			// }else{
			// 	cbfail('undefined user id');
			// 	return;
			// }
			// db.query(query,{
			// 	params: params
			// })
			// .then(function(data){
			// 	cbok(data);
			// });
		}else{
			return cbfail('Wallets for user already created');
		}
	});
}
api.logWalletDecryption = function(obj,cbfail,cbok){
	if(!obj.addresses || obj.addresses.length != 2){
		return cbfail('undefined wallet addresses');
	}
	if(!obj.uid){
		return cbfail('undefined user id');
	}
	db.query('select address from Wallets where owner = :uid',{
		params: {
			uid: obj.uid
		}
	})
	.then(function(data){
		if(!data.length) {
			// create addresses
			var ads = obj.addresses;
			var arr = [{
				address: ads[0],
				owner: obj.uid,
				last_opened: Date.now(),
				type: 'fpn'
			},{
				address: ads[1],
				owner: obj.uid,
				last_opened: Date.now(),
				type: 'btc'
			}];
			Wallets.create(arr)
			.then(function(data){
				cbok();
			})
			.catch(function(err){
				console.log('wallet registration error',err);
				cbfail();
			});
		} else {
			// just update last opened time
			db.query('update Wallets set last_opened = :time where owner = :uid',{
				params:{
					uid: obj.uid,
					time: Date.now(),
				}
			})
			.then(function(data){
				cbok();
			})
			.catch(function(err){
				console.log('wallet registration error',err);
				cbfail();
			});
		}
	});
}
cbok();
///////////
}