var cluster = require('cluster'),
    stopSignals = [
      'SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
      'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
    ];

cluster.on('disconnect', function(worker) {
  cluster.fork();
});

cluster.on('message', (m) => {
  console.log('PARENT got message:', m);
  if(m == 'stop'){
    console.log('kill server without restart');
    process.exit(0);
  }else{
    console.log('restart server');
  }
});

if (cluster.isMaster) {
  const workerCount = 1;
  console.log(`Starting ${workerCount} workers...`);
  for (var i = 0; i < workerCount; i++) {
    cluster.fork();
  }
  stopSignals.forEach(function (signal) {
    process.on(signal, function () {
      console.log(`Got ${signal}, stopping workers...`);
      cluster.disconnect(function () {
        console.log('All workers stopped, exiting.');
        process.exit(0);
      });
    });
  });
} else {
  require('./index.js')();
}