module.exports = function(socket){
/////////
var db = require('../database/db_api');

socket
.on('sq', function(v, fn){
	if(v.act && fn) switch (v.act){
		case 'get_data':
			db.findUser({
				uid: socket.uid
			},
			function(reason){
				fn({reason:reason});
			},
			function(data){
				fn({
					user_info: data
				});
			});
			break;
	}
})
.on('subscription', function(v, fn){
	if(v == 'get'){
		db.subscriptionTypes({
			uid: socket.uid
		},
		function(reason){
			fn({reason:reason});
		},
		function(data){
			fn({
				email: data.email,
				subscription_for: data.groups
			});
		});
	}else{
		db.subscriptionUpdate({
			uid: socket.uid,
			groups: v
		},
		function(reason){
			fn({reason:reason});
		},
		function(data){
			fn({
				updated: data
			});
		});
	}
})
.on('init_wallet', function(v, fn){
	if(fn){
		if(!v || !v.pas || v.pas.length < 8)return fn({reason:'invalid password'});
		require('../colu/').init(socket,v.pas,fail => {
			console.error('unable to load colu for user',fail);
			fn({reason:fail});
		}, colu_api => {
			require('./colu')(socket,colu_api,fn);
		});
	}
})


/////////
}