module.exports = function(mctx,cbfail,cbok){
///////////
var api = mctx.api,
	config = require('../../config').mailing,
	transporter = require('nodemailer').createTransport({
		service: 'Mailgun',
		auth: {
			user: config.user,
			pass: config.pass
		}
	});
api.sendOneEmail = function(obj, cbfail, cbok){
  if(!obj.to || !obj.subject || !obj.html){
  	cbfail('wrong data provided to send an email');
  	return;
  }
  var message;
  message = {
    from: obj.from || config.from,
    to: obj.to, // comma separated list
    subject: obj.subject,
    html: obj.html
  };
  transporter.sendMail(message, function(error, info){
    if (error) {
      cbfail(error);
    } else {
      cbok();
    }
  });
}
cbok();
///////////
}