var root_folder = process.cwd();

module.exports = function(){
//////////

var list_of_timers = [
	'xtx_checker',
	// 'user_stage',
];

list_of_timers.forEach(name => {
	try{
		var obj = require('./' + name);
		if(obj.f && obj.time >= 1000){
			setInterval(obj.f,obj.time);
		}else{
			console.log(name,'timer has invalid time interval');
		}
	}catch(err){
		console.log('Error for timer',name,err);
	}
});

//////////
}