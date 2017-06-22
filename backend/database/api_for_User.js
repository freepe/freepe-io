module.exports = function(mctx,cbfail,cbok){
///////////
var api = mctx.api;
var db = mctx.db;
var User = mctx.User;

api.signin = function(obj,cbfail,cbok){
	if(!User){
		console.log('DB is not ready yet');
		cbfail('DB is not ready yet');
		return;
	}
	var query, params;
	if(obj.login){
		query = 'select @rid from User where login = :login and password = :password and active = true'
		params = {
			login: obj.login,
			password: obj.password
		}
	}else{
		query = 'select @rid from User where email = :email and password = :password and active = true'
		params = {
			email: obj.email,
			password: obj.password
		}
	}
	db.query(query,{
		params: params
	})
	.then(function(data){
		if(data.length != 1){
			cbfail('user not found');
			return;
		}
		console.log(data[0])
		api.checkUserStage({
			uid: data[0]
		}, fail => {
			// 
		}, ok => {
			// 
		});
		cbok(data[0]);
	})
	.catch(function(err){
		console.log(err);
		cbfail("undefined error");
	});
}

api.createUser = function(obj,cbfail,cbok){
	if(!User){
		console.log('DB is not ready yet');
		cbfail('DB is not ready yet');
		return;
	}
	if(!obj.ref_link || !obj.email || !obj.name || !obj.sname || !obj.pass){
		cbfail("wrong data");
		return;
	}
	api.find_ref_link({
		ref_link: obj.ref_link
	},err => {
		console.log(err,obj.ref_link)
		cbfail("referral link not found");
	},affiliate => {
		var query = 'select email from user where email = :email';
		var params = {
			email: obj.email
		};
		if(obj.login){
			query += ' or login = :login';
			params.login = obj.login;
		}
		db.query(query,{
			params: params
		})
		.then(
			res => {
				if(res.length){
					if(res[0].email == obj.email){
						cbfail('email busy');
					}else{
						cbfail('login busy');
					}
					return;
				}else{
					var params = {
						email: obj.email,
						username: obj.name + ' ' + obj.sname,
						password: obj.pass,
						time: Date.now(),
						ref_link: generateRandomString(17),
						fpt: 0,
						active: false
					}
					if(obj.login)params.login = obj.login;
					User.create(params)
					.then(function(data){
						cbok();
					})
					.catch(function(err){
						console.log(err)
						cbfail("can't create new user");
					});
				}
			}
		)
		.catch(
			err => {
				cbfail("can't create user");
			}
		);
	});
}

api.activateUser = function(obj, cbfail, cbok){
	api.findEmail({
		email: obj.email,
		key: obj.key
	}, fail => {
		cbfail("verification email not found");
	}, veremail => {
		api.find_ref_link({
			ref_link: veremail.ref_link
		}, fail => {
			cbfail('referral not works more');
		}, affiliate => {
			api.findUser({
				email: obj.email
			}, function(){
				cbfail('user not found');
			}, cur_user => {
				if(cur_user.active){
					cbfail('user already activated');
					return;
				}
				db.let('history', function(h){
					h.create('VERTEX', 'UHistory')
					.set({
						uid: affiliate.rid,
						event: 'fpt',
						type: 'fpt_up',
						reason: 'user_registered',
						initiator: cur_user.rid,
						time: Date.now(),
						val: 20
					})
				})
				.let('fpt', function(c){
					c.update(affiliate.rid)
					.set({
						fpt: affiliate.fpt + 20
					})
				})
				.let('user', function(c){
					c.update(cur_user.rid)
					.set({
						active: true
					})
				})
				.let('invite', function(c){
					c.create('EDGE', 'InvitedBy')
					.from(cur_user.rid)
					.to(affiliate.rid)
				})
				.commit().return('$edge').all()
				.then(
					function(transaction){
						cbok();
						api.useRegistrationEmail({
							email: obj.email,
							key: obj.key,
						});
					}
				)
				.catch(
					err => {
						cbfail("can't verify user");
					}
				);
			});
		});
	});
}

api.find_ref_link = function(obj,cbfail,cbok){
	if(obj.ref_link){
		db.query('select @rid,fpt from User where ref_link = :ref_link and active = true',{
			params: {
				ref_link: obj.ref_link
			}
		})
		.then(function(data){
			data.length?
			cbok(data[0]):
			cbfail('user not found');
		})
		.catch(function(err){
			// console.log(err)
			cbfail("user not found");
		});
	}
}

api.findUser = function(obj,cbfail,cbok){
	if(obj.uid){
		db.record.get(obj.uid)
		.then(function(data){
			cbok(data);
		})
		.catch(function(err){
			console.log(err);
			cbfail("user not found");
		});
	}else
	if(obj.email || obj.login){
		var query,params;
		if(obj.email){
			query = 'select @rid,active from User where email = :email';
			params = {email: obj.email};
		}else{
			var login = obj.login.replace(/\'/g,'\\\'');
			// (?i) is a Java feature to make query case insensitive
			query = "select @rid,active from User where login matches '(?i)" + login + "'";
			params = {};
		}
		db.query(query,{
			params: params
		})
		.then(function(data){
			data.length?
			cbok(data[0]):
			cbfail('user not found');
		})
		.catch(function(err){
			// console.log(err)
			cbfail("user not found");
		});
	}
}

api.findUserAffiliate = function(obj,cbfail,cbok){
	if(obj.uid){
		db.query('select in from InvitedBy where out = :uid',{
			params: {
				uid: obj.uid
			}
		})
		.then(function(data){
			data.length ?
			cbok(data[0].in.toString()):
			cbok(false);
		})
		.catch(function(err){
			// console.log(err)
			cbfail("db request error");
		});
	}else{
		cbfail("user not found");
	}
}

var calculateLevel = function(){
	var levels = [100,300,600,1000,1500,2100,2800,3600,4500,5500,6600,7800,9100,10500,12000,13600,15300,17100,19000,21000,23100,25300,27600,30000,32500,35100,37800,40600,43500,46500,49600,52800,56100,59500,63000,66600,70300,74100,78000,82000,86100,90300,94600,99000,103500,108100,112800,117600,122500,127500,132600,137800,143100,148500,154000,159600,165300,171100,177000,183000,189100,195300,201600,208000,214500,221100,227800,234600,241500,248500,255600,262800,270100,277500,285000,292600,300300,308100,316000,324000,332100,340300,348600,357000,365500,374100,382800,391600,400500,409500,418600,427800,437100,446500,456000,465600,475300,485100,495000,505000],
		levlen = levels.length;
	return (v) => {
		if(typeof v != 'number')v = parseInt(v);
		if(v < 100 || isNaN(v))return 1;
		for(var i = 0; i < levlen; i++){
			if(levels[i] > v){
				return i + 1;
			}
		}
		if(v > 100)return 100;
		return v;
	}
}();

var calculatePercent = function() {
	var percents = [1, 2.5, 4.5, 7, 10, 13.5, 17.5, 22, 27, 32.5];
	return (level) => {
		if(typeof level != 'number')level = parseInt(level);
		if(isNaN(level))return 0.01;
		if(level < 11)return percents[level + 1] / 100;
		return 0.325;
	}
}();

api.getAffiliateBTCdata = function(obj,cbfail,cbok) {
	if(!obj.uid)return cbfail('undefined user');
	api.findUserAffiliate({
		uid: obj.uid
	}, fail => {
		cbfail(fail);
	}, affiliateID => {
		db.query('select address from Wallets where owner = :owner and type = "btc" and last_opened > :time_after',{
			params: {
				owner: affiliateID,
				time_after: Date.now() - 864000000// 10 days
			}
		})
		.then(function(data){
			if(data.length){
				db.query('select fpt,email from User where @rid = :uid', {
					params: {
						uid: affiliateID
					}
				})
				.then(function(ok) {
					if(!ok.length)return cbfail(false);
					cbok({
						address: data[0].address,
						percent: calculatePercent(calculateLevel(ok.fpt)),
						email: ok.email
					});
				})
				.catch(function(err) {
					console.log(err);
					cbfail(false);
				})
			} else {
				cbfail(false);
			}
		})
		.catch(function(err){
			// console.log(err)
			cbfail("db request error");
		});
	});
}

api.findUserReferrals = function(obj,cbfail,cbok){
	if(obj.uid){
		db.query('select out from InvitedBy where in = :uid',{
			params: {
				uid: obj.uid
			}
		})
		.then(function(data){
			console.log(data);
		})
		.catch(function(err){
			// console.log(err)
			cbfail("db request error");
		});
	}else{
		cbfail("user not found");
	}
}
cbok();
///////////
}

function generateRandomString(length) {
    var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var len = chars.length;
    var str = '';
    for (var i = 0; i < length; i++) {
        str += chars[Math.floor(Math.random() * len)];
    }
    return str;
}