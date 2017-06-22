var route_socket = f_dc_make(function(){
	var button = f_dc_make({
		eltype: 'button',
		state: {
			text: 'get data',
			class: 'b'
		},
		events: {
			click(){
				if(!f_user_authorized()){
					result.change({text: 'you have to sign in first'});
					return;
				}
				notify.is('data requested');
				f_sq({
					act: 'get_data'
				},function(data){
					var text;
					try{
						text = JSON.stringify(data,null,4);
					}catch(e){
						text = 'something went wrong...';
					}
					result.change({text: text});
				})
			}
		}
	});
	var result = f_dc_make({
		attrs: {
			style: 'white-space: pre-wrap;'
		}
	});
	result.clear = function(){
		this.change({text: 'click the button'});
	}
	return {
		initLater(){
			result.clear();
			f_dc_list(this,[
				button,
				result
			]);
			return this;
		}
	}
});
