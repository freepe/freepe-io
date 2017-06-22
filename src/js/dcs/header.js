
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




