var router_menu, router_view;
var Router = function () {

	var readyroutes = {},
		apiroutes = {},
		config = {
			// 'wallets': {
			// 	css: 1,
			// },
			// 'settings': {
			// 	css: 1,
			// },
			'finance': {
				css: 1,
				url: 'wallet',
				title: 'Wallet',
			},
			'DashBoard': {
				css: 1,
				url: 'dashboard',
				title: 'DashBoard',
				mctx: {
					User:User
				}
				
			},
			// 'welcome': {
			// 	css: 1,
			// }
		};

	var initial_route = 'initial_welcome';

	var fn = function () { };
	router_menu = f_dc_temp().insertAs('.router-menu');

	router_view = f_dc_make(function () {
		var ready = 0;
		var routes = [], cssfor = [];
		for (var name in config) {
			routes.push(name);
			if (config[name].css) cssfor.push(name);
		}
		var total = routes.length;
		return {
			events: {
				s_connection() {
					if (!connected || ready == total) return;
					f_sget_rawmodule({
						name: 'routerdemo',
						css: 1,
					}, (dc, api) => {
						if (dc && dc != 'ready') {
						}
					});
					routes.forEach(name => {
						var mctx = {
							f_sget_rawmodule: f_sget_rawmodule,
							f_semit: f_semit,
							f_sq: f_sq
						}
						if (config[name].mctx) {
							var configctx = config[name].mctx;
							for (var prop in configctx) {
								mctx[prop] = configctx[prop];
							}
						}
						f_sget_rawmodule({
							name: 'router/' + name,
							css: cssfor.indexOf(name) > -1 ? 1 : 0,
							data: mctx,
						}, (dc, api) => {
							if (dc && dc != 'ready') {
								ready++;
								readyroutes[name] = dc;
								if (api) apiroutes[name] = api;
								console.log(name, 'loaded')
								if (ready == total) {
									routes.forEach(name => {
										fn.append(name, config[name], readyroutes[name]);
									});
									pushmenu.draw();
									changeTitle();
									fn.read(1);
									setTimeout(
										f_App_first_loaded,
										200);
								}
							}
						});
					});
				},
				u_login() {
					pushmenu.draw();
				}
			}
		}
	}).insertAs('.router-view');

	var last_user_state;
	
	fn.init = function (name) {
		if (!name) name = initial_route;
		if (!readyroutes[name]) return;
		f_dc_list(router_view, [
			readyroutes[name].init()
		]);
	}
	
	var tutorial = $('.welcome-tutorial', 1);

	(function(){
		var app_auth = $('.app-authorized', 1);
		var app_dc = f_dc_temp().insertAs(app_auth);
		var header = f_dc_temp().insertAs('header');
		var footer = f_dc_temp().insertAs('footer');
		fn.show = function() {
			f_dc_list(app_dc, [
				header,
				router_menu,
				router_view,
				footer
			])
			router_menu.el.show('inline-block');
			router_view.el.show('inline-block');
		}
		fn.firstInit = function () {
			$('.app-loading', 1).hide();
			var app_welcome = $('.app-welcome', 1);
			var page_bg = $('.page-background', 1);
			var menu = $('.menu', 1);
			if (f_user_authorized()) {
				app_auth.show();
				//app_welcome.show();
				page_bg.hide();
				clickMenu(initial_route);
				footer.el.show();
				header.el.show();
				app_welcome.show();
				$('.pageDashBoard', 1).show();
				$('.page', 1).show();
				$('.ul_icons',1).show();
				$('.pageBlock',1).show();
				//$('.pageFinanses', 1).show();
				//$('.pr', 1).show();
			} else {
				page_bg.show();
				app_auth.hide();
				tutorial.show();
				footer.el.hide();
				header.el.hide();
				$('.app-welcome',1).show();
				$('.pageDashBoard',1).hide();
				$('.page',1).hide();
				$('.ul_icons',1).hide();
				$('.pageBlock',1).hide();
				//$('.pageFinanses',1).hide();
				//$('.pr',1).hide();
				route_profile.insertIn('.app-welcome');
				auth.insertIn(app_welcome);
			}
		}
	}());

	fn.get_api = function (name) {
		return apiroutes[name] || false;
	}

	var menulist = {};

	var clickMenu = function (name) {
		if (!menulist[name]) return;
		menulist[name].onclick();
	}

	var pushmenu = function () {
		var active_route_b, auth = [];

		function change_active(dc) {
			if (active_route_b) {
				if (active_route_b == dc) return;
				active_route_b.removeClass('active');
			}
			active_route_b = dc;
			active_route_b.addClass('active');
			

		}

		function hide_auth_routes() {
			auth.forEach(item => {
				item.el.hide();
			});
		}

		function show_auth_routes() {
			auth.forEach(item => {
				item.el.show();
			});
		}

		var fn = function (name, params) {
			if (menulist[name]) return;
			var state = {};
			name == 'admin' ?
			state.html = "<span>admin</span>":
			state.html = params.text ?"<span>" +  params.text + "</span>" : '<img src="images/'+name+ '_image.png"> ' + "<span>"+ params.title +"</span>";
			var dc = f_dc_make({
				eltype: 'li',
				state: state,
				events: {
					click(e) {
						if (params.auth && !f_user_authorized()) {
							hide_auth_routes();
							return;
						}
						f_preventDefault(e);
						pushmenu.fn(dc);
						Router.init(name);
						if(config[name]){
							changeTitle(config[name].title);
							route_set_url(config[name].url);
						}
					},
					mousedown(e) {
						f_preventDefault(e);
					}
				},
				attrs: {
					style: 'cursor: pointer;'
				}
			}).insertIn('.router-menu ul');
			menulist[name] = dc;
			auth.push(dc);
			
		}
		fn.fn = change_active;
		fn.draw = function () {
			f_user_authorized() ?
				show_auth_routes() :
				hide_auth_routes();
		}
		return fn;
	} ();

	fn.admin = function () {
		f_sget_rawmodule({
			name: 'admin/app-module',
			data: {
				f_sget_rawmodule: f_sget_rawmodule,
				f_semit: f_semit,
				f_sq: f_sq
			}
		}, (dc, api) => {
			if (dc && dc != 'ready') {
				fn.append('admin', {}, dc);
			}
		});
	}

	fn.append = function (name, params, dc) {
		if (!readyroutes[name]) readyroutes[name] = dc;
		if (!menulist[name]) pushmenu(name, params);
	}

	var route_set_url = function(v){
		var url = location.pathname + location.hash + location.search;
		if(location.pathname + v == url)return;
		window.history.pushState(null,null,v);
	}


	fn.go = function() {
		var list = {};
		for(let i in config){
			if(config[i].url)list[config[i].url] = i;
		}
		var tutorial_vis = true;
		return function(url, force) {
			var route_name = list[url];
			if(!force){
				if(tutorial_vis){
					tutorial.hide();// hide tutorial
					fn.show();
					tutorial_vis = false;
				}
				if(route_name){
					changeTitle(config[route_name].title);
					clickMenu(route_name);
				} else {
					changeTitle();
					route_set_url('/');
				}
			} else {
				if(route_name){
					changeTitle(config[route_name].title);
					clickMenu(route_name);
					if(tutorial_vis){
						tutorial.hide();// hide tutorial
						fn.show();
						tutorial_vis = false;
					}
				}
			}
		}
	}();

	fn.read = function() {
		var lasturl = '';
		return function(force) {
			var url = location.pathname.substr(1);
			if(url != lasturl){
				fn.go(url, force);
				lasturl = url;
			}
		}
	}();

	fn.hideTutorial = function(){
		// 
	}

	var changeTitle = function() {
		var prefix = 'FreePe';
		var title = $('title', 1);
		return (v) => {
			if(!v){
				title.textContent = prefix;
			} else {
				title.textContent = prefix + ' | ' + v;
			}
		}
	}();
			
	return fn;


} ();