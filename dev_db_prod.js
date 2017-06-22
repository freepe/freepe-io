var ODB = require('orientjs'),
	config = require('./config');

config.enableProd();

var	configdb = config.orientdb,
	async = require('async'),
	edges = [
		'InvitedBy'
	],
	classes = [// as vertices
		'User',
		'UserStage',
		'Email',
		'EmailTrigger',
		'Subscription',
		'Administration',
		'UHistory',
		'Wallets',
		'Walletkeys',
		'Xtransaction',
	],
	models = {};

edges.forEach(name => {
	classes.push(name);
});

classes.forEach(name => {
	models[name] = require('./backend/database/model/' + name);
});

var cli_var = process.argv[2];

var mode_var = process.argv[3];

if(mode_var == 'prod'){
	config.enableProd();
}

var server = ODB(configdb);

var db = server.use(configdb.name);

var steps = [];
if(cli_var == 'del'){
	classes.forEach(name => {
		steps.push(cb => {
			drop(models[name],cb);
		});
	});
}else{
	classes.forEach(name => {
		steps.push(cb => {
			check(models[name],cb);
		});
		steps.push(create_schema);
	});
}

async.waterfall(steps, function(err, cb){
  if (err) console.error(err);
  close();              // close server
});

function drop(model,cb){
	var query;
	if(edges.indexOf(model.name) >= 0){
		query = 'delete edge ';
	}else{
		query = 'delete vertex ';
	}
	db.query(query + model.name)
		.then(function(){
		db.class.drop(model.name)
		.then(function(){
			console.log(model.name + ' deleted');
			cb();
		})
		.catch(function(err){
			cb('stop: '+err);
		});
	})
	.catch(function(err){
		cb('stop: '+err);
	});
}

function check(model,cb){
	db.class.get(model.name)
	.then(
		function(Class){
			console.log('class ' + model.name + ' exists');
			cb(null,{
				Class: Class,
				model: model
			});
		}
	)
	.catch(
		function(){
			create(model,cb);
		}
	)
}
function create(model,cb){
	var type;
	if(edges.indexOf(model.name) >= 0){
		type = 'E';
	}else{
		type = 'V';
	}
	db.class.create(model.name,type)
	.then(function(Class){
		cb(null,{
			Class: Class,
			model: model
		});
	})
	.catch(function(){
		cb("stop: can't create " + model.name);
	})
}
function create_schema(obj,cb){
	var Class = obj.Class;
	var model = obj.model;
	if(!model.schema.length){
		cb();
		return;
	}
	Class.property.create(model.schema)
	.then(function(){
		console.log(model.name + ' schema created');
		if(!model.indexes.length){
			cb();
			return;
		}
		db.index.create(model.indexes)
		.then(function(){
			console.log(model.name + ' indexes was created.');
			cb();
		})
		.catch(function(){
			cb("Cant create " + model.name + " indexes");
		});
	})
	.catch(function(err){
		console.log("can't create " + model.name + " schema..." + err);
		cb();
	});
}


function close(){
	server.close();
}

/* usage

// to create classes
node dev_db

// to delete classes
node dev_db del


*/