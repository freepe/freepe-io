var bitcoin = require('bitcoinjs-lib');
var network_key;
(function(){
var config = require('../../config');
if(config.islocal){
	network_key = bitcoin.networks.testnet;
	network_host = 'https://testnet.blockexplorer.com/api/';
}else{
	network_key = bitcoin.networks.bitcoin;
	network_host = 'https://blockexplorer.com/api/';
}
}());

var request = require('request');
var colu_api = require('../colu/');

function sat2btc(sat){
	sat = parseInt(sat);
	if(isNaN(sat))return false;
	var btc = sat/100000000;
	btc = btc.toFixed(8) * 1;
	return btc;
}
function btc2sat(btc){
	btc = parseFloat(btc);
	if(isNaN(btc))return false;
	btc = btc.toFixed(8);
	var sat = btc * 100000000;
	return sat;
}
function n2fpn(sat) {
    sat = parseInt(sat);
    if (isNaN(sat)) return false;
    var btc = sat / 10000000;
    btc = btc.toFixed(7) * 1;
    return btc;
}
function fpn2n(btc) {
    btc = parseFloat(btc);
    if (isNaN(btc)) return false;
    btc = btc.toFixed(7);
    var sat = btc * 10000000;
    return sat;
}


module.exports = function(mctx,cbfail,cbok){
///////////
var api = mctx.api;
var db = mctx.db;
var Xtransaction = mctx.Xtransaction;

if(!Xtransaction){
	console.log('Xtransaction class not available');
	return cbfail('Xtransaction not available yet');
}
api.xtx_request = function(obj,cbfail,cbok){
	if(!obj.network_key)return cbfail('undefined network mode');
	var query, params;
	var key = bitcoin.ECKey.makeRandom();
	var address = key.pub.getAddress(obj.network_key).toString();
	var wif = key.toWIF(obj.network_key);
	var cencrypted = require('../../requires/xtx_encryption_key').encrypt(wif);
	// return cbok({c:address,cencrypted:cencrypted});
	if(!obj.a || !obj.auser || !obj.b || !obj.buser || !obj.fromc || !obj.intoc || !obj.acv || !obj.bcv)return cbfail('not enough data provided');
	// query = 'select address, name, description from Xtransaction where owner = :uid';
	params = {
		a: obj.a,
		b: obj.b,
		c: address,
		auser: obj.auser,
		buser: obj.buser,
		acv: obj.acv,
		bcv: obj.bcv,
		fromc: obj.fromc,
		intoc: obj.intoc,
		cencrypted: cencrypted,
		expires: Date.now() + 172800000,// 2 days
		status: 0,
	}
	Xtransaction.create(params)
	.then(function(data){
		cbok(params);
	})
	.catch(function(err){
		console.log(err)
		cbfail("unable to create request");
	});
}
api.xtx_update_statuses = function(obj,cbfail,cbok){
	db.query('select from Xtransaction where status = 2',{
		params: {
		}
	})
	.then(function(data){
		// console.log(data);
		if(data.length){
			data.forEach(r => {
				api.xtx_finish_c({
					cencrypted: r.cencrypted,
					b: r.b,
					c: r.c,
					acv: r.acv
				}, fail => {
					console.log(fail);
				}, ok => {
					// 
				});
			})
		}
	});
}
api.xtx_my_pending = function(obj,cbfail,cbok){
	if(!obj.socket)return cbfail('undefined user');
	var uid = obj.socket.uid;
	db.query('select c,acv,bcv,fromc,status from Xtransaction where status < 2 and auser = :uid and buser = "system"',{
		params: {
			uid: uid
		}
	})
	.then(function(data){
		var arr = [];
		data.forEach(o => {
			arr.push({
				c: o.c,
				btc: o.acv,
				fpn: o.bcv,
				type: o.fromc,
				status: o.status
			})
		})
		cbok(arr);
	});
}
api.xtx_check_for = function(obj,cbfail,cbok){
	if(!obj.socket)return cbfail('undefined user');
	if(!obj.c)return cbfail('not enough data');
	var uid = obj.socket.uid;
	db.query('select a,auser,b,c,acv,bcv,cencrypted,status from Xtransaction where c = :c and auser = :uid and buser = "system"',{
		params: {
			uid: uid,
			c: obj.c
		}
	})
	.then(function(o){
		if(o.length){
			o = o[0];
			if(o.status > 1)return cbfail('FPN already sent');
			request({
				method: 'GET',
				url: network_host + 'addr/' + obj.c + '/balance',
				headers: {
					'Content-Type': 'application/json'
				}
			}, function (error, response, balance) {
				if(response.statusCode == 200){
					if(balance >= o.acv){
						colu_api.systemTransferFPN({
							toAddress: o.a,
							amount: o.bcv
						}, fail => {
							cbfail(fail);
						}, ok => {
							console.log(ok);
							// !!! should provide method to store info locally if db connection error
							db.query('update Xtransaction set status = 2 where c = :c and status < 2',{
								params:{
									c: o.c
								}
							})
							.then(function(){
								api.xtx_finish_c(o,fail => {
									console.log(fail);
								},ok => {
									// 
								});
							})
							cbok({
								amount: o.bcv,
								c: o.c
							});
						});
					}else{
						cbfail('not enough payed');
					}
				}else{
					cbfail(balance);
				}
			});
		}else{
			cbfail('not found');
		}
	});
}
api.xtx_finish_c = function(o,cbfail,cbok){
	if(!o.cencrypted)return cbfail('undefined encrypted key');
	if(!o.auser)return cbfail('undefined user id');
	if(!o.c)return cbfail('undefined c address');
	if(!o.b)return cbfail('undefined b address');
	if(!o.acv)return cbfail('undefined acv');
	var cencrypted = o.cencrypted;
	var wif = require('../../requires/xtx_encryption_key').decrypt(cencrypted);
	var key = bitcoin.ECKey.fromWIF(wif,network_key);
	// var address = key.pub.getAddress(network_key).toString(); == o.c
	db.getAffiliateBTCdata({
		uid: o.auser
	}, fail => {
		console.log('affiliate for user',o.auser,'not found');
		colu_api.btcTransfer({
			key: key,
			address: o.c,
			receiver: o.b,
			btc: sat2btc(o.acv),
		},fail => {
			console.log(fail);
			console.log('unable to finish transaction',o.c);
		}, ok => {
			console.log(ok);
			db.query('update Xtransaction set status = 3 where c = :c',{
				params:{
					c: o.c
				}
			})
		});
	}, ok => {
		colu_api.btcTransfer({
			key: key,
			address: o.c,
			receiver: o.b,
			affiliate_address: ok.address,
			affiliate_percent: ok.percent,
			affiliate_email: ok.email,
			btc: sat2btc(o.acv),
		},fail => {
			console.log(fail);
			console.log('unable to finish transaction',o.c);
		}, ok => {
			console.log(ok);
			db.query('update Xtransaction set status = 3 where c = :c',{
				params:{
					c: o.c
				}
			})
		});
	});
}
api.xtx_finish = function(obj,cbfail,cbok){
	if(!obj.socket)return cbfail('undefined user');
	var uid = obj.socket.uid;
	db.query('select c,acv,bcv,fromc,status from Xtransaction where status < 2 and auser = :uid and buser = "system"',{
		params: {
			uid: uid
		}
	})
	.then(function(data){
		var arr = [];
		data.forEach(o => {
			arr.push({
				c: o.c,
				btc: o.acv,
				fpn: o.bcv,
				type: o.fromc,
				status: o.status
			})
		})
		cbok(arr);
	});
}
cbok();
///////////
}