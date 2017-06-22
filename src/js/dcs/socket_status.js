var socket_status = f_dc_make(function(){
	var dc, stop;
	(function(){
	var e = $('.loading-app',1);
	if(!e)return console.log('invalid app structure');
	var i = 0;
	var timer = setInterval(function(){
		if(stop){
			return clearInterval(timer);
		}
		var s = 'Loading';
		for(var a = 0; a <= i; a++){
			s += '.';
			if(i > 4)i = 0;
		}
		i++;
		e.textContent = s;
	},60);
	}());
	return {
		events: {
			s_connection(){
				this.update(connected);
			},
			app_first_loaded(){
				stop = 1;
			}
		},
		extend: {
			update(code){
				var html = '<span class="';
				if(code == 1){
					html += 'green">server connected';

					App.tempdev && f_sget_rawmodule({
						name: 'temp-dev',
						css: 1,
						data: {
							f_sget_rawmodule: f_sget_rawmodule,
							f_semit: f_semit,
							f_sq: f_sq
						},
					}, (dc, api) => {
						if(dc && dc != 'ready'){
							dc.insertIn(document.body);
						}
					});

				}else{
					html += 'red">server not connected';
				}
				html+='</span>';
				dc.change({html:html});
			},
			insert(){
				dc.insertIn('.socket-status');
			}
		},
		init(){
			dc = this;
			dc.update(connected);
			// dc.insertIn('.socket-status');
		}
	}
});