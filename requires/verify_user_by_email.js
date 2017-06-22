var db = require('../backend/database/db_api');

module.exports = function(req,res) {
	var email=req.params.email;
	var key=req.params.key;
    if(key.length!=30||!email||email.length>80){
		res.redirect('/');
    	return;
    }
    email=decodeURIComponent(email);
	var re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
	var email_valid=false;
	if(re.test(email)){
		email_valid=true;
	}
	if(!email_valid){
		res.redirect('/');
    	return;
	}
	db.findEmail({
		email: email,
		key: key,
	},function(){
		// failed
		res.redirect('/');
	},function(){
		// found
		console.log('activating user')
		db.activateUser({
			email: email,
			key: key,
		}, fail => {
			res.send("can't activate user. " + fail);
		}, ok => {
		    res.writeHead(200);
		    res.end('<script>setTimeout(function(){location.href = "/";},2000);</script>User verified successfully, redirecting...');
		});
	});
};
