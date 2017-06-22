var db = require('../backend/database/db_api');
var fn_api = require('../backend/functions/');

module.exports = function(email, ref_link, fn){
	var ejs = require('ejs')
	  , fs = require('fs')
	  , appRoot = process.cwd()
	  , str = fs.readFileSync(appRoot+'/views/email_verification.ejs', 'utf8');
	db.findEmail({
		email: email
	},function(){
		// not found
		var key = generateRandomString(30);
		var html = ejs.render(str, {key:key,email:email});
	    var params = {
		    to: email,
		    subject: 'Confirm registration',
		    html: html
		};
		fn_api.sendOneEmail(params, error => {
	        console.log(error);
	        fn({reason:'User created. Though error while sending email'});
		}, () => {
	    	// save info to DB
	    	db.saveEmailSent({
	    		email: email,
	    		key: key,
	    		ref_link: ref_link,
	    	});
	        fn({0:1});
		});
	},function(){
		// found
		fn({reason: 'email was used recently'});
	})
}

function generateRandomString(length) {
    var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var len = chars.length;
    var str = '';
    for (var i = 0; i < length; i++) {
        str += chars[Math.floor(Math.random() * len)];
    }
    return str;
}