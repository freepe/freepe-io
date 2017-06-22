//1.00
DC.module('admin/colu',function(mctx){

var dc_module = DC.temp(function(){
//////
return {
	state: {
		class: 'module-admin_colu'
	}
}
//////
});

var Wallet = {
	mn_addr: '',
	btc_addr: '',
	addresses: []
}

var block = (fn) => {
	var arr = fn();
	var head = arr[1];
	var body = arr[2];
	var bl = DC.temp({
		state: {
			class: 'module-admin_colu-block'
		}
	})
	.insertIn(dc_module);
	var foot = DC.temp({
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
}

function sat2btc(sat){
	sat = parseInt(sat);
	if(isNaN(sat))return false;
	var btc = sat/100000000;
	btc = btc.toFixed(6) * 1;
	return btc;
}
function btc2sat(btc){
	btc = parseFloat(btc);
	if(isNaN(btc))return false;
	btc = btc.toFixed(6);
	var sat = btc * 100000000;
	return sat;
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

explorer.reconfig(location.protocol == 'https:'?1:'testnet');

block(function(){
	var title = 'My address';
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
				mctx.f_semit('colu_admin',{act:'show_all_wallets'},data => {
					update('');
					if(typeof data == 'object'){
						if(data.length == 2){
							Wallet.mn_addr = data[0];
							Wallet.btc_addr = data[1];
						}
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
		}
	})
	.insertIn(head);
	return [title,head,body];
});

block(function(){
	var title = 'Admin FreePenny balance';
	var head = DC.temp();
	var body = DC.temp();
	DC.temp({
		eltype: 'button',
		state: {
			class: 'b',
			text: 'refresh'
		},
		events: {
			click(){
				body.change({text:'loading...'});
				mctx.f_semit('colu_admin',{act:'get_my_balance'},data => {
					if(typeof data == 'object'){
						body.change({text:''});
						var asset = data.assetData;
						var total = {};
						if(asset){
							asset.forEach(v => {
								if(!total[v.address]){
									total[v.address] = v.amount;
								}else{
									total[v.address] += v.amount;
								}
							});
							for(var v in total){
								DC.temp({
									state: {
										text: v + ' : ' + total[v] + ' FPN'
									}
								})
								.insertIn(body);
							}
						}else{
							body.change({text:JSON.stringify(data)});
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
});

block(function(){
	var title = 'Admin Bitcoin balance';
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
});


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
				mctx.f_semit('colu_admin',{act:'send_coins',from:from,to:to,amount:am},data => {
					data = JSON.stringify(data,null,4);
					body.change({text:data});
				});
			}
		}
	})
	.insertIn(head);
	return [title,head,body];
});


block(function(){
	var title = 'Issue new Asset';
	var head = DC.temp();
	var body = DC.temp();
	DC.temp({
		eltype: 'button',
		state: {
			class: 'b',
			text: 'issue new asset'
		},
		events: {
			click(){
				body.change({text:'issueing...'});
				mctx.f_semit('colu_admin',{act:'issue_asset'},data => {
					data = JSON.stringify(data);
					body.change({text:data});
				});
			}
		}
	})
	.insertIn(head);
	return [title,head,body];
});


return {
//////
dc: dc_module,
//////
}
});