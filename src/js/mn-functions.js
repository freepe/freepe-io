// some usefull functions
function f_dc_make(obj) {
	return DC.make(obj);
}
function f_dc_temp(obj) {
	return DC.temp(obj);
}
function f_dc_list(dc, list) {
	dc.DClist(list);
}
function f_preventDefault(e) {
	if (!e) e = window.event;
	if (!e) return;
	e.preventDefault();
}
function logr() {
	console.log.apply(console, arguments);
}
/////////////
// for App
function f_App_authorize(token, cbfail, cbok) {
	// make delay to enjoy "loading..." screen
	// timeout is not required for your project

	var delay = 0;
	if (token) {
		notify.until('authorizing...');
		setTimeout(() => {
			f_semit('auth', { token: token }, (v) => {
				if (v[0] && typeof v.id != 'undefined') {
					Storage.token = token;
					App.authorized = 1;
					User.id = v.id;
					User.ref_link = v.ref_link;
					if (v.name) User.name = v.name;
					if (v.fpt) User.fpt = v.fpt;
					notify.until();
					if (!cbok) f_socket_authorized();
					DC.emit('u_login');
					if (cbok) cbok();
				} else {
					if (v.err == 'invalid token') f_App_signout();
					logr('authorization failed');
					notify.long('authorization failed');
					if (cbfail) cbfail();
				}
				if (!cbok) Router.init();
			});
		}, delay);
	} else {
		if (Storage.token) {

			f_App_authorize(Storage.token);
		} else {
			notify.until('processing data...');
			setTimeout(() => {
				Router.init();
				notify.until();
			}, delay);
		}
	}
}
function f_App_signout() {
	if (Storage.token) delete Storage.token;
	App.authorized = 0;
	DC.emit('u_login');
	User = {};
	socket.disconnect();
	window.location.href = '/';
}
function f_App_first_loaded() {
	// when all required data to display loaded
	// draw components
	Router.firstInit();
	//f_change_language.insert();
	socket_status.insert();
	DC.emit('app_first_loaded');
}
/////////////
function f_user_authorized() {
	return App.authorized ? true : false;
}
// for WEBSOCKET
function f_sq(data, time, fn) {
	if (!connected) return;
	var timeisfn = typeof time == 'function' ? 1 : 0;
	var timedelay = typeof time == 'number' ? 1 : 0;
	if (!timeisfn && timedelay) {
		setTimeout(function () {
			fn ? f_semit('sq', data, fn) : f_semit('sq', data);
		}, time);
	} else {
		timeisfn ? f_semit('sq', data, time) : f_semit('sq', data);
	}
}
function f_semit() {
	if (!connected) return;
	socket.emit.apply(socket, arguments);
}
function f_sget_langpack(lang, cb) {
	f_semit('get_langpack', lang, data => {
		cb(data);
	});
}
/////////////
function f_email_valid(v) {
	var re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
	var a = false;
	if (re.test(v)) {
		a = true;
	}
	return a;
}
//////// var functions
var f_sget_rawmodule = function () {
	var modules = {};
	var cache = function () {
		var fn = function (name, version, js, css) {
			if (js) {
				fn.set(name, version, js, css);
			}
			else if (version) {
				return fn.getV(name) == version;
			}
			else {
				return fn.get(name) ? true : false;
			}
		}
		fn.set = (name, version, js, css) => {
			var obj = {
				name: name,
				v: version,
				js: js,
				css: css
			};
			Storage['module_' + name] = JSON.stringify(obj);
			modules[name] = obj;
		}
		fn.get = name => {
			if (modules[name]) return modules[name];
			if (!Storage['module_' + name]) return false;
			modules[name] = JSON.parse(Storage['module_' + name]);
			return modules[name];
		}
		fn.getV = name => {
			var m = fn.get(name);
			if (!m) return false;
			return m.v;
		}
		return fn;
	} ();
	function load(obj, cb) {
		if (obj.predata) {
			load2(obj, cb);
		} else {
			f_semit('get_rawjs', obj.name, data => {
				if (!data) {
					cb(false);
					return;
				}
				obj.predata = data;
				load2(obj, cb);
			});
		}
	}
	function load2(obj, cb) {
		var version, name = obj.name;
		var data = obj.predata;
		var end = data.indexOf('+') - 2;
		if (end < 10 && data[0] + data[1] == '//') version = data.substr(2, end);
		if (version && !cache(name, version)) cache(name, version, data, obj.rawcss);
		var params = {
			name: name,
			raw: data,
			rawcss: obj.rawcss,
			data: obj.data,
			ready(dc, api) {
				cb(dc, api);
			}
		}
		DC.load(params);
	}
	function loadcss(obj, cb) {
		f_semit('get_rawcss', obj.name, data => {
			if (!data) {
				cb(false);
				return;
			}
			obj.rawcss = data;
			load(obj, cb);
		});
	}
	return (obj, cb) => {
		var name = obj.name;
		if (!DC.module(name)) {
			if (cache(name)) {
				var v = cache.getV(name);
				f_semit('get_rawjs', [name, v], data => {
					if (!data) {
						var m = cache.get(name);
						var params = {
							name: name,
							raw: m.js,
							rawcss: m.css,
							data: obj.data,
							ready(dc, api) {
								cb(dc, api);
							}
						}
						DC.load(params);
						return;
					}
					obj.predata = data;
					loadcss(obj, cb);
				});
				return;
			}
			if (obj.css) {
				loadcss(obj, cb);
			} else {
				load(obj, cb);
			}
		} else {
			cb('ready');
		}
	}
} ();
var f_change_language = function () {
	var dc = DC.temp({
		eltype: 'select',
		state: {
			html: '<option value="en">English</option>\
			<option value="uk">Українська</option>',
			class: 'selectLang'
		},
		attrs: {
			style: `
    			z-index: 20;
    			position: relative;
    			font-size: 12pt;
    			border: none;
    			background-color: transparent;
    			color: #fff;
    			display: none !important;
    			left: 78%;
    			top: 20px; `
		},
		events: {
			change() {
				var lang = this.value;
				f_change_language(lang);
			}
		}
	})
		.insertIn(bodytag);
	//dc.el.hide();
	var ready = { 'uk': 1 };
	var turn = lang => {
		dc.el.querySelector('[value="' + lang + '"]').selected = true;
		DC.lang.turn(lang);
	}
	var fn = function (lang) {
		if (!ready[lang]) {
			f_sget_langpack(lang, data => {
				if (data) {
					DC.lang.set(data);
					ready[lang] = 1;
					turn(lang);
				}
			});
		} else {
			turn(lang);
		}
	}
	fn.insert = function () {
		//dc.el.hide();
	}
	return fn;
} ();



function func() {
	alert();
}