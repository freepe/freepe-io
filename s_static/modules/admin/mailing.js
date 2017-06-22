//1.00
DC.module('admin/mailing',function(mctx){

var dc_module = DC.temp({
	state: {
		class: 'module-admin_mailing'
	}
});

DC.temp({
	eltype: 'button',
	state: {
		class: 'b',
		text: 'load emails'
	},
	events: {
		click(){
			mctx.f_semit('admin',{
				act: 'get_mailing_data',
			},data => {
				container.once();
				container.draw(data);
			});
		}
	}
})
.insertIn(dc_module);

var container = DC.temp();
container.once = function(){
	var ready;
	return function(){
		if(!ready){
			container.insertIn(dc_module);
			ready = 1;
		}
	}
}();
container.draw = function(){
	var listh = DC.temp({
		state: {
			text: 'All emails:'
		}
	});
	var list = DC.temp();
	var actionsh = DC.temp({
			state: {
				text: 'Actions are'
			}
		});
	var actions = DC.temp();
	var preview = DC.temp();
	var result = DC.temp();
	var htmlwrap = DC.temp({
		attrs: {
			style: 'padding: 10px;'
		}
	});
	var html = DC.temp({
		eltype: 'iframe',
		state: {
			class: 'module-admin_mailing-iframe'
		}
	})
	.insertIn(htmlwrap);
	container.DClist([
		listh,
		list,
		actionsh,
		preview,
		htmlwrap,
		result,
		actions,
	]);
	function send(group){
		result.change({text: 'sending all ' + group + '...'});
		mctx.f_semit('admin',{
			act: 'send_all_emails',
			group: group
		},res => {
			if(typeof res != 'string')res = JSON.stringify(res);
			result.change({text: res});
		});
	}
	return obj => {
		var emails = obj.emails;
		var groups = obj.groups;
		htmlwrap.el.hide();
		list.change({text: ''});
		actions.change({text: ''});
		preview.change({text: ''});
		result.change({text: ''});
		emails.forEach(v => {
			DC.temp({
				state: {
					text: '--' + v
				}
			}).insertIn(list);
		});
		var buttons = {};
		for(var a in groups){
			(function(){
				var group = a;
				buttons[group] = DC.temp({
					eltype: 'button',
					state: {
						class: 'b',
						text: 'send ' + group + ' (' + groups[group].length + ' emails)'
					},
					events: {
						click(){
							send(group);
						}
					}
				});
				DC.temp({
					eltype: 'button',
					state: {
						class: 'b',
						text: 'preview ' + group
					},
					events: {
						click(){
							mctx.f_semit('admin',{
								act: 'preview_mailing',
								group: group
							},res => {
								if(typeof res == 'object'){
									if(res.html){
										result.change({text: ''});
										htmlwrap.el.show();
										html.el.src = "data:text/html;charset=utf-8," + escape(res.html);
										buttons[group].insertIn(actions);
									}else{
										actions.change({text: ''});
										htmlwrap.el.hide();
										result.change({text: res.reason});
									}
								}else{
									actions.change({text: ''});
									htmlwrap.el.hide();
									result.change({text: res});
								}
							});
						}
					}
				}).insertIn(preview);
			}());
		}
	}
}();



return {
//////
dc: dc_module,
//////
}
});