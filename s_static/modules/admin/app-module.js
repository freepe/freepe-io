//1.00
DC.module('admin/app-module',function(mctx){

var dc_module = DC.temp(function(){
//////
return {
	initLater(){
		return this;
	}
}
//////
});

mctx.f_sget_rawmodule({
	name: 'admin/mailing',
	css: 1,
	data: mctx
}, (dc, api) => {
	if(dc && dc != 'ready'){
		dc.insertIn(dc_module);
	}
});

mctx.f_sget_rawmodule({
	name: 'admin/colu',
	css: 1,
	data: mctx
}, (dc, api) => {
	if(dc && dc != 'ready'){
		dc.insertIn(dc_module);
	}
});


console.log('admin mode enabled');


return {
//////
dc: dc_module,
//////
}
});