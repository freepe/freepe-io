//1.00
DC.module('messenger',function(mctx){

var dc_module = DC.temp(function(){
//////
var box = DC.temp({
	state: {
		class: 'message-box'
	}
});
var tools = DC.temp({
	state: {
		class: 'message-tools'
	}
});
var clear = DC.temp({
	eltype: 'button',
	state: {
		text: 'clear'
	},
	events: {
		click(){
			box.change({text: ''});
		}
	}
})
.insertIn(tools);
var input = DC.temp({
	eltype: 'input',
	state: {
		class: 'input'
	},
	events: {
		keydown(e){
			if(e.keyCode == 13)button.onclick();
		}
	}
})
.insertIn(tools);
var button = DC.temp({
	eltype: 'button',
	state: {
		text: 'send'
	},
	events: {
		click(){
			var val = input.el.val();
			input.el.focus();
			if(!val)return;
			DC.temp({
				state: {
					text: val + ' // at ' + Date.now()
				}
			})
			.insertIn(box);
			input.el.val('');
			box.el.scrollTop = box.el.scrollHeight;
		}
	}
})
.insertIn(tools);
return {
	state: {
		class: 'module-messenger'
	},
	init(){
		this.DClist([box,tools]);
	}
}
//////
});


return {
//////
dc: dc_module,
//////
}
});