DC.module('uapay',function(mctx){
	var Storage = localStorage;
	var dc_module = DC.temp();
	function generateRandomString(length) {
	    var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
	    var len = chars.length;
	    var str = '';
	    for (var i = 0; i < length; i++) {
	        str += chars[Math.floor(Math.random() * len)];
	    }
	    return str;
	}
	var block = (fn) => {
		var arr = fn();
		var head = arr[1];
		var body = arr[2];
		body.change({class: 'module-uapay-block-body'});
		var bl = DC.temp({
			state: {
				class: 'module-uapay-block'
			}
		})
		.insertIn(dc_module);
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
	}
	var get_session = function(){
		return Storage.uapay || false;
	}
	block(function(){
		var title = 'UAPAY session';
		var head = DC.temp();
		var body = DC.temp();
		var update = function(){
			body.change({text: 'session ready - ' + Storage.uapay});
		}
		var button = DC.temp({
			eltype: 'button',
			state: {
				class: 'b',
				text: 'get session',
			},
			events: {
				click(){
					// get session for uapay
					button.get_session();
				}
			},
			extend: {
				get_session(force){
					if(Storage.uapay && !force){
						update();
					}else{
						uapay({
							params: {
								clientId: '1'
							}
						},
						'api/sessions/create',
						err => {
							console.log('error',err)
						}, res => {
							console.log(res);
							if(res.status && res.data.id){
								Storage.uapay = res.data.id;
								update();
								body.change({text: 'session ready - ' + Storage.uapay});
							}else{
								body.change({text:JSON.stringify(res)});
							}
						});
					}
				}
			}
		})
		.insertIn(head);
		var renew = DC.temp({
			eltype: 'button',
			state: {
				class: 'b',
				text: 'renew session'
			},
			events: {
				click(){
					button.get_session(1);
				}
			}
		})
		button.onclick();
		return [title,head,body,renew];
	});
	if(typeof global_ret_id != 'undefined' && global_ret_id.length > 5){
		block(function(){
			var title = 'UAPAY payment confirmation';
			var head = DC.temp();
			var body = DC.temp();
			var update = function(val){
				body.change({text: val});
			}
			var sid = get_session();
			if(!sid)return console.log('no session');
			update('loading...');
			var check_f = function(){
				var obj = {
					params: {
						sessionId: sid,
						id: global_ret_id
					}
				}
				uapay(obj,
				'api/payments/p2p/show',
				err => {
					console.log('error',err)
				}, res => {
					if(res.status){
						var data = res.data;
						var status = data.status;
						if(status == 'FINISHED' || status == 'REJECTED' || status == 'REVERSED'){
							if(status == 'FINISHED'){
								update('SUCCESS! FINISHED! ' + JSON.stringify(data));
							}else{
								update('Payment turned into final state with data ' + JSON.stringify(data));
							}
						}else{
							timer = setTimeout(check_f,1000);
						}
					}else{
						console.log(res);
						// update(JSON.stringify(res));
					}
				});
			}
			var timer = setTimeout(check_f,1000);
			return [title,head,body];
		})
		return {
			dc: dc_module
		};
	}
	block(function(){
		var title = 'UAPAY direct payment';
		var head = DC.temp();
		var body = DC.temp();
		var update = function(text){
			body.change({text: text});
		}
		var createSelect = function(obj){
			var dc = DC.temp({
				eltype: 'select',
				state: {
					class: 'select'
				},
				events: {
					change(){
						var val = this.value;
						dc.select(val);
					}
				}
			});
			var list = obj.list;
			DC.temp({
				eltype: 'option',
				attrs: {
					value: null,
					disabled: 1,
					selected: 1
				}
			})
			.insertIn(dc);
			list.forEach(val => {
				DC.temp({
					eltype: 'option',
					attrs: {
						value: val
					},
					state: {
						text: val
					}
				})
				.insertIn(dc);
			});
			var selected;
			dc.select = function(val){
				dc.el.querySelector('[value="' + val + '"]').selected = true;
				selected = val;
				console.log(dc.getsel())
			}
			dc.getsel = function(){
				return selected;
			}
			return dc;
		}
		var cardFrom = DC.temp({
			eltype: 'input',
			state: {
				class: 'input',
				val: '5168755605455977'
			},
			attrs: {
				placeholder: 'card number',
			}
		})
		var cardTo = DC.temp({
			eltype: 'input',
			state: {
				class: 'input',
				val: '5168755605455977'
			},
			attrs: {
				placeholder: 'card number',
			}
		})
		var amount = DC.temp({
			eltype: 'input',
			state: {
				class: 'input',
			},
			attrs: {
				placeholder: 'amount',
			}
		})
		var cvv = DC.temp({
			eltype: 'input',
			state: {
				class: 'input',
				val: '123'
			},
			attrs: {
				style: 'width:50px;',
				placeholder: 'CVV',
				maxlength: 3
			}
		})
		var notifyphone = DC.temp({
			eltype: 'input',
			state: {
				class: 'input',
			},
			attrs: {
				placeholder: "380970012288",
			}
		})
		var timer;
		var proceed = DC.temp({
			eltype: 'button',
			state: {
				class: 'b',
				text: 'go!'
			},
			events: {
				click(){
					update('loding...');
					var sid = get_session();
					if(!sid){
						return update('session not works anymore');
					}
					var obj = {
						params: {
							sessionId: sid
						},
						data: {
							externalId: generateRandomString(6),
							cardFrom: {
								securityCode: '' + cvv.el.val(),
								pan: '' + cardFrom.el.val(),
								expiresAt: '20' + d2.getsel() + '-' + d1.getsel()
							},
							cardTo: {
								pan: cardTo.el.val()
							},
							amount: amount.el.val() * 100,
							currency: 980
						}
					}
					uapay(obj,
					'api/payments/p2p/direct/create',
					err => {
						console.log('error',err)
						update(JSON.stringify({ERROR: err}));
					}, res => {
						console.log(res);
						if(res.status && res.data.id && res.data.key){
							res.data.id;
							update('ok, wait for next steps...');
							obj = {
								params: {
									sessionId: sid,
									id: res.data.id
								}
							}
							uapay(obj,
							'api/payments/p2p/show',
							err => {
								console.log('error',err)
								update(JSON.stringify({ERROR: err}));
							}, res => {
								console.log(res);
								if(res.status && res.data.id){
									var status = res.data.status;
									var id_payment = res.data.id;
									timer = setInterval(function(){
										if(!status)clearInterval(timer);
										uapay(obj,
										'api/payments/p2p/show',
										err => {
											console.log('error',err)
											update(JSON.stringify({ERROR: err}));
										}, res => {
											console.log(res);
											if(res.status && res.data.id){
												update('info: ' + JSON.stringify(res.data));
												var status2 = res.data.status;
												var data = res.data;
												var redirect = data.redirect;
												console.log(data)
												if(status2 == 'NEEDS_CONFIRMATION'){
													clearInterval(timer);
													var confirm = function(){
												        var form = document.createElement('form');
												        form.setAttribute('method','post');
												        form.setAttribute('action', data.confirmation.url);
												        var termUrl = document.createElement('input');
												        termUrl.setAttribute('type','hidden');
												        termUrl.setAttribute('name', 'TermUrl');
												        termUrl.setAttribute('value',redirect.url + '?id=' + redirect.params.id + '&redirect=http://localhost/uapay/' + id_payment);
												        var paReq = document.createElement('input');
												        paReq.setAttribute('type','hidden');
												        paReq.setAttribute('name','PaReq');
												        paReq.setAttribute('value',data.confirmation.form.PaReq);
												        form.appendChild(termUrl);
												        form.appendChild(paReq);
												        document.head.appendChild(form);
												        form.submit();
												        console.log(form)
													}();
												}
											}else{
												update(JSON.stringify(res));
											}
										});
									},2000)
									update('info: ' + JSON.stringify(res.data));
									
								}else{
									update(JSON.stringify(res));
								}
							});
						}else{
							update(JSON.stringify(res));
						}
					});
				}
			}
		})
		var d1 = createSelect({
				list: ['01','02','03','04','05','06','07','08','09','10','11','12']
			}),
			d2 = createSelect({
				list: ['16','17','18','19','20','21','22','23']
			});
		d1.select('09');
		d2.select('18');
		var ctx = {
			cf: cardFrom,
			d1: d1,
			d2: d2,
			cv: cvv,
			ct: cardTo,
			nf: notifyphone,
			am: amount,
			go: proceed,
		}
		head.parse(`<div>
			<div>Type your card:<br />{cf}{d1} / {d2} {cv}</div>
			<div>Recipient card:<br />{ct}</div>
			<div>Notify receiver via phone:<br />{nf}</div>
			<div>How much? (UAH)<br />{am}</div>
			<div>Ready?<br />{go}</div>
			</div>`,ctx);
		return [title,head,body];
	});
	block(function(){
		var title = 'UAPAY create request';
		var head = DC.temp();
		var body = DC.temp();
		var update = function(val){
			body.change({text: val});
		}
		var name = DC.temp({
			eltype: 'input',
			state: {
				class: 'input',
			},
			attrs: {
				placeholder: 'enter your name',
			}
		})
		var cardTo = DC.temp({
			eltype: 'input',
			state: {
				class: 'input',
			},
			attrs: {
				placeholder: 'card number',
			}
		})
		var amount = DC.temp({
			eltype: 'input',
			state: {
				class: 'input',
			},
			attrs: {
				placeholder: 'amount',
			}
		})
		var notifyphone = DC.temp({
			eltype: 'input',
			state: {
				class: 'input',
			},
			attrs: {
				placeholder: "380970012288",
			}
		})
		var button = DC.temp({
			eltype: 'button',
			state: {
				class: 'b',
				text: 'request',
			},
			events: {
				click(){
					// get session for uapay
					update('loding...');
					var sid = get_session();
					if(!sid){
						return update('session not works anymore');
					}
					var obj = {
						params: {
							sessionId: sid
						},
						data: {
							cardTo: {
								pan: cardTo.el.val()
							},
							name: name.el.val(),
							description: 'some description here',
							phone: notifyphone.el.val(),
							amount: amount.el.val() * 100,
							currency: 980
						}
					}
					uapay(obj,
					'api/payments/p2p/requests/create',
					err => {
						console.log('error',err)
						update(JSON.stringify({ERROR: err}));
					}, res => {
						console.log(res);
						if(res.status && res.data){
							res.data.id;
							update('request success' + '! info: ' + JSON.stringify(res.data));
						}else{
							update(JSON.stringify(res));
						}
					});
				}
			},
		});
		var ctx = {
			ct: cardTo,
			nm: name,
			nf: notifyphone,
			am: amount,
			go: button,
		}
		head.parse(`<div>
			<div>Your name:<br />{nm}</div>
			<div>Type your card:<br />{ct}</div>
			<div>Phone for request:<br />{nf}</div>
			<div>How much? (UAH)<br />{am}</div>
			<div>Ready?<br />{go}</div>
			</div>`,ctx);
		return [title,head,body];
	});
	return {
		dc: dc_module,
	}
});