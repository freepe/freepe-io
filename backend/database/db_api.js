var ODB = require('orientjs'),
	configdb = require('../../config').orientdb,
	server = ODB(configdb),
	db = server.use(configdb.name),
	api = {
		db_reference: db
	},// container for all DB_API methods
	mctx = {// module context
		api: api,
		db: db
	},
	edges = [// list of OrientDB classes as Edges
		'InvitedBy'
	],
	classes = [// list of OrientDB classes as Vertices
		'User',
		'UserStage',
		'Email',
		'EmailTrigger',
		'Subscription',
		'Administration',
		'Wallets',
		'Walletkeys',
		'Xtransaction',
	],
	Eready = 0,// edges ready
	ready = 0;// vertices ready

edges.forEach(name => {
	db.class.get(name)
	.then(Class => {
		mctx[name] = Class;
		// console.log(name + ' class ready');
		Eready++;
		if(Eready != edges.length)return;
		loadVertices();
	})
	.catch(err => {
		console.log("Can't get class " + name + ' because err: ' + err);
	});
});

function loadVertices(){
	classes.forEach(name => {
		db.class.get(name)
		.then(Class => {
			mctx[name] = Class;
			// console.log(name + ' class ready');
			ready++;
			if(ready != classes.length)return;
			var api_ready = 0;
			classes.forEach(name => {
				require('./api_for_' + name)(mctx, err => {
					console.log("Can't load DB_API for " + name);
				}, ok => {
					// console.log('DB_API for ' + name + ' ready');
					api_ready++;
					if(api_ready != classes.length)return;
					// console.log('All DB_API ready');
					if(api.all_api_ready)api.all_api_ready();
				});
			});
		})
		.catch(err => {
			console.log("Can't get class " + name + ' because err: ' + err);
		});
	});
}

module.exports = api;