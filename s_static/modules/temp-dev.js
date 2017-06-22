//1.00
DC.module('temp-dev',function(mctx){

var dc_module = DC.temp(function(){
//////
return {
	state: {
		class: 'module-temp-dev'
	},
	init(){
		return this;
	}
}
//////
});

var wallets;
DC.temp({
	eltype: 'button',
	state: {
		class: 'b',
		text: 'load wallets module'
	},
	events: {
		click(){
			if(DC.module.loaded['wallets'])delete DC.module.loaded.wallets;
			mctx.f_sget_rawmodule({
				name: 'wallets',
				css: 1,
				data: mctx,
			}, (dc, api) => {
				if(dc && dc != 'ready'){
					if(wallets)wallets.remove();
					wallets = dc;
					dc.insertIn(dc_module);
				}
			});
		}
	}
})
.insertIn(dc_module);


					mctx.f_sget_rawmodule({
						name: 'router/home',
						css: 1,
					}, (dc, api) => {
						if(dc && dc != 'ready'){
							dc.insertIn(document.body);
						}
					});


return {
//////
dc: dc_module,
//////
}
});