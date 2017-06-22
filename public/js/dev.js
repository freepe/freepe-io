DC.ready(function(){
'use strict';

DC.lang.set({
	'uk': {
		'DASHBOARD_ROUTE' : 'Дашборд',
		'ABOUT_ROUTE' : 'Про проект',
		'SOCKET_ROUTE' : 'Сокет',
		'PROFILE_ROUTE' : 'Профіль',
		'SIGN_IN_H': 'Увійдіть',
		'SIGN_UP_H': 'Зареєйструйтесь',
		'SIGN_IN': 'вход',
		'SIGN_UP': 'реєстрація',
		'SIGN_OUT': 'вихід',
		'WELCOME_BACK': 'З поверненням, ',
		'SETTINGS_H': 'Модуль налаштувань',
		'UPDATE': 'оновити',
		'SAVE': 'зберегти',
		'MANAGE_YOUR_SUBSCRIPION': 'Керуйте своїми підписками тут',
		'finance': 'финансы',
		'Enter a Password': 'Введите пароль' 

	}
})
.turn('uk');

DC.setPseudo([
	's_connection',// socket connected or disconnected
	'u_login',// user logged in or out from App
	'app_first_loaded',
]);

var bodytag = document.body;
var footer = DC.sel('footer',1);

var socket;
var connected = 0;
var App = {
	authorized: 0,
	init_route: 'welcome'
};
// App.tempdev = 1;
var User = {};// all stuff related to user like username, id etc.
User.getLevel = function(){
	var levels = [100,300,600,1000,1500,2100,2800,3600,4500,5500,6600,7800,9100,10500,12000,13600,15300,17100,19000,21000,23100,25300,27600,30000,32500,35100,37800,40600,43500,46500,49600,52800,56100,59500,63000,66600,70300,74100,78000,82000,86100,90300,94600,99000,103500,108100,112800,117600,122500,127500,132600,137800,143100,148500,154000,159600,165300,171100,177000,183000,189100,195300,201600,208000,214500,221100,227800,234600,241500,248500,255600,262800,270100,277500,285000,292600,300300,308100,316000,324000,332100,340300,348600,357000,365500,374100,382800,391600,400500,409500,418600,427800,437100,446500,456000,465600,475300,485100,495000,505000],
		levlen = levels.length;
	return () => {
		var v = User.fpt;
		if(typeof v != 'number')v = parseInt(v);
		if(v < 100 || isNaN(v))return 1;
		for(var i = 0; i < levlen; i++){
			if(levels[i] > v){
				return i + 1;
			}
		}
		if(v > 100)return 100;
		return v;
	}
}();
var Storage = window.localStorage;

var notGood = {};// object with temporary methods that should be changed soon because of their unefficient and unpropper manner

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
window.onpopstate=function(){
	Router.read();
}

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

var header = f_dc_make(function () {
	//var head = $('header', 1);
	// var head = f_dc_temp({
	// 	eltype:'header', 
	// 	state: {

	// 	}
	// })
	var logo = f_dc_temp({
		state: {
			class: 'logo'
		},
		events: {
			click() {
				window.location.reload();
			}
		}
	})//.insertIn(head);


	var menu = f_dc_temp({
		eltype: 'img',
		state: {
			class: 'menu'
		},
		attrs: {
			src: 'images/menu.png'
		},
		events: {
			click() {
				if (sun_ul.el.style.display == 'block' || slideAc.el.style.display == 'block') {
					sun_ul.el.hide();
					slideAc.el.hide();
					sun.removeClass('sun_click');

				}



				var u = document.getElementsByClassName('header-slide-bar');
				var m = document.getElementsByClassName('menu');
				var acI = document.getElementsByClassName('imgAccount');
				var ac = document.getElementsByClassName('account');
				var number = document.getElementsByClassName('number');
				console.log(u[0].style.display == 'block');
				if (u[0].style.display == 'block') {
					u[0].style.display = 'none';
					DC.sel('.find', 1).hide();
					DC.sel('.search', 1).hide();
					$('.nub1', 1).show();
					$('.nub2', 1).show();
					//number[0].style.display = 'block !important';
					m[0].style.left = '22px';
					acI[0].style.position = 'inherit';
					acI[0].style.left = '19px';
					//ac[0].style.left = '347px';
					ac[0].style.position = 'inherit';
					this.style.pointerEvents = 'auto';
					arrowLogo.el.show();

				}
				else if ($('.router-menu', 1).style.display !== 'none') {
					u[0].style.display == 'block';
					DC.sel('.header-slide-bar', 1).show();
					DC.sel('.find', 1).show();
					DC.sel('.search', 1).show();
					$('.nub1', 1).hide();
					$('.nub2', 1).hide();
					//number[0].style.display = 'nonr !important';
					m[0].style.left = '217px';
					m[0].style.top = '23px';
					m[0].style.transition = 'none';
					acI[0].style.position = 'absolute';
					acI[0].style.left = '19px';
					acI[0].style.top = '12px';
					acI[0].style.zIndex = '15';
					acI[0].style.transition = 'none';
					ac[0].style.position = 'absolute';
					ac[0].style.left = '65px';
					ac[0].style.top = '2px';
					ac[0].style.zIndex = '15';
					ac[0].style.transition = 'none';
					arrowLogo.el.hide();

				}

			}
		}
	})//.insertIn(head);
	var number = f_dc_temp({
		eltype: 'span',
		state: {
			text: '0',
			class: 'number nub1'
		},
		attrs: {
			style: `border-right: 1px solid #2c58a3;
    				padding-right: 20px;    margin-right: 0;`
		}
	})//.insertIn(head);

	var numberTxt = f_dc_temp({
		eltype: 'span',
		state: {
			text: 'Репутация:',
			class: 'number rep'
		}
	})//.insertIn(head);

	var numberImg = f_dc_temp({
		eltype: 'img',
		state: {
			class: 'number nub2'
		},
		attrs: {
			src: 'images/star.png',
			style: `
				    width: 20px;
    				padding-bottom: 18px;
    				height: 20px;
    				border-left: 1px solid #2c58a3;
    				padding-top: 19px;
    				padding-left: 15px;
			`
		}
	})

	var find = f_dc_temp({
		eltype: 'input',
		type: 'text',
		state: {
			class: 'find'
		},
		attrs: {
			placeholder: 'Поиск'
		}
	})//.insertIn(head);

	var searchLogo = f_dc_temp({
		state: {
			class: 'search'
		}
	})//.insertIn(head);

	var bellLogo = f_dc_temp({
		state: {
			class: 'bell'
		}
	})//.insertIn(head);

	var sun = f_dc_temp({
		state: {
			class: 'sun'
		},
		events: {
			click() {
				if (slideAc.el.style.display == 'block' || menu.el.style.display == 'block') {
					slideAc.el.hide();
					//u.el.hide();
				}

				if (sun.hasClass('sun_click')) {
					sun.removeClass('sun_click');
					sun_ul.el.hide();
				} else {
					sun_ul.el.show();
					sun.addClass('sun_click');
				}
			}
		}
	})//.insertIn(head);

	var sun_ul = f_dc_temp({
		state: {
			class: 'sun_ul',
			html: `
                    <ul>
                        <li class="neiro" onmouseover="$('.neiro span',1).style.color='#428fc2'"
                        				  onmouseout="$('.neiro span',1).style.color='black'">
                        	<img src="images/neiro.png">
                        	<span>Нейросеть</span>
                        </li>
                        <li class="middle" onmouseover="$('.middle span',1).style.color='#428fc2'"
                        				  onmouseout="$('.middle span',1).style.color='black'">
                        	<img src="images/networking.png">
                        	<span>Сообщество</span>
                        </li>
                        <li class="res" onmouseover="$('.res span',1).style.color='#428fc2'"
                        				  onmouseout="$('.res span',1).style.color='black'">
                        	<img src="images/resourses.png" class="resourses">
                        	<span>Ресурсы</span>
                        </li>
                        <li class="last" onmouseover="$('.last span',1).style.color='#428fc2'"
                        				  onmouseout="$('.last span',1).style.color='black'">
                        	<img src="images/knowledge.png">
                        	<span>Знания</span>
                        </li>
                    </ul>
                `
		}
	})//.insertIn(head);
	sun_ul.el.hide();

	var blockAcc = f_dc_temp({
		state: {
			class: 'blockAcc'
		}
	});






	var imgAccount = f_dc_temp({
		eltype: 'img',
		state: {
			class: 'imgAccount'
		},
		attrs: {
			src: 'images/unknown.png'
		}
	}).insertIn(blockAcc);
	var accountName = f_dc_temp({
		eltype: 'span',
		state: {
			itext: 'Александр',
			class: 'account'
		}
	}).insertIn(blockAcc);

	var arrowLogo = DC.temp({
		state: {
			class: 'arrow'
		},
		events: {
			click() {
				if (sun_ul.el.style.display == 'block') {
					sun_ul.el.hide();
					sun.removeClass('sun_click');
				}
				if (slideAc.el.style.display !== 'none')
					slideAc.el.hide();
				else
					slideAc.el.show();
			}
		}
	}).insertIn(blockAcc);


	var ul = DC.temp({
		eltype: 'ul',
		state: {
			html: ``,
			class: 'header-slide-bar'
		}
	}).insertIn('.router-menu');

	// var slideBar = f_dc_make(function(){
	// 	var ul = DC.temp({
	// 		eltype: 'ul',
	// 		state: {
	// 			html:``,
	// 			class: 'header-slide-bar'
	// 		}
	// 	}).insertIn('.router-menu');

	// });

	var slideAc = f_dc_temp({
		eltype: 'ul',
		state: {
			class: 'slideAc',
			html: ``
		}
	}).insertIn(blockAcc);
	slideAc.el.hide();
	var slideAc_logout = f_dc_temp({
		eltype: 'li',
		state: {
			html: '<img src="images/two.png">Настройки'
		},
		events: {
			click() {

			}
		}
	}).insertIn(slideAc);
	var slideAc_Settings = f_dc_temp({
		eltype: 'li',
		state: {
			html: '<img src="images/out.png" >Выйти'
		},
		events: {
			click() {
				f_App_signout();
			}
		}
	}).insertIn(slideAc);

	var sliderSettings = f_dc_temp(function () {


		return {
			state: {
				class: 'slideSet'
			},
			init() {
				var list = [];
				f_dc_list(this, list);
			}
		}
	})
	sliderSettings.el.hide();
	console.log();

	//console.log('mctx ',mctx);

	return {
		extend: {
			updateName(val) {

				if (!val)
					accountName.change({
						text: ""
					})
				else
					accountName.change({
						text: val
					});
			},
			updateIcon(val) {
				imgAccount.change({
					src: val
				})
			}

		},
		init() {
			this.insertAs('header');
			var list = [
				logo,
				menu,
				searchLogo,
				find,
				bellLogo,
				sun,
				sun_ul,
				blockAcc,
				number,
				numberTxt,
				numberImg,
			];
			f_dc_list(this, list);
		}
	}
});
//header.updateName();
var footer = f_dc_make(function () {
	var blockFooter = f_dc_temp({
		eltype: 'ul',
		state: {
			class: 'ul',
			html: `
							<li id="l4"><a href="">Правила</a></li>
							<li id="l5">Язык <select>
								<option>Русский</option>
								<option>English</option>
								<option>Українська</option>
							</select></li>
					`
		}
	})

	var li_1 = f_dc_temp({
		eltype: 'li',
		state: {
			html: '<a href="">Правила</a>'
		},
		attrs: {
			id: 'l4'
		}
	}).insertIn(blockFooter)
	var li_2 = f_dc_temp({
		eltype: 'li',
		state: {
			html: `<select>
				<option selected>Русский</option>
								<option>English</option>
								<option>Українська</option>
			</select`
		},
		attrs: {
			id: 'l5'
		}
	}).insertIn(blockFooter)

	var li_2_select = f_dc_temp({
		eltype: 'select',
		state: {
			html: `
				<option value="en">English</option>
				<option value="uk">Українська</option>
			`,
			class: 'selectLang'
		}
	}).insertIn(li_2);

	return {
		init() {
			this.insertAs('footer');
			var list = [
				blockFooter
			];
			f_dc_list(this, list);
		}
	}

});


$('.router-menu', 1).hide();
$('.router-view', 1).hide();


//1.00
var welcome = f_dc_make(function () {

	function f_dc_make(obj) {
		return DC.make(obj);
	}
	function f_dc_temp(obj) {
		return DC.temp(obj);
	}
	function f_dc_list(dc, list) {
		dc.DClist(list);
	}

	var page = f_dc_temp({
		state: {
			class: 'page',
			html: `
            <div class="freepe">
                <div class="freepe_block1">
                <h1> ДОБРО ПОЖАЛОВАТЬ В МИР FREEPE IO.</h1>
                <p>Мы очень рады, что вы присоединились к нам. 
                    Вместе мы достигнем потрясающих высот!
                </p>
                </div>
            </div>
                <div class="freepe_block2">
                    <p>Позвольте сделать небольшую экскурсию по страницам.</p>
                    <a href="#DashBoard"><img src="images/lineSmall.png" style="padding-right: 4%; ">
                    НАЧАТЬ ЭКСКУРСИЮ
                    <img src="images/lineSmall.png" style="padding-left: 4%;"></a>
                </div>
            `
		}
	})

	var pageBlock = f_dc_temp({
		state: {
			class: 'pageBlock'
		}
	})

	var pageFreepe = f_dc_temp({
		state: {
			class: 'pageFreepe',
			html: `<p><span>FreePe</span> - это международная Социально-Экономическая Сеть, призванная вобрать в себя все самое лучшее из социальных сетей, 
    		бирж труда, торговых площадок и платежных систем, где главные правила – честность, порядочность и открытость. Проект предоставит простое и изящное решение самых актуальных проблем современного интернета: продвижение; доверие; 
    		поиск товаров, партнеров, инвесторов.</p>`
		}
	}).insertIn(pageBlock)


	var papeDashBoard = f_dc_temp({
		state: {
			class: 'pageDashBoard',
			html: `
                <div class="DashBoard" id="DashBoard">
                	<div class="dash">
                		<div class="block1">
                    		<h1>ДОМАШНЯЯ СТРАНИЦА</h1>

                    		<p>
                        		На <span class="span page_dash" style="color:#f1f1f1" onclick="">
							 	Домашней странице</span> указан ваш текущий
                        		баланс FreePenny(FPN), реферальная ссылка с возможностью поделится ею через
                        		соцсети, уровень, который влияет на процент дохода с вложений
                        		ваших рефералов, а также личные и групповые сообщения.
                    		</p>
                    	</div>
                    		<img src="images/DashBoard.png" id="img">
                    		<img src="images/DashBoard480.png" id="alterDash">
							
					</div>
                   
                </div>
            `
		}
	}).insertIn(pageBlock);

	var pageFinanses = f_dc_temp({
		state: {
			class: 'pageDashBoard',
			html: `
            	<div class="DashBoard" id="DashBoard" style=" margin: 0;">
                	<div class="dash">
                		<div class="block1">
                    		<h1>СТРАНИЦА ФИНАНСОВ</h1>

                    		<p>
                        		На странице<span class="span fina" style="color:#f1f1f1" onclick="">
							 	Финансы</span> вы можете найти свои кошельки FreePenny и
                        		осуществлять операции по отправке и обмену средств, делать запросы на получение платежей,пополнять счета FPM с помощью различных валют и выводить деньги
                        		через доступные платежные системы.
                    		</p>
                    	</div>
                    		<img src="images/fin.png" id="img">
                    		<img src="images/fin480.png" id="alterDash">
							
					</div>
					 <a href="#ul"><img src="images/str.png" id="str"></a>
                </div>
                <!--
                <div class="finanses" id="fin">
                    <h1>СТРАНИЦА ФИНАНСОВ</h1>
                    <!--<img src="images/fin.png" style="width: 80%;">
                    <img src="images/fin480.png" id="alterFin">-->
				<!--
                    <p>
                        На странице<span class="span fina"> 
						Финансы
						</span> 
						вы можете найти свои кошельки FreePenny и
                        осуществлять операции по отправке и обмену средств, делать запросы на получение платежей,пополнять счета FPM с помощью различных валют и выводить деньги
                        через доступные платежные системы.
                    </p>
                </div>-->
            `
		}
	}).insertIn(pageBlock);

	var ul = f_dc_temp({
		eltype: 'ul',
		state: {
			class: 'ul_icons',
			html: `
				<li>
					<div class="imgUl">
						<img src="images/networking.png">
					</div>
					<a target="_blank" href="http://freepe.co/" style="display:block;">
					<div class="nav">
					<h3>Freepe.Co</h3>
					<p>Сообщество проекта и форум для общения.</p>
					</div>
					</a>
				</li>
				<li>
					<div class="imgUl">
						<img src="images/user.png">
					</div>
					<a target="_blank" href="https://freepe.info/" style="display:block;">
					<div class="nav">
					<h3>Freepe.Info</h3>
					<p>Информационный ресурс знаний и технологий.</p>
					</div>
					</a>
				</li>
				<li class="three">
					<div class="imgUl">
						<img src="images/piggy-bank.png">
					</div>
					<a target="_blank" href="" style="display:block;">
					<div class="nav">
					<h3>Freepe.Io</h3>
					<p>универсальная социо-экономическая платформа.</p>
					</div>
					</a>
				</li>
				<li>
					<div class="imgUl">
						<img src="images/Ellipse.png">
					</div>
					<a target="_blank" href="http://freepe.net/" style="display:block;">
					<div class="nav">
					<h3>Freepe.Net</h3>
					<p>Распределенная и автономная нейросеть доверия</p>
					</div>
					</a>
				</li>
				<li>
					<div class="imgUl">
						<img src="images/computer.png">
					</div>
					<a target="_blank" href="http://freepe.online/" style="display:block;">
					<div class="nav">
					<h3>Freepe.Online</h3>
					<p>Блог с новостями, статьями и обновлениями</p>
					</div>
					</a>
				</li>
				<li class="three_2">
					<div class="imgUl">
						<img src="images/worldwide.png">
					</div>
					<a target="_blank" href="https://freepe.org/en/index.html" style="display:block;">
					<div class="nav">
					<h3>Freepe.Org</h3>
					<p>описательный портал проэкта и ГО ФриПе Фундация</p>
					</div>
					</a>
				</li>
    		`
		},
		attrs: {
			id: 'ul'
		}
	}).insertIn(pageBlock);

	var button_next = f_dc_temp({
		state: {
			html: `	
					<div class="freepe_block2" style="background-image: none">
                    	<a href="#" class="go">
                    	НАЧАТЬ РАБОТУ
						</a>
                </div>
			`
		}
	}).insertIn(pageBlock)
	var pagePr = f_dc_temp({
		state: {
			class: 'pr'
		}
	})
	return {
		init() {
			this.insertAs('.app-welcome');
			var list = [
				page,
				pageBlock,
			];
			f_dc_list(this, list);

		}
	}
});




// var head1 = f_dc_temp({
// 	eltype: 'header',
// 	state: {
// 		class: '',
// 		html: '<div></div>'
// 	}
// })
// var logo = f_dc_temp({
// 	state: {
// 		class: 'logo'
// 	}
// }).insertIn(head1);
(function () {

	var tempcontainer = f_dc_temp({
		state: {
			class: 'welcome-tutorial',
		}
	}).insertIn(document.body);
	$('footer', 1).hide();
	$('header', 1).hide();
	$('.app-welcome', 1).show();
	tempcontainer.el.show();
	$('.pageDashBoard', 1).hide();
	$('.page', 1).hide();
	$('.pageBlock', 1).hide();
	//$('.pageFinanses',1).hide();
	//$('.pr',1).hide();
	f_dc_list(tempcontainer, [
		header,
		welcome,
		footer
	]);
	var next = document.getElementsByClassName('go');
	next[0].onclick = function () {
		Router.go('dashboard');
	}




})()





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
var auth = f_dc_temp(function(){
    var h3 = f_dc_temp({
	eltype: 'h3',
	state: {
		class: 'h3',
		text: 'Наслаждайся жизнью сейчас'
	}
})

var fix = f_dc_temp({
	state: {
		class: 'fix',
		html: `
		<select>
			<option selected>Русский</option>
		</select>
		<a href="#" onclick=" $('.form_inp',1).show();">Войти</a>`
	}
})

var a_fix = f_dc_temp({
	eltype: 'a',
	state: {
		class: '',
		text: 'Войти'
	},
	events: {
		click(){
			if($('.form_inp',1).style.display !== 'none') {
				$('.form_inp',1).hide();
			} else {
				$('.form_inp',1).show();
			}
			 
		}
	}
}).insertIn(fix);

var alter = f_dc_temp({
	eltype: 'a',
	state: {
		class: '',
		text: 'Войти'
	},
	attrs: {
		id: 'alter'
	},
	events: {
		click(){
			// $('#alter',1).show();
			// $('.form_inp',1).show();
			// h3.addClass('h3_alter');
			if($('.form_inp',1).style.display !== 'none'){
				$('.form_inp',1).hide();
				h3.removeClass('h3_alter');
			} else {
				$('.form_inp',1).show();
				h3.addClass('h3_alter');
			}
		}
	}
})
var p = f_dc_temp({
	eltype: 'p',
	state: {
		class: 'p',
		html: `Стань одним из нас! Позволь <strong>FreePe</strong> позаботится об остальном.`
	}
})

var p2 = f_dc_temp({
	eltype: 'p',
	state: {
		class: 'alternative',
		html: `Стань одним из нас!<br>Позволь <strong>FreePe</strong> позоботиться об остальном.`
	}
})

var form = f_dc_temp({
	eltype: 'form',
	state: {
		html: `
			<input type="email" class="validate" id="email" placeholder="Введите ваш Email" required>
 				 <input type="submit" id="submit" class="" value="Вливайся!">
		`,
		class: 'form'
	}

})

var login_form = f_dc_make(function(){
////////////
var result = f_dc_temp({
	attrs: {
		style: 'white-space: pre-wrap;word-break: break-all;'
	}
});


var email = f_dc_temp({
	eltype: 'input',
	state: {
		class: 'input'
	},
	attrs: {
		placeholder: 'Логин',
		autocomplete: 'false',
		value: ''
	},
	events: {
		keydown(e){
			if(e.keyCode == 13)send();
		}
	}
});
var password = f_dc_temp({
	eltype: 'input',
	state: {
		class: 'input'
	},
	attrs: {
		placeholder: 'Пароль',
		type: 'password',
		autocomplete: 'false',
		value: ''
	},
	events: {
		keydown(e){
			if(e.keyCode == 13)send();
		}
	}
});
var button = f_dc_temp({
	eltype: 'button',
	state: {
		itext: 'SIGN_IN',
		class: 'b'
	},
	attrs: {
		type: 'submit'
	},
	events: {
		click(e,not_prevent){
			if(not_prevent)return true;
			f_preventDefault(e);
			var emailval = email.el.value;
			var passval = password.el.value;
			// simple email and password validation
			if(emailval.length < 4){
				email.el.focus();
				if(emailval.length)notify.is('login not valid');
				return;
			}
			if(passval.length < 4){
				password.el.focus();
				if(passval.length)notify.is('password not valid');
				return;
			}
			result.change({text: ''});
			notify.until('loading...');
			f_semit('signin',{
				email: emailval,
				pass: passval
			},function(data){
				notify.until();
				var text = '';
				try{
					if(data.reason){
						text += 'Authorization failed\n';
						text += JSON.stringify(data,null,4);
					}else
					if(data.token){
						f_App_authorize(data.token,null,function(){
							// if success
							// button.onclick(null,1);
							form.el.submit();
						});
					}
				}catch(e){
					text = 'something went wrong...';
				}
				result.change({text: text});
			})
		}
	}
});
function send(){
	button.onclick();
}
var form;

return {
	init(){
		var ctx = {
			a: email,
			b: password,
			c: button,
			d: result
		}
		form = f_dc_temp().parse(`<form method="post" style="display:none" class="form_inp" autocomplete="false" action="/rt-login">{a}<br />{b}<br />{c}{d}</form>`,ctx);
		this.parse(`<div>{f}</div>`,{f:form});
		// this.parse(`<div><h1>Sign in</h1><form method="post" action="/rt-login">{a}<br />{b}<br />{c}{d}</form></div>`,ctx);
	}
}
//////////
});


return {
    init(){
        var list;
		if(f_user_authorized()){
			list = [
				//welcome.draw(),
				// form1,
				//b,
				//logout,
				//modules
				
			];
		}else{
			list = [
				fix,
				alter,
				 h3,
				p,
				p2,
				form,
				login_form,
				//line,
				//info
			];
		}
		f_dc_list(this,list);
		return this;
    }
}
});
var route_profile = f_dc_make(function(){
////////////
var welcome = f_dc_temp({
	events: {
		lang(){
			welcome.draw();
		}
	}
});
welcome.draw = function(){
	var roomapi = Router.get_api('room');
	if(roomapi)roomapi.updateLink(User.ref_link);
	this.change({html: DC.lang('WELCOME_BACK') + User.name + '<br>Share your referral link: <b>http://freepe.io/ref/' + User.ref_link + '</b>'});
	return this;
}




	/*

	
    var page = f_dc_temp({
        state: {
            class: 'page',
            html: `
            <div class="freepe">
                <div class="freepe_block1">
                <h1> ДОБРО ПОЖАЛОВАТЬ В МИР FREEPE IO.</h1>
                <p>Мы очень рады, что вы присоединились к нам. 
                    Вместе мы достигнем потрясающих высот!
                </p>
                </div>
            </div>
                <div class="freepe_block2">
                    <p>Позвольте сделать небольшую экскурсию по страницам.</p>
                    <a href="#DashBoard"><img src="images/lineSmall.png" style="padding-right: 4%; ">
                    НАЧАТЬ ЭКСКУРСИЮ
                    <img src="images/lineSmall.png" style="padding-left: 4%;"></a>
                </div>
            `
        }
    }).insertIn('.tutorial');

	    var papeDashBoard = f_dc_temp({
        state: {
            class: 'pageDashBoard',
            html:`
                <div class="DashBoard" id="DashBoard">
                    <h1> 1. ДОМАШНЯЯ СТРАНИЦА</h1>
                    <img src="images/DashBoard.png" id="img" style="width: 80%;">
                    <img src="images/DashBoard480.png" id="alterDash">

                    <p>
                        На <span class="span1"> Домашней странице</span> указан ваш текущий
                        баланс FreePenny(FPN), реферальная ссылка с возможностью поделится ею через
                        соцсети, уровень, который влияет на процент дохода с вложений
                        ваших рефералов, а также личные и групповые сообщения.
                    </p>

                    <a href="#fin"><img src="images/str.png" id="str"></a>
                </div>
            `
        }
    }).insertIn('.tutorial');

	    var pageFinanses = f_dc_temp({
        state: {
            class: 'pageFinanses',
            html: `
               
            `
        }
    }).insertIn('.tutorial');

	var fin = f_dc_temp({
		state:{
			class: 'finanses',
			html: `
				<h1>2. СТРАНИЦА ФИНАНСОВ</h1>
                    <img src="images/fin.png" style="width: 80%;">
                    <img src="images/fin480.png" id="alterFin">

                    <p>
                        На странице<span class="span2"> </span> вы можете найти свои кошельки FreePenny и
                        осуществлять операции по отправке и обмену средств, делать запросы на получение платежей,пополнять счета FPM с помощью различных валют и выводить деньги
                        через доступные платежные системы.
                    </p>
			`
		},
		attrs: {
			id: 'fin'
		}
	}).insertIn('.pageFinanses');

	var span = f_dc_temp({
		eltype: 'text',
		state: {
			text: 'Финансы'
		},
		events: {
			click(){
				DC.sel('.tutorial',1).hide();
				$('.header-slide-bar',1).style.display = 'inline-block';
				$('.router-view',1).style.display = 'inline-block';
				
			}
		}
	}).insertIn('.span2');

    var pagePr = f_dc_temp({
        state: {
            class: 'pr'
        }
    }).insertIn('.tutorial');


	*/

// var divMain = DC.make({
// 		state: {
// 			html:'<div class="fix">'+
// 					'<a href="#">Войти</a>'+
// 				 '</div>'+

// 				 '<a href="#" id="alter">Войти</a>'+

// 				 '<h3>Наслаждайся жизнью сейчас!</h3>'+
// 				 '<p>Стань одним из нас! Позволь <strong>FreePe</strong> позоботиться об остальном.</p>'+
// 				 '<p class="alternative">Стань одним из нас!<br>Позволь <strong>FreePe</strong> позоботиться об остальном.</p>'+

// 				 '<form><input type="email" class="validate" id="email" placeholder="Введите ваш Email" required>'+
// 				 '<input type="submit" id="submit" class="" value="Вливайся!"></form>'+

// 				 '<div class="page_background_middle"></div>'+
// 				 '<div class="page_background_footer"></div>',
// 			class: 'page-background'
// 		}
// 	});
function insert_br(){
	f_dc_temp({
		eltype: 'br'
	}).insertIn(form1);
}

var fix = f_dc_temp({
	state: {
		class: 'fix',
		html: '<a href="#" onclick=" $(`.form_inp`,1).show();">Войти</a>'
	}
})

var a_fix = f_dc_temp({
	eltype: 'a',
	state: {
		class: '',
		text: 'Войти'
	},
	events: {
		click(){
			if($('.form_inp',1).style.display !== 'none') {
				$('.form_inp',1).hide();
			} else {
				$('.form_inp',1).show();
			}
			 
		}
	}
}).insertIn(fix);

var alter = f_dc_temp({
	eltype: 'a',
	state: {
		class: '',
		text: 'Войти'
	},
	attrs: {
		id: 'alter'
	},
	events: {
		click(){
			// $('#alter',1).show();
			// $('.form_inp',1).show();
			// h3.addClass('h3_alter');
			if($('.form_inp',1).style.display !== 'none'){
				$('.form_inp',1).hide();
				h3.removeClass('h3_alter');
			} else {
				$('.form_inp',1).show();
				h3.addClass('h3_alter');
			}
		}
	}
})

var h3 = f_dc_temp({
	eltype: 'h3',
	state: {
		class: 'h3',
		text: 'Наслаждайся жизнью сейчас'
	}
})

var p = f_dc_temp({
	eltype: 'p',
	state: {
		class: 'p',
		html: `Стань одним из нас! Позволь <strong>FreePe</strong> позаботится об остальном.`
	}
})

var p2 = f_dc_temp({
	eltype: 'p',
	state: {
		class: 'alternative',
		html: `Стань одним из нас!<br>Позволь <strong>FreePe</strong> позоботиться об остальном.`
	}
})

var form = f_dc_temp({
	eltype: 'form',
	state: {
		html: `
			<input type="email" class="validate" id="email" placeholder="Введите ваш Email" required>
 				 <input type="submit" id="submit" class="" value="Вливайся!">
		`,
		class: 'form'
	}

})



var logout = f_dc_temp({
	eltype: 'button',
	state: {
		itext: 'SIGN_OUT',
		class: 'b sign-out'
	},
	events: {
		click(){
			f_App_signout();
		}
	}
});
var line = f_dc_temp({
	state: {
		class: 'hr'
	}
});
var info = f_dc_temp({
	state: {
		html: `<h1>Як зареєструватися?</h1>
		<div>Просто запитайте в друзів чи знайомих їхній реферальний лінк та перейдіть по ньому.</div>`
	}
});

// load settings module
var b = f_dc_temp({
	eltype: 'button',
	state: {
		class: 'b',
		text: 'load modules'
	},
	events: {
		click(){
			f_sget_rawmodule({
				name: 'settings',
				css: 1,
				data: {
					semit: f_semit
				},
			}, (dc, api) => {
				if(dc && dc != 'ready'){
					dc.insertIn(modules);
				}
			});
			f_sget_rawmodule({
				name: 'messenger',
				css: 1
			}, (dc, api) => {
				if(dc && dc != 'ready'){
					dc.insertIn(modules);
				}
			});
		}
	}
});

var form1 = f_dc_make({
            eltype: 'form',
            state: {
                html:  '', 
                class: ''
            }
        })
               ////////////////////////////////
var name = f_dc_temp({
	eltype: 'input',
	state: {
		class: 'form_input'
	},
	attrs: {
		placeholder: 'Name'
	},
	events: {
		input(){
			//this.value = only_alpha(this.value).substr(0,20);
		}
	}
}).insertIn(form1);
var surname = f_dc_temp({
	eltype: 'input',
	state: {
		class: 'form_input'
	},
	attrs: {
		placeholder: 'Surname'
	},
	events: {
		input(){
			//this.value = only_alpha(this.value).substr(0,20);
		}
	}
}).insertIn(form1);
insert_br();
var login = f_dc_temp({
	eltype: 'input',
	state: {
		class: 'form_input'
	},
	attrs: {
		placeholder: 'login (optional)'
	},
	events: {
		// input(){
		// 	var val = only_login(this.value).substr(0,20);
		// 	if(val != this.value) this.value = val;
		// },
		// keyup(){
		// 	var val = only_login(login.el.value).substr(0,20);
		// 	if(check_login.val == val)return;
		// 	check_login();
		// }
	}
}).insertIn(form1);
//
var email = f_dc_temp({
	eltype: 'input',
	state: {
		class: 'form_input',
	},
	attrs: {
		placeholder: 'Email',
		id: 'email'
	},
}).insertIn(form1);
insert_br();
var password = f_dc_temp({
	eltype: 'input',
	state: {
		class: 'form_input'
	},
	attrs: {
		type: 'password',
		placeholder: 'password'
	}
}).insertIn(form1);
var password2 = f_dc_temp({
	eltype: 'input',
	state: {
		class: 'form_input'
	},
	attrs: {
		type: 'password',
		placeholder: 'again password'
	}
}).insertIn(form1);
var modules = f_dc_temp();

var login_form = f_dc_make(function(){
////////////
var result = f_dc_temp({
	attrs: {
		style: 'white-space: pre-wrap;word-break: break-all;'
	}
});


var email = f_dc_temp({
	eltype: 'input',
	state: {
		class: 'input'
	},
	attrs: {
		placeholder: 'Логин',
		autocomplete: 'false',
		value: ''
	},
	events: {
		keydown(e){
			if(e.keyCode == 13)send();
		}
	}
});
var password = f_dc_temp({
	eltype: 'input',
	state: {
		class: 'input'
	},
	attrs: {
		placeholder: 'Пароль',
		type: 'password',
		autocomplete: 'false',
		value: ''
	},
	events: {
		keydown(e){
			if(e.keyCode == 13)send();
		}
	}
});
var button = f_dc_temp({
	eltype: 'button',
	state: {
		itext: 'SIGN_IN',
		class: 'b'
	},
	attrs: {
		type: 'submit'
	},
	events: {
		click(e,not_prevent){
			if(not_prevent)return true;
			f_preventDefault(e);
			var emailval = email.el.value;
			var passval = password.el.value;
			// simple email and password validation
			if(emailval.length < 4){
				email.el.focus();
				if(emailval.length)notify.is('login not valid');
				return;
			}
			if(passval.length < 4){
				password.el.focus();
				if(passval.length)notify.is('password not valid');
				return;
			}
			result.change({text: ''});
			notify.until('loading...');
			f_semit('signin',{
				email: emailval,
				pass: passval
			},function(data){
				notify.until();
				var text = '';
				try{
					if(data.reason){
						text += 'Authorization failed\n';
						text += JSON.stringify(data,null,4);
					}else
					if(data.token){
						f_App_authorize(data.token,null,function(){
							// if success
							// button.onclick(null,1);
							form.el.submit();
						});
					}
				}catch(e){
					text = 'something went wrong...';
				}
				result.change({text: text});
			})
		}
	}
});
function send(){
	button.onclick();
}
var form;

return {
	init(){
		var ctx = {
			a: email,
			b: password,
			c: button,
			d: result
		}
		form = f_dc_temp().parse(`<form method="post" style="display:none" class="form_inp" autocomplete="false" action="/rt-login">{a}<br />{b}<br />{c}{d}</form>`,ctx);
		this.parse(`<div>{f}</div>`,{f:form});
		// this.parse(`<div><h1>Sign in</h1><form method="post" action="/rt-login">{a}<br />{b}<br />{c}{d}</form></div>`,ctx);
	}
}
//////////
});
return {
	initLater(){
		var list;
		if(f_user_authorized()){
			list = [
				//welcome.draw(),
				// form1,
				//b,
				//logout,
				//modules
				
			];
		}else{
			list = [
				fix,
				alter,
				h3,
				p,
				p2,
				form,
				login_form,
				//line,
				//info
			];
		}
		f_dc_list(this,list);
		return this;
	}
}
//////////
});

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
//f_change_language('uk');
// end of DC
});
