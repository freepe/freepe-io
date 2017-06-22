module.exports = function(socket,colu_api,fn1){
/////////
var db = require('../database/db_api');
socket
.on('colu', function(v, fn){
	if(v.act && fn) switch (v.act){
		case 'get_my_balance':
			colu_api.getMyBalance({
				socket: socket,
				addresses: v.addresses
			},fail => {
				fn({reason: fail});
			}, ok => {
				fn(ok);
			});
			break;
		case 'show_all_wallets':
			colu_api.showAllWallets({
				socket: socket,
			},fail => {
				fn({reason: fail});
			}, ok => {
				fn(ok);
			});
			break;
		case 'send_coins':
			colu_api.sendCoins({
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
		case 'xtx_btc_fpn':
			colu_api.xtx_btc_fpn({
				socket: socket,
			},fail => {
				fn({reason: fail});
			}, ok => {
				fn(ok);
			});
			break;
		case 'xtx_buy_fpn':
			colu_api.xtx_buy_fpn({
				socket: socket,
				fpn_amount: v.fpn_amount
			},fail => {
				fn({reason: fail});
			}, ok => {
				fn(ok);
			});
			break;
		case 'xtx_my_pending':
			db.xtx_my_pending({
				socket: socket,
			},fail => {
				fn({reason: fail});
			}, ok => {
				fn(ok);
			});
			break;
		case 'xtx_check_for':
			db.xtx_check_for({
				socket: socket,
				c: v.c
			},fail => {
				fn({reason: fail});
			}, ok => {
				fn(ok);
			});
			break;
		case 'get_encrypted_backup':
			colu_api.get_encrypted_backup({
				socket: socket,
			},fail => {
				fn({reason: fail});
			}, ok => {
				fn(ok);
			});
			break;
		case 'get_raw_backup':
			colu_api.get_raw_backup({
				socket: socket,
			},fail => {
				fn({reason: fail});
			}, ok => {
				fn(ok);
			});
			break;
	}
})
.on('get_blockchain_config', (v, fn) => {
	colu_api.getPublicConfig(0,fail => {
		// 
	}, ok => {
		fn(ok);
	})
});

fn1({ok:true});

/////////
}