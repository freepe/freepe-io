module.exports = function(socket){
/////////
var db = require('../database/db_api');
var dbr = require('../database/db_api').db_reference;
var ejs = require('ejs')
  , fs = require('fs')
  , appRoot = process.cwd(),
  colu_api;


socket
.on('admin', function(v, fn){
	if(v.act && fn) switch (v.act){
		case 'get_mailing_data':
			db.getMailingData(0,
			function(reason){
				fn({reason:reason});
			},
			function(data){
				fn(data);
			});
			break;
		case 'send_all_emails':
			var group = v.group;
			dbr.query('select email from subscription where email in (select email from user where active = true) and type = :group',{
				params: {
					group: group
				}
			})
			.then(
				data =>{
					fn(data);
				}
			)
			.catch(
				err =>{
					fn('error');
				}
			);
			break;
		case 'preview_mailing':
			var group = v.group;
			try{
				var str = fs.readFileSync(appRoot+'/views/subscriptions/' + group + '.ejs', 'utf8');
				var params = {};
				if(group == 'news'){
					db.findUser({
						uid: socket.uid
					},fail => {
						fn({
							reason: 'user not found'
						});
					}, ok => {
						params.email = ok.email;
						try{
							var html = ejs.render(str, params);
							fn({
								html: html
							});
						}catch(err){
							fn({
								reason: "can't render email. " + (err + '').substr(0,80) + '...'
							});
						}
					});
				}
			}catch(err){
				fn({
					reason: "can't find email for " + group
				});
			}
			break;
	}
})
.on('colu_admin', function handle_request(v, fn){
	if(!fn)return;
	if(!colu_api){
		require('../colu/').getAdminColu(socket, fail => {
			return fn({reason:"unable to access colu for admin"});
		}, api => {
			colu_api = api;
			handle_request(v, fn);
		});
		return fn({reason: 'colu admin not ready'});
	}
	if(v.act && fn) switch (v.act){
		case 'get_data':
			colu_api.getData({
				admin: 1,
				socket: socket,
				addresses: v.addresses
			},fail => {
				fn({reason: fail});
			}, ok => {
				fn(ok);
			});
			break;
		case 'get_my_balance':
			colu_api.getMyBalance({
				admin: 1,
				socket: socket,
			},fail => {
				fn({reason: fail});
			}, ok => {
				fn(ok);
			});
			break;
		case 'show_all_wallets':
			colu_api.showAllWallets({
				admin: 1,
				socket: socket,
			},fail => {
				fn({reason: fail});
			}, ok => {
				fn(ok);
			});
			break;
		case 'send_coins':
			colu_api.sendCoins({
				admin: 1,
				socket: socket,
				from: v.from,
				to: v.to,
				amount: v.amount
			},fail => {
				fn({reason: fail});
			}, ok => {
				fn(ok);
			});
			break;
		case 'issue_asset':
			colu_api.issueAsset({
				admin: 1,
				socket: socket,
			},fail => {
				fn({reason: fail});
			}, ok => {
				fn(ok);
			});
			break;
	}
});

/////////
}