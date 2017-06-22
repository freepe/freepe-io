module.exports = function(mctx,cbfail,cbok){
///////////
var api = mctx.api;
var db = mctx.db;
var Subscription = mctx.Subscription;
var subscribe = function(obj,cbfail,cbok){
	if(!Subscription){
		console.log('DB is not ready yet');
		cbfail('DB is not ready yet');
		return;
	}
	if(!obj.email || !obj.groups || !obj.groups.length){
		cbfail('wrong input data provided');
		return;
	}
	var arr = [];
	obj.groups.forEach(v => {
		arr.push({
			email: obj.email,
			time: Date.now(),
			type: v
		});
	});
	Subscription.create(arr)
	.then(function(){
		cbok();
	})
	.catch(function(err){
		// console.log(err)
		cbfail("can't add new subsription");
	});
}
var unsubscribe = function(obj,cbfail,cbok){
	if(!Subscription){
		console.log('DB is not ready yet');
		cbfail('DB is not ready yet');
		return;
	}
	if(!obj.email || !obj.groups || !obj.groups.length){
		cbfail('wrong input data provided');
		return;
	}
	db.query('delete vertex Subscription where email = :email AND type in :arr',{
		params: {
			email: obj.email,
			arr: obj.groups
		}
	})
	.then(function(){
		cbok();
	})
	.catch(function(err){
		// console.log(err)
		cbfail("can't unsubsribe");
	});
}
api.subscriptionUpdate = function(obj,cbfail,cbok){
	if(!Subscription){
		console.log('DB is not ready yet');
		cbfail('DB is not ready yet');
		return;
	}
	if(!obj.groups){
		cbfail('wrong input data provided');
		return;
	}
	if(obj.uid){
		api.subscriptionTypes({
			uid: obj.uid
		},cbfail
		,function(data){
			var add = [];
			var remove = [];
			var exist = data.groups;
			if(!exist.length){
				add = obj.groups;
			}else{
				var map_exist = {};
				var map_set = {};
				exist.forEach(v => {
					map_exist[v] = 1;
				});
				obj.groups.forEach(v => {
					if(!map_exist[v])add.push(v);
					map_set[v] = 1;
				});
				exist.forEach(v => {
					if(!map_set[v])remove.push(v);
				});
			}
			if(remove.length){
				unsubscribe({
					email: data.email,
					groups: remove
				},cbfail,function(){
					if(add.length){
						insert();
					}else{
						cbok({
							add: add,
							remove: remove,
							exist: data.groups
						});
					}
				});
			}else
			if(add.length){
				insert();
			}else{
				cbok({
					exist: data.groups
				});
			}
			function insert(){
				subscribe({
					email: data.email,
					groups: add
				},cbfail,function(){
					cbok({
						add: add,
						remove: remove,
						exist: data.groups
					});
				});
			}
		});
	}else
	if(!obj.email){
		cbfail('wrong input data provided');
		return;
	}
	return;
	api.subscriptionTypes({
		email: obj.email
	},cbfail
	,function(data){
		var add = [];
		var remove = [];
		cbok({
			add: add,
			remove: remove
		});
	});
}
api.subscriptionTypes = function(obj,cbfail,cbok){
	if(!Subscription){
		console.log('DB is not ready yet');
		cbfail('DB is not ready yet');
		return;
	}
	if(obj.uid){
		api.findUser({
			uid: obj.uid
		},function(reason){
			cbfail(reason);
		},function(data){
			step2(data.email);
		});
	}
	else if(obj.email){
		step2(email);
	}
	else{
		cbfail('wrong input data provided');
		return;
	}
	function step2(email){
		db.query('select type from Subscription where email = :email',{
			params: {
				email: email
			}
		})
		.then(function(data){
			var types = [];
			data.forEach(v => {
				types.push(v.type);
			});
			cbok({
				email: email,
				groups: types
			});
		})
		.catch(function(err){
			// console.log(err)
			cbfail("email not found");
		});
	}
}
api.getMailingData = function(obj, cbfail, cbok){
	db.query('select email,type from Subscription')
	.then(function(v){
		var o = [];
		v.forEach(r => {
			o.push({
				email: r.email,
				groups: r.type
			});
		});
		var emails = [];
		var groups = {};
		var total_emails = 0;
		var total_groups = {};
		o.forEach(v => {
			if(emails.indexOf(v.email) < 0){
				emails.push(v.email);
				total_emails++;
			}
			// emails[v.email].push(v.groups);
			if(!groups[v.groups]){
				groups[v.groups] = [];
				total_groups[v.groups] = 0;
			}
			groups[v.groups].push(v.email);
			total_groups[v.groups]++;
		});
		cbok({
			emails: emails,
			groups: groups,
		});
	})
	.catch(function(err){
		// console.log(err)
		cbfail("can't find");
	});
}
cbok();
///////////
}