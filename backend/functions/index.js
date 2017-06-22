var api = {
	// here is fn_api for lots of high-level functions
}

var mctx = {
		api: api
	},
	list = [
		'api_for_mailing'
	];

var total = list.length;
var ready = 0;

list.forEach(name => {
	try{
		require('./' + name)(mctx, fail =>{
			// 
		}, ok => {
			ready++;
			if(ready == total){
				console.log('Functions API ready');
			}
		});
	}catch(err){
		console.log(err);
	}
});

module.exports = api;