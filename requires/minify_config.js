var domcom = ['src/js/domcom.js'];
var domcom_min = ['src/js/domcom-min.js'];
// order is very important
// domcom should be first
var mn_components=[
	'src/js/mn-head.js',
	'src/js/mn-functions.js',
	'src/js/mn-events.js',
	////////////////
	// dc stuff here
	'src/js/dcs/notify.js',
	// header 
	'src/js/dcs/header.js',
	// 'src/js/dcs/move_el.js',
	'src/js/dcs/socket_status.js',
	// auth
	'src/js/dcs/authr.js',
	// socket route
	// 'src/js/dcs/socket/index.js',
	// profile route
	'src/js/dcs/profile/index.js',
	'src/js/dcs/profile/login_form.js',
	'src/js/dcs/profile/end.js',
	////////////////////
	// end of mn_components
	'src/js/mn-socket.js',
	'src/js/mn-routes.js',
	'src/js/mn-end.js'
];
module.exports = {
	domcom: domcom,
	domcom_min: domcom_min,
	mn_components: mn_components
}
