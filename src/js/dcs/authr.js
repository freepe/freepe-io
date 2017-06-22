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