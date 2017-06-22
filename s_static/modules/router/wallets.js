//1.00
DC.module('router/wallets',function(mctx){

var dc_module = DC.temp(function(){
//////
return {
	state: {
		class: 'module-wallets'
	},
	init(){
		return this;
	}
}
//////
});

var publicConfig = {},
	pending_xtx,
	pending_xtx_data = {};

var block = (fn,auth) => {
	var arr = fn();
	var head = arr[1];
	var body = arr[2];
	var bl = DC.temp({
		state: {
			class: 'module-wallets-block'
		}
	});
	auth?bl.insertIn(auth_dc):bl.insertIn(dc_module);
	var foot = arr[3] || DC.temp({
		eltype: 'button',
		state: {
			class: 'b',
			text: 'clear'
		},
		events: {
			click(){
				body.change({text: ''});
			}
		}
	});
	bl.DClist([
		DC.temp({
			eltype: 'h1',
			state: {
				text: arr[0]
			}
		}),
		head,
		body,
		foot
	]);
	return bl;
}

var explorer = function(){
	var prism = 'blockexplorer.com/api/';
	var colored = 'api.coinprism.com/v1/';
	var prismhost = 'https://testnet.' + prism;
	var coloredhost = 'https://testnet.' + colored;
	var fn = (obj,cbfail,cbok) => {
		var request = new XMLHttpRequest();
		var host = obj.type == 'colored' ? coloredhost : prismhost; 
		request.open(obj.method || 'GET', host + obj.url);
		request.setRequestHeader('Content-Type', 'application/json');
		request.onreadystatechange = function () {
			if (this.readyState === 4) {
				if(this.status!=200)return cbfail({reason:JSON.parse(this.responseText)});
				cbok(JSON.parse(this.responseText));
			}
		};
		request.send(JSON.stringify(obj.body));
	}
	fn.reconfig = (network) => {
		if(network == 'testnet'){
			prismhost = 'https://testnet.' + prism;
			coloredhost = 'https://testnet.' + colored;
		}else{
			prismhost = 'https://' + prism;
			coloredhost = 'https://' + colored;
		}
	}
	return fn; 
}();

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

var timer = function(){
	var o = {};
	var ref,refapi,
		periodget = 120000,
		periodapi = 10000;
	var f = o.f = function(){
		mctx.f_semit('colu',{
			act: 'xtx_my_pending'
		},d => {
			pending_xtx = d;
			wait_for_pay.update();
			if(d.length){
				start();
			}else{
				stop();
			}
		});
	}
	var fapi = () => {
		var l = pending_xtx.length, ready = 0;
		pending_xtx.forEach(o => {
			explorer({
				url: 'addr/' + o.c + '/balance'
			}, fail => {
				// 
			}, ok => {
				pending_xtx_data[o.c] = ok;
				ready++;
				if(ready == l)wait_for_pay.update();
			});
		});
	}
	var start = () => {
		if(refapi)clearInterval(refapi);
		fapi();
		refapi = setInterval(fapi,periodapi);
	}
	var stop = () => {
		clearInterval(refapi);
		wait_for_pay.update();
	}
	o.start = function(){
		if(ref)clearInterval(ref);
		f();
		ref = setInterval(f,periodapi);
	}
	o.stop = function(){
		if(ref)clearInterval(ref);
	}
	return o;
}();

function wallet_login(){
	timer.start();								
	mctx.f_semit('get_blockchain_config',1,data => {
		if(data.network){
			publicConfig.network = data.network;
			explorer.reconfig(data.network);
			publicConfig.fpn_btc_value = data.fpn_btc_value;
			publicConfig.min_fee = data.min_fee;
		}
	});
}
function wallet_logout(){
	timer.stop();
	one_dc.el.show();
	auth_dc.el.hide();
}

var one_dc = DC.temp().insertIn(dc_module);
var auth_dc = DC.temp().insertIn(dc_module);
auth_dc.el.hide();

var Wallet = {
	mn_addr: '',
	btc_addr: '',
	addresses: []
}

var block_api = {};

block(function(){
	var title = 'Enter your FreePe password to decrypt wallet';
	var head = DC.temp();
	var body = DC.temp();
	var update = v => {
		body.change({text: v});
	}
	var password = DC.temp({
		eltype: 'input',
		state: {
			class: 'input'
		},
		attrs: {
			type: 'password'
		}
	})
	.insertIn(head);
	DC.temp({
		eltype: 'button',
		state: {
			class: 'b',
			text: 'decrypt'
		},
		events: {
			click(){
				var pas = password.el.val();
				if(pas.length < 8)return update('password invalid');
				update('decrypting...');
				mctx.f_semit('init_wallet',{pas:pas},data => {
					if(typeof data == 'object'){
						update('');
						if(data.reason){
							return update('fail because: ' + data.reason);
						}
						else if(data.ok === true){
							auth_dc.el.show();
							one_dc.el.hide();
							block_api.load_wallets(fail => {
								// 
							}, ok => {
								if(ok.length == 2){
									Wallet.mn_addr = ok[0];
									Wallet.btc_addr = ok[1];
								}
								wallet_login();
							});
						}
						else{
							return update(JSON.stringify(data));
						}
					}else{
						data = JSON.stringify(data);
						update(data);
					}
				});
			},
			s_connection(){
				wallet_logout();
				password.el.val('');
			}
		}
	})
	.insertIn(head);
	return [title,head,body];
})
.insertIn(one_dc);

block(function(){
	var title = 'All my wallets';
	var head = DC.temp();
	var body = DC.temp();
	var update = v => {
		body.change({text: v});
	}
	var b = DC.temp({
		eltype: 'button',
		state: {
			class: 'b',
			text: 'refresh'
		},
		events: {
			click(){
				update('loading...');
				load_wallets();
			}
		}
	})
	.insertIn(head);
	var load_wallets = (cbfail,cbok) => {
		mctx.f_semit('colu',{act:'show_all_wallets'},data => {
			update('');
			if(typeof data == 'object'){
				if(cbok)cbok(data);
				data.forEach(v => {
					DC.temp({
						state: {
							class: 'module-wallets-address',
							text: v
						}
					})
					.insertIn(body);
				});
			}else{
				update(JSON.stringify(data));
			}
		});
	}
	block_api.load_wallets = (cbfail,cbok) => {
		load_wallets(cbfail,cbok);
	}
	return [title,head,body];
},1);

var wait_for_pay = DC.temp(function(){
	var title = DC.temp({
		eltype: 'h1',
		state: {
			text: 'Waiting for your payment'
		}
	});
	var content = DC.temp();
	var lasthtml;
	var update = (s) => {
		if(s == lasthtml)return;
		content.change({html:s});
		lasthtml = s;
	}
	var last_req = {};
	return {
		state: {
			class: 'module-wallets-block'
		},
		extend: {
			update(){
				var l = pending_xtx;
				if(l && l.length){
					title.el.show();
					wait_for_pay.el.show();
					var html = '',i = 0;
					if(l.length){
						html = '<table class="module-wallets-table"><tr><td>Send BTC</td><td>to address</td><td>and receive FPN</td></tr>';
						l.forEach(o => {
							i++;
							var btc;
							var sat = pending_xtx_data[o.c];
							if(sat)btc = sat;
							o.btc = parseInt(o.btc);
							o.fpn = parseInt(o.fpn);
							if(o.status == 2){
								html += '<tr><td>finishing...</td><td>' + o.c + '</td><td>' + sat2btc(o.fpn) + '</td></tr>';
							}else
							if(btc && btc >= o.btc){
								if(!last_req[o.c] || Date.now() - last_req[o.c] > 15000){
									mctx.f_semit('colu',{
										act: 'xtx_check_for',
										c: o.c
									},d => {
										if(d.c){
											timer.start();
										}else{
											console.log(d);
										}
									});
									last_req[o.c] = Date.now();
								}
								html += '<tr><td>veifying...</td><td>' + o.c + '</td><td>' + sat2btc(o.fpn) + '</td></tr>';
							}else{
								if(btc){
									btc = sat2btc(btc2sat(o.btc) - sat);
								}else{
									btc = o.btc;
								}
								html += '<tr><td>' + sat2btc(btc) + '</td><td>' + o.c + '</td><td>' + sat2btc(o.fpn) + '</td></tr>';
							}
						});
						html += '</table>';
					}
					update(html);
				}else{
					wait_for_pay.el.hide();
				}
			}
		},
		init(){
			this.DClist([title,content]);
		}
	}
})
.insertIn(auth_dc);

block(function(){
	var title = 'Buy FPN for bitcoins';
	var head = DC.temp();
	var body = DC.temp();
	var update = v => {
		body.change({text: v});
	}
	var update2 = v => {
		info.change({text: v});
	}
	var amount = DC.temp({
		eltype: 'input',
		state: {
			class: 'input',
		},
		attrs: {
			placeholder: 'FPN amount'
		},
		events: {
			input(){
				if(!publicConfig.fpn_btc_value)return update2('failed');
				var n = this.value * publicConfig.fpn_btc_value;
				if(!n)return update2('invalid');
				n = sat2btc(btc2sat(n) + 10000);
				update2(n + ' BTC needed');
			}
		}
	})
	.insertIn(head);
	var info = DC.temp().insertIn(head);
	DC.temp({
		eltype: 'button',
		state: {
			class: 'b',
			text: 'next'
		},
		events: {
			click(){
				if(!publicConfig.fpn_btc_value)return update2('failed');
				if(pending_xtx && pending_xtx.length > 5)return update2('Sorry, you have too much unpayed transactions yet');
				var n = amount.el.val() * 1;
				if(!n)return update2('invalid');
				update('loading...');
				mctx.f_semit('colu',{
					act:'xtx_buy_fpn',
					fpn_amount: n
				},data => {
					if(data.a){
						timer.start();
						body.change({html:'Send <b>' + sat2btc(data.btc) + ' BTC</b> to address <b>' + data.c + '</b> and your wallet <b>' + data.a + '</b> will be replenished with <b>' + sat2btc(data.fpn) + ' FPN</b>'})
					}else{
						update(JSON.stringify(data));
					}
				});
			}
		}
	})
	.insertIn(head);
	return [title,head,body];
},1);

// block(function(){
// 	var title = 'Exchange BTC to FPN';
// 	var head = DC.temp();
// 	var body = DC.temp();
// 	var update = v => {
// 		body.change({text: v});
// 	}
// 	DC.temp({
// 		eltype: 'button',
// 		state: {
// 			class: 'b',
// 			text: 'request'
// 		},
// 		events: {
// 			click(){
// 				update('loading...');
// 				mctx.f_semit('colu',{act:'xtx_btc_fpn'},data => {
// 					console.log(data);
// 					update('ok');
// 				});
// 			}
// 		}
// 	})
// 	.insertIn(head);
// 	return [title,head,body];
// },1);

block(function(){
	var title = 'My FreePenny balance';
	var head = DC.temp();
	var body = DC.temp();
	var update = v => {
		body.change({text: v});
	}
	DC.temp({
		eltype: 'button',
		state: {
			class: 'b',
			text: 'refresh'
		},
		events: {
			click(){
				update('loading...');
				mctx.f_semit('colu',{act:'get_my_balance'},data => {
					if(typeof data == 'object'){
						update('');
						var asset = data.assetData;
						var total = {};
						var total_am = 0;
						asset.forEach(v => {
							total_am += v.amount;
							if(!total[v.address]){
								total[v.address] = v.amount;
							}else{
								total[v.address] += v.amount;
							}
						});
						if(!total_am){
							update('0 FPN');
						}else{
							for(var v in total){
								DC.temp({
									state: {
										text: v + ' : ' + n2fpn(total[v]) + ' FPN'
									}
								})
								.insertIn(body);
							}
						}
					}else{
						data = JSON.stringify(data);
						body.change({text:data});
					}
				});
			}
		}
	})
	.insertIn(head);
	return [title,head,body];
},1);

block(function(){
	var title = 'My Bitcoin balance';
	var head = DC.temp();
	var body = DC.temp();
	var update = v => {
		body.change({text: v});
	}
	DC.temp({
		eltype: 'button',
		state: {
			class: 'b',
			text: 'refresh'
		},
		events: {
			click(){
				if(!Wallet.btc_addr)return update('address unknown');
				update('loading...');
				explorer({
					url: 'addr/' + Wallet.btc_addr + '/balance'
				}, fail => {
					// 
				}, ok => {
					var n = sat2btc(ok);
					update(n + ' BTC');
				});
			}
		}
	})
	.insertIn(head);
	return [title,head,body];
},1);

block(function(){
	var title = 'Make a transaction here';
	var head = DC.temp();
	var body = DC.temp();
	var fromaddress = DC.temp({
		eltype: 'input',
		state: {
			class: 'input',
		},
		attrs: {
			placeholder: 'from address'
		}
	})
	.insertIn(head);
	var toaddress = DC.temp({
		eltype: 'input',
		state: {
			class: 'input',
		},
		attrs: {
			placeholder: 'to address'
		}
	})
	.insertIn(head);
	var amount = DC.temp({
		eltype: 'input',
		state: {
			class: 'input',
		},
		attrs: {
			placeholder: 'amount'
		}
	})
	.insertIn(head);
	DC.temp({
		eltype: 'button',
		state: {
			class: 'b',
			text: 'send coins'
		},
		events: {
			click(){
				body.change({text:'sending...'});
				var from = fromaddress.el.val();
				var to = toaddress.el.val();
				var am = amount.el.val();
				mctx.f_semit('colu',{act:'send_coins',from:from,to:to,amount:am},data => {
					data = JSON.stringify(data,null,4);
					body.change({text:data});
				});
			}
		}
	})
	.insertIn(head);
	return [title,head,body];
},1);


// block(function(){
// 	var title = 'Create invoice';
// 	var head = DC.temp();
// 	var body = DC.temp();
// 	DC.temp({
// 		eltype: 'button',
// 		state: {
// 			class: 'b',
// 			text: 'yes, send this'
// 		},
// 		events: {
// 			click(){
// 				mctx.f_semit('colu',{
// 						act:'create_invoice',
// 						data: {
// 							description: '',
// 							seller_wallet: '',
// 							buyer: '',
// 						}
// 					},data => {
// 					if(typeof data == 'object'){
// 						body.change({text:''});
// 						data.forEach(v => {
// 							DC.temp({
// 								state: {
// 									class: 'module-wallets-address',
// 									text: v
// 								}
// 							})
// 							.insertIn(body);
// 						});
// 					}else{
// 						data = JSON.stringify(data);
// 						body.change({text:data});
// 					}
// 				});
// 			}
// 		}
// 	})
// 	.insertIn(head);
// 	return [title,head,body];
// });



return {
//////
dc: dc_module,
//////
}
});