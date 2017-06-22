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