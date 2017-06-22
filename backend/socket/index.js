module.exports = function(server, listenServer){
//////////////
var root_folder = process.cwd();
var logr = require(root_folder + '/requires/logr');
var jwt    = require('jsonwebtoken');
var config = require(root_folder + '/config');
var fs = require('fs');
var db = require('../database/db_api');
var fn_api = require('../functions/');
require('../colu/');

db.all_api_ready = function(){
	logr('All DB_API ready');
	var eventer = require('../eventer/');
	eventer.on('app-start-websocket', () => {
		if(listenServer)listenServer();
		// it is important to require socket.io right here
		require('socket.io')(server)
		.on('connection', function (socket) {
		/////////////
		socket.on('auth', function (data, fn) {
			if(!fn || !data || !data.token)return;
			var token=data.token;
			var out={};
			jwt.verify(token, config.token_secret, function(err, decoded) {
				if (err) {
					fn({err:'invalid token'});
					return;
				} else {
					var uid = decoded.uid;
					if(!uid){
						fn({err:'invalid token'});
						return;
					}
					socket.uid = uid;
					db.findUser({
						uid: uid
					},function(reason){
						// failed
						fn({reason: reason});
					},function(data){
						// success
						// set listeners for authorized users
						require('./authorized')(socket);
						fn({
							0:1,
							name: data.username,
							id: uid,
							ref_link: data.ref_link,
							fpt: data.fpt
						});
						db.getAdminInfo({
							uid: uid
						},reason => {
							// this user have no administration rights
						},data => {
							// grant permissions
							socket.admin = true;
							require('./administration')(socket);
							socket.emit('push',{
								act: 'load_admin'
							});
						});
					});
				}
			});
		})
		.on('check_login', function(v,fn){
			if(v.login && fn){
				db.findUser({login:v.login},
				function(){
					// not found
					fn({free:1});
				},
				function(){
					// found
					fn();
				});
			}
		})
		.on('signin', function (v,fn) {
			if(!fn || !v || !v.email || !v.pass)return;
			var email=v.email;
			var hashpas=require(root_folder + '/requires/crypto-hash')(v.pass + config.server_salt);
			var params = {
				password: hashpas
			};
			if(f_email_valid(email)){
				params.email = email;
			}else{
				params.login = email;
			}
			db.signin(params,function(reason){
				// failed
				fn({reason: reason});
			},function(data){
				// success
				var uid = data.rid;
				if(!uid){
					fn({reason: 'data error'});
				}else{
					var token = jwt.sign({uid:uid}, config.token_secret, {expiresIn: '10d'});
					fn({token:token});
				}
			});
		})
		.on('signup', function (v,fn) {
			// insert new user to User class
			if(v && fn){
				var ref_link = v.ref_link;
				if(!ref_link || ref_link.length != 17){
					fn({reason: 'wrong referral'});
					return;
				}
				db.find_ref_link({
					ref_link: ref_link
				},function(){
					fn({reason:'invalid referral'});
				},function(affiliate){
					step1();
				});
				var email = v.email;
				function step1(){
					if(!v.pass){
						fn({reason: 'wrong password'});
						return;
					}
					if(v.login){
						var login = v.login.replace(/[^a-zа-яії_]/gi,'');
						if(login.length < 4){
							fn({reason: 'wrong login'});
							return;
						}else{
							db.findUser({
								login: login
							},function(){
								// login is not used yet
								step2();
							},function(){
								// login found in DB
								fn({reason: 'login is busy'});
								return;
							});
						}
					}else{
						step2();
					}
				}
				function step2(){
					v.pass = require(root_folder + '/requires/crypto-hash')(v.pass + config.server_salt);
					if(email && f_email_valid(email)){
						db.createUser(v,
						function(reason){
							fn({reason:reason});
						},
						function(data){
							require(root_folder + '/requires/send_email_for_verification')(email, ref_link, fn);
						});
					}else{
						fn({reason:'invalid email'});
					}
				}
			}
		})
		.on('get_langpack', function (lang, fn) {
			var data;
			try{
				data = require(root_folder + '/s_static/lang/' + lang);
			}catch(err){
				// no such file
				data = false;
			}
			fn(data);
		})
		.on('get_rawjs', function (arr, fn) {
			var name,version,data;
			if(typeof arr == 'string'){
				name = arr;
			}else{
				name = arr[0];
				version = arr[1];
			}
			try{
				var data = fs.readFileSync(root_folder + '/s_static/modules/' + name + '.js', 'utf8');
				if(version){
					var end = data.indexOf('+') - 2;
					if(end < 10 && (data[0] + data[1] == '//') && data.substr(2, end) == version)data = false;
				}
			}catch(err){
				// no such file
				data = false;
			}
			fn(data);
		})
		.on('get_rawcss', function (name, fn) {
			var data,folder = '';
			if(name.length > 3)for(var i = name.length - 2; i>0; i--){
				if(name[i]=='/'){
					folder = name.slice(0,i+1);
					name = name.slice(i+1);
					break;
				}
			}
			try{
				var data = fs.readFileSync(root_folder + '/s_static/modules/' + folder + 'css/' + name + '.css', 'utf8');
			}catch(err){
				// no such file
				data = false;
			}
			fn(data);
		})
		.on('error', err => {
			socket.emit('error happened');
			console.log(err);
		})
		.on('disconnect', function () {
			// logr('socket disconnected');
		});
		//////////////
		});// end of init_socket
		logr('WebSocket ready to use');
	});
	eventer.emit('app-eventer-ready');
}

//////////////
}

function f_email_valid(v){
	var re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
	var a=false;
	if(re.test(v)){
		a=true;
	}
	return a;
}
