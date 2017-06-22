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
