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
