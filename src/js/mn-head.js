DC.ready(function(){
'use strict';

DC.lang.set({
	'uk': {
		'DASHBOARD_ROUTE' : 'Дашборд',
		'ABOUT_ROUTE' : 'Про проект',
		'SOCKET_ROUTE' : 'Сокет',
		'PROFILE_ROUTE' : 'Профіль',
		'SIGN_IN_H': 'Увійдіть',
		'SIGN_UP_H': 'Зареєйструйтесь',
		'SIGN_IN': 'вход',
		'SIGN_UP': 'реєстрація',
		'SIGN_OUT': 'вихід',
		'WELCOME_BACK': 'З поверненням, ',
		'SETTINGS_H': 'Модуль налаштувань',
		'UPDATE': 'оновити',
		'SAVE': 'зберегти',
		'MANAGE_YOUR_SUBSCRIPION': 'Керуйте своїми підписками тут',
		'finance': 'финансы',
		'Enter a Password': 'Введите пароль' 

	}
})
.turn('uk');

DC.setPseudo([
	's_connection',// socket connected or disconnected
	'u_login',// user logged in or out from App
	'app_first_loaded',
]);

var bodytag = document.body;
var footer = DC.sel('footer',1);

var socket;
var connected = 0;
var App = {
	authorized: 0,
	init_route: 'welcome'
};
// App.tempdev = 1;
var User = {};// all stuff related to user like username, id etc.
User.getLevel = function(){
	var levels = [100,300,600,1000,1500,2100,2800,3600,4500,5500,6600,7800,9100,10500,12000,13600,15300,17100,19000,21000,23100,25300,27600,30000,32500,35100,37800,40600,43500,46500,49600,52800,56100,59500,63000,66600,70300,74100,78000,82000,86100,90300,94600,99000,103500,108100,112800,117600,122500,127500,132600,137800,143100,148500,154000,159600,165300,171100,177000,183000,189100,195300,201600,208000,214500,221100,227800,234600,241500,248500,255600,262800,270100,277500,285000,292600,300300,308100,316000,324000,332100,340300,348600,357000,365500,374100,382800,391600,400500,409500,418600,427800,437100,446500,456000,465600,475300,485100,495000,505000],
		levlen = levels.length;
	return () => {
		var v = User.fpt;
		if(typeof v != 'number')v = parseInt(v);
		if(v < 100 || isNaN(v))return 1;
		for(var i = 0; i < levlen; i++){
			if(levels[i] > v){
				return i + 1;
			}
		}
		if(v > 100)return 100;
		return v;
	}
}();
var Storage = window.localStorage;

var notGood = {};// object with temporary methods that should be changed soon because of their unefficient and unpropper manner
