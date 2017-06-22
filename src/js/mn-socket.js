notify.until('connecting...');
socket = io({transports: ['websocket']});
(function(){
	var reconnect = function(){
		var attempts = 0,
			maxAttempts = 10;
		var fn = () => {
			attempts++;
			if(attempts > maxAttempts)return console.log('Max attempts for socket reconnection used');
			setTimeout(function(){
				socket.connect();
			},3000);
		}
		fn.reset = () => {
			attempts = 0;
		}
		return fn;
	}();
	socket
	.on('connect',() => {
		notify.until();
		connected=1;
		DC.emit('s_connection');
		f_App_authorize();
		reconnect.reset();
	})
	.on('error happened', (v) => {
		socket.disconnect();
	})
	.on('disconnect', (v) => {
		connected=0;
		DC.emit('s_connection');
		reconnect();
	})
	.on('push', (v) => {
		if(v && v.act){
			var act = v.act;
			if(act == 'load_admin'){
				Router.admin();
			}
		}
	})
	.on('error', (v) => {
		socket.disconnect();
		notify.until('socket error');
	})
	.io.on('connect_error', function(err) {
		reconnect();
	});
}());
function f_socket_authorized(){
// set App listeners after authorization
socket.on('sq', (v) => {
	// server says something
});
socket.on('push', (v) => {
	// server says something else
});
}