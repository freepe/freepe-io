DC.ready(function(){
'use strict';

function f_dc_make(obj){
    return DC.make(obj);
}
function f_dc_temp(obj){
    return DC.temp(obj);
}

function only_alpha(v){
    return v.replace(/[^a-zа-яії]/gi,'');
}

function only_login(v){
    return v.replace(/[^a-zа-яії_]/gi,'');
}

function f_preventDefault(e){
    if(!e)e = window.event;
    e.preventDefault();
}

function f_semit(){
    if(!connected)return;
    // socket.emit.apply(socket.emit,arguments);
    socket.emit.apply(socket,arguments);
}
// start DC
var menu = DC.sel('.router-menu',1);
var body = DC.sel('.router-view',1);
var app = document.body;
DC.sel('.loading-app',1).remove();

var socket;
var connected = 0;

// some usefull functions
function f_dc_temp(obj){
	return DC.temp(obj);
}
function f_preventDefault(e){
	if(!e)e = window.event;
	e.preventDefault();
}
function logr(){
	console.log.apply(console,arguments);
}

var Storage = localStorage;
var ref_link = Storage.ref_link;
if(!ref_link || ref_link.length != 17){
	body.textContent = 'Error. Wrong url';
}else{
if(location.pathname != '/ref/' + ref_link){
	location.href = '/ref/' + ref_link
	return;
}
//////////////
function f_semit(){
	if(!connected)return;
	// socket.emit.apply(socket.emit,arguments);
	socket.emit.apply(socket,arguments);
}
function insert_br(){
	f_dc_temp({
		eltype: 'br'
	}).insertIn('form');
}
var notify = f_dc_temp(function(){
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
		dc = this.insertIn(body);
		text.insertIn(dc);
	}
}
//////////
});
function only_alpha(v){
	return v.replace(/[^a-zа-яії]/gi,'');
}
function only_login(v){
	return v.replace(/[^a-zа-яії_]/gi,'');
}
f_dc_temp().insertAs('.static').insertIn(body).el.hide();
var form = f_dc_temp({
	state: {
		class: 'center'
	}
}).insertIn(body);
/////////////////////////////
var mainPage = f_dc_make(function(){
        
        var re = f_dc_temp({
        	state: {
        		class:'reg'
        	}
        }).insertIn('.page-background');

        //////////////////////////////

var pagelogo = f_dc_temp({
        state: {
            html: '<div class="logo"></div>',
            class: 'registr-background'
        }
        }).insertIn('.reg');

var logoReg = f_dc_temp({
	eltype: 'img',
	state: {
		class: 'freepe_logo'
	},
	attrs: {
		src: "../images/freepe_logo_w.png"
	}
}).insertIn(pagelogo);
        var logo = f_dc_temp({
            state: {
                html: '<h3>Добро пожаловать</h3>',
                class: ''
            },
            attrs: {
            	style: 'text-align: center;'
            }
        }).insertIn(pagelogo);

//////////////////////////////////////////

var page_form = f_dc_make(function(){
        var logo = f_dc_temp({
            state: {
                html: '<h3>Добро пожаловать</h3>',
                class: 'logo'
            }
        }).insertIn('.reg');

        var rect_form = f_dc_temp({
            state: {
                html: `<div class="fo">
                            
                       </div>`,
                class: 'rect'
            }    
        }).insertIn('.reg');
        ////////////////////////////////////
        var head = f_dc_temp({
        	state: {
        		html: `<h3>РЕГИСТРАЦИЯ</h3>`
        	}
        }).insertIn('.fo');
               var form = f_dc_make({
            eltype: 'form',
            state: {
                html:  '', 
                class: ''
            }
        }).insertIn('.fo');

               var popap = f_dc_temp({
               	state: {
               		class: 'popap',
               		html: `<h1>ПОЛЬЗОВАТЕЛЬСКОЕ СОГЛАШЕНИЕ</h1>
						<div>
						<span >Инвестирование средств</span>
							<p>Инвестируя в наш проект, вы соглашаетесь с пониманием рисков и возможным их возникновением, за которые FreePe не несет ответственности. 
							Решение об участии в инвестировании, или нет, принадлежат исключительно вам. 
							Мы не даем никаких советов по поводу инвестирования средств или любой другой подобной информации. 
							Данная информация предоставляется пользователям исключительно в целях ознакомления и не является конкретной рекомендацией инвестировать или отказаться от данного действия. 
							Если вы не уверены в своих действиях касательно инвестирования, вы можете обратиться к независимому финансовому консультанту. мы, в свою очередь, не даем никаких финансовых или налоговых консультаций, 
							но вы можете обратиться к налоговому консультанту для получения информации о возможных последствиях инвестирования. 
							FreePe не несет ответственности за упущенную выгоду, потерянные сбережения, случайные или специальные убытки, которые вы понесли в результате совершенных или несовершенных действий действий на сайте.</p>
							<p>
								В данной статье вы можете прочитать правила, 
								при соглашении с которыми FreePe предоставляет свои услуги. 
								Посещая и пользуясь сайтом, вы даете нам право принимать вас как участника, который согласился со всеми правилами,
								 а также со всеми действующими законами, нормативными актами и их изменениями. 
								 Для пользования данным сайтом, вам должно быть не менее 18 лет. 
								 Вы не можете использовать этот веб-сайт любым способом,
								 который причиняет или может причинить, повреждение сайта или ухудшение работы или доступности к нему; каким-либо образом, который является незаконным, мошенническим или вредными.
							</p>
							<p>
								FreePe не является банком, регулирующим финансовые услуги, мы не имеем доступа к FreePenny , 
								хранящихся на веб-сайте, а просто предоставляем интерфейс для доступа к FreePenny.
								 Закрытые ключи FreePenny шифруются с помощью пароля пользователей. Как пользователь FreePe, вы будете нести ответственность за любые убытки или ущерб, возникшие из следующих функций: потери или кражи пароля; 
								 потери или кражи вашего кошелька; потери или кражи FreePenny из-за данных кошелька; поврежденных файлов кошелька; 
								отправки FreePenny на некорректный адрес; потери FreePenny из-за мошенничества, вредоносных сайтов, программ или вирусов.
							</p>
						<span>Личная информация</span>
						<p>
							Мы сохраняем адрес электронной почты, IP-адрес и Ваши личные данные. Мы не храним пароль.
						</p>
						<span>Cookies</span>
						<p>
							Cookies - это файл, который отправляется ваш браузер для предоставлении информации о веб-сайте,
							 которым вы пользуетесь. Это дает возможность записать информацию о вашем посещении,
							  выбранном языке сайта и других настройках, что поможет сделать ваше следующее посещение
							   сайта более комфортным. FreePe использует cookies для предоставления лучшего пользовательского опыта. 
							   Мы обязуемся не продавать, 
							распространять или отдавать на пользование вашу личную информацию сторонним лицам.
						</p>
						<span>Правила реферальной с	истемы</span>
						<p>
							Процент аффилиату начисляется в результате успешного обмена или генерации FPN рефералом.
							 При этом действует правило увеличения максимального баланса. 
							Например, реферал купил 100 FPN и его аффилиат получил %. 
							Дальнейший процент начисляется только в случае приобретения дополнительных FreePenny, 
							то есть на 1 FPN, если баланс равен 101 FPN. 
							Оборот не может считаться увеличенным, если пользователь обменял FPN на FPM, 
							а потом обратно или в случае отправки и получения.
							Реферал должен сначала ввести деньги в систему и купить FPM.
							 Если он каким-либо другим образом получил FPM в результате перевода/обменной операции и так далее - процент за обмен FreePe Money на FreePenny аффилиату не начисляется.
						</p> 
						<span>Правила генерации FPN</span>
						<p>
							Каждый исполнитель, который сгенерировал FPN за выполненную полезную работу, обязуется принимать этот актив в качестве оплаты за свои товары и услуги, 
							пока объем не превысит количество сгенерированных FreePenny. 
							Например, программист сгенерировал 100 FPN, значит пока он должен принимать только FPN, пока он не предоставит частным заказчикам услуг на сумму, равную 100 FreePenny. 
							Тогда ему разрешается принимать оплату в любой другой валюте.
						</p> 
						</div>
						<hr></hr>
               		`
               	},
               	events: {
               		click(){
               			popap.el.hide();
               		}
               	}
               }).insertIn('.page-background');
				popap.el.hide();
				               var text = f_dc_temp({
               	eltype: 'p',
               	state: {
               		class: '',
               		html : `Регистрируясь на сайте вы соглашаетесь
               				 с <span onclick="$('.popap',1).show();" style="text-decoration: underline; cursor:pointer;">
               				 <пользовательским соглашением></span>`
               	},
               	attrs: {
               		style: 'margin: 0;font-size: 14pt;color: #8b8c8c;'
               	}
               }).insertIn('.fo');

			   var popap_before = f_dc_temp({
				   state: {
					   class: 'popap_before',
					   html: `<p>
					   		Successful registration<br>
					   		Check your inbox
					   </p>`
				   },
				   events: {
					   click(){

					   }
				   }
			   }).insertIn('.page-background');
			   popap_before.el.hide();
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
			this.value = only_alpha(this.value).substr(0,20);
		}
	}
}).insertIn('form');
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
			this.value = only_alpha(this.value).substr(0,20);
		}
	}
}).insertIn('form');
///
insert_br();
//
var login = f_dc_temp({
	eltype: 'input',
	state: {
		class: 'form_input'
	},
	attrs: {
		placeholder: 'login (optional)'
	},
	events: {
		input(){
			var val = only_login(this.value).substr(0,20);
			if(val != this.value) this.value = val;
		},
		keyup(){
			var val = only_login(login.el.value).substr(0,20);
			if(check_login.val == val)return;
			check_login();
		}
	}
}).insertIn('form');
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
}).insertIn('form');



///////////////////
var check_login = function(){
	var last_request,timer,checking,last_val;
	var period_for_wait = 1200;// ms
	function fn(){
		if(timer)clearTimeout(timer);
		var now = Date.now();
		if(checking || now - last_request < period_for_wait){
			login_info.change({text: 'checking...'});
			timer = setTimeout(fn,100);
			return;
		}
		var val = only_login(login.el.value).substr(0,20);
		if(val.length > 3){
			last_request = now;
			login_info.change({text: 'checking...'});
			checking = 1;
			f_semit('check_login',{
				login: val
			},function(v){
				checking = 0;
				if(v && v.free){
					// login is available for registration
					fn.val = last_val = val;
					login_info.change({text: '"' + val + '" is OK'});
				}else{
					login_info.change({text: 'login is busy'});
				}
			});
		}else{
			login_info.change({text: ''});
		}
	}
	fn.val = last_val;
	return fn;
}();

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
}).insertIn('form');
var password2 = f_dc_temp({
	eltype: 'input',
	state: {
		class: 'form_input'
	},
	attrs: {
		type: 'password',
		placeholder: 'again password'
	}
}).insertIn('form');

 var checkboxes_1 = f_dc_temp({
        state: {
                html: `<label style="color: #8b8c8c">Ваши роли:</label>
                        <input type="checkbox" id="people">Работа с людьми
                        <input type="checkbox" id="depos">Вкладчик<br>
                        <input type="checkbox" id="developer1">Разработчик
                        <input type="checkbox" id="developer2">Разработчик
                        `,
                class:'block'
            }, attrs: {
            	style: 'color: #bcbcbc;'
            }
        }).insertIn('form');

        var checkboxes_2 = f_dc_temp({
            state: {
                html: `<label style="color: #8b8c8c">Подписка на:</label>
                        <input type="checkbox" id="news">Новости
                        <input type="checkbox" id="paper">Отчеты<br>
                        <input type="checkbox" id="gides">Гайды
                        <input type="checkbox" id="vved">Введения`,
                class:'block'
            }, attrs: {
            	style: 'color: #bcbcbc;'
            }
        }).insertIn('form');

var button = f_dc_temp({
	eltype: 'input',
	attrs: {
		id:'submit',
		type: 'button',
		value: 'ЗАРЕГЕСТРИРОВАТЬСЯ',
	},
	events: {
		click(){
			var emval = email.el.value.trim();
			var nval = name.el.value.trim();
			var snval = surname.el.value.trim();
			var logval = login.el.value.trim();
			var pasval = password.el.value.trim();
			var pas2val = password2.el.value.trim();
			if(!f_email_valid(emval)){
				email.el.focus();
				notify.is('invalid email');
				return;
			}
			if(nval.length < 3){
				name.el.focus();
				notify.is('short name');
				return;
			}
			if(snval.length < 3){
				surname.el.focus();
				notify.is('short surname');
				return;
			}
			if(logval.length && logval.length < 4){
				login.el.focus();
				notify.is('short login');
				return;
			}
			if(pasval.length < 8){
				password.el.focus();
				notify.is('short password');
				return;
			}
			if(pas2val != pasval){
				password2.el.focus();
				notify.is('password mismatch');
				return;
			}
			login_info.remove();
			result.change({text:'sending...'});
			f_semit('signup',{
				name: nval,
				sname: snval,
				login: logval,
				pass: pasval,
				email: emval,
				ref_link: ref_link
			}, v => {
				var text;
				if(v && v.reason){
					text = 'Registration failed';
					text += JSON.stringify(v);
				}else{
					// head.change({
					// 	class: 'center',
					// 	html: `
					// 			<h1>Finish your registration</h1>`
					// });
					[email,name,surname, login,password, password2, checkboxes_1, checkboxes_2,
					button, form].forEach(e => {
						e.remove();
					})
					text = 'Success, check your inbox!';
					re.el.hide();
					popap_before.el.show();
					// setTimeout(function(){
					// 	location.href = '/';
					// },3000);
				}
				result.change({text: text});
			});
		}
	}
}).insertIn('form');


/*var iconsDesctop = f_dc_temp({
            state: {
                html: `<a href=""><img src="../images/facebook.png"></a>
                        <a href=""><img src="../images/twitter.png"></a>
                        <a href=""><img src="../images/google-plus.png"></a>
                        <a href=""><img src="../images/vk.png"></a>`,
                class:'icons'
            }
        }).insertIn('form');

        var iconsMobile = f_dc_temp({
            state: {
                html: `<a href=""><img src="../images/facebook24.png"></a>
                    <a href=""><img src="../images/twitter24.png"></a>
                    <a href=""><img src="../images/google-plus24.png"></a>
                    <a href=""><img src="../images/vk24.png"></a>`,
                class:'icons-mobile'
            }
        }).insertIn('form');*/
        var login_info = f_dc_temp({
        	state: {
        		class: 'login_info'
        	}
        }).insertIn('form');
[email,name,surname,login,password,password2].forEach(dc => {
	dc.extend({
		events: {
			keydown(e){
				if(e.keyCode == 13){
					button.onclick();
				}
			}
		}
	});
});
var result = f_dc_temp({state:{
	class: 'center'
}}).insertIn('.fo');
});

function f_email_valid(v){
	var re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
	var a=false;
	if(re.test(v)){
		a=true;
	}
	return a;
}



// socket part
socket = io({transports: ['websocket']});
notify.until('connecting...');
socket
.on('connect',() => {
	notify.until();
	connected=1;
})
.on('disconnect', (v) => {
	connected=0;
})
.on('error', (v) => {
	notify.until('socket error');
	// 
});

// end of socket

});
//////////////
}
// end of DC
});
