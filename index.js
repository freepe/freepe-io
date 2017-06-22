var express     = require('express');
var app         = express();
var bodyParser  = require('body-parser');
var compress = require('compression');

app.use(compress());

var config = require('./config');

function init_app(production){
//////////////
if(production){
    config.enableProd();
    var https = require('https');
    var fs = require('fs');
    require('http').createServer((req,res) => {
        res.writeHead(302, {'Location': 'https://freepe.io' + req.url});
        res.end();
    }).listen(80,config.host);
    var server = https.createServer({
        ca: fs.readFileSync('/root/freepe_io.ca-bundle'),
        key: fs.readFileSync('/root/freepe_io.key'),
        cert: fs.readFileSync('/root/freepe_io.crt')
    },app);
}
else{
    config.islocal = true;
    var http = require('http');
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    var server = http.createServer(app);
    app.get('/minify', function(req,res) {
        try {
            require('./requires/minify')(req,res);
        } catch (ex) {
            // res.json(ex);
            res.json({err:'not found',e:ex});
        }
    });
    var counter = 0;
    app.get('/send-mail', function(req, res) {
        counter++;
        require('./backend/functions/').sendOneEmail({
            // to: 'pajapiv@polyfaust.com',
            subject: 'hello ' + counter,
            html: 'hello from mailgun) ' + counter
        }, err => {
            res.send(err);
        }, () => {
            res.send('sent');
        });
    });
}

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'/*,{ maxAge: 31536000000 }*/)); //cache for one year in ms

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/uapay', function(req, res) {
    res.render('uapay',{id:false});
});

app.get('/uapay/:id', function(req, res) {
    res.render('uapay',{id:req.params.id});
});

app.get('/ref/:ref_link', function(req, res) {
    try {
        require('./requires/signup')(req,res);
    } catch (err) {
        console.log(err)
        res.json({err:'not found'});
    }
});

app.get('/signup2/:email/:key', function(req, res) {
    try {
        require('./requires/verify_user_by_email')(req,res);
    } catch (err) {
        console.log(err)
        res.json({err:'not found'});
    }
});

app.post('/rt-login', function(req, res) {
    res.render('rt');
});

app.get('*', function(req, res) {
    // res.set("Expires", new Date(Date.now() + 31536000000).toUTCString());// plus 1 year
    res.render('index',{local:config.islocal});
});

// initialize socket.io
require('./backend/socket/index')(server, function(){
    server.listen(config.port,config.host,function(){
        console.log('Server running at http' + (config.prodmode?'':'s') + '://',config.host,':',config.port);
    });
    // launch timers
    require('./backend/timer/index')();
});

//////////////
}

module.exports = function(){
//////////////

console.log('start app in worker and production mode');

// restart server and show "OK" in browser
app.get('/npq3lFWERoff', function(req, res) {
    console.log('kill worker process');
    res.writeHead(200);
    res.end('OK');
    process.disconnect();
});
// restart server and redirect to home page
app.get('/09DXFRskdge5t', function(req, res) {
    console.log('kill worker process');
    res.writeHead(200);
    res.end('<script>setTimeout(function(){location.href = "/";},1500);</script>OK, redirecting...');
    process.disconnect();
});
// stop server at all
app.get('/ETREDFgGsd343', function(req, res) {
    console.log('stop server requested');
    res.writeHead(200);
    res.end('OK');
    process.send('stop');
    process.disconnect();
});

init_app(true);

//////////////
}
if(!module.parent)init_app();
