//1.00
DC.module('router/settings',function(mctx){
//////////
var dc_module = DC.temp({
	state: {
		class: 'module-settings'
	},
	init(){
		return this;
	}
});

var f_semit = mctx.f_semit;

var header = DC.temp({
	state: {
		itext: 'SETTINGS_H'
	}
})
.insertIn(dc_module);

var get_info = DC.temp({
	eltype: 'button',
	state: {
		class: 'b',
		text: 'get subscriptions info'
	},
	events: {
		click(){
			if(!subscription_ready){
				subscription_container.insertIn(dc_module);
				subscription_ready = 1;
			}
			f_semit('subscription','get', function(v){
				if(v.subscription_for){
					v.subscription_for.forEach(name => {
						boxes[name].onchange(null,1);
					});
				}
				info.change({text: 'info: ' + JSON.stringify(v)});
			});
		}
	}
})
.insertIn(dc_module);

var subscription_container = DC.temp();
var subscription_ready;

DC.temp({
	eltype: 'h1',
	state: {
		itext: 'MANAGE_YOUR_SUBSCRIPION'
	}
})
.insertIn(subscription_container);

var boxes = {};
var selected = {};

[
	'news',
	'guides',
	'reports',
	'updates'
].forEach(name => {
	var line = DC.temp();
	boxes[name] = DC.temp({
		eltype: 'input',
		attrs: {
			type: 'checkbox'
		},
		events: {
			change(e,set){
				if(typeof set != 'undefined')boxes[name].el.checked = set;
				boxes[name].el.checked?
				selected[name] = true:
				delete selected[name];
			}
		}
	})
	.insertIn(line);
	DC.temp({
		eltype: 'span',
		state: {
			text: name
		}
	})
	.insertIn(line);
	line.insertIn(subscription_container);
});


DC.temp({
	eltype: 'button',
	state: {
		class: 'b',
		itext: 'SAVE'
	},
	events: {
		click(){
			var arr = [];
			for(var v in selected){
				arr.push(v);
			}
			f_semit('subscription',arr, function(v){
				info.change({text: 'OK, updated: ' + JSON.stringify(v)});
			});
		}
	}
})
.insertIn(subscription_container);

var info = DC.temp().insertIn(subscription_container);



return {
//////
dc: dc_module,
// provide API methods
api: {
}
//////
}
});