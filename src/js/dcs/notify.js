var notify = f_dc_make(function(){
//////////
var dc;
var text = f_dc_temp();
return {
	state: {
		class: 'notify-div'
	},
	extend: {
		is: function(v,t){
			if(!t)t=1200;
			var self = this;
			text.change({text:v});
			text.clearTimeouts();
			this.el.css({height:this.el.scrollHeight});
			text.timeout(function(){
				self.el.css({height:0});
			},t);
		},
		long: function(v){
			this.is(v,2500);
		},
		until: function(v){
			if(typeof v=='undefined'){this.el.css({height:0});return;}
			text.change({text:v});
			this.el.css({height:this.el.scrollHeight});
		}
	},
	init(){
		dc = this.insertIn(bodytag);
		text.insertIn(dc);
	}
}
//////////
});