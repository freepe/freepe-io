var compressor = require('node-minify');
var t=Date.now();
var min_config = require('./minify_config');
var mn_components = min_config.mn_components;
// mn_components = min_config.domcom_min.concat(mn_components);
new compressor.minify({
	type: 'no-compress',
	fileIn: mn_components,
	fileOut: 'public/js/dev.js',
	callback: function(err, min){
		if(err){
			console.log(err);
			return;
		}
		t=Date.now()-t;
		console.log({finished:'yes',elapsed:t})
	}
});