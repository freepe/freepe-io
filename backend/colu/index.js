var Colu = require('colu');
var db = require('../database/db_api');
var config = require('../../config');
var bitcoin = require('bitcoinjs-lib');
var api = {};

var Asset = {
    fpn: {
        btc_value: 0.0063,// 1 FPN = btc_value BTC
    }
}

console.log('islocal',config.islocal)

if(config.islocal){
    Asset.network = 'testnet';
    Asset.fpn.assetId = 'LaAZFMSvQnjLS9j6GyrRyit1MR95C9xbusbBVa';
    Asset.adminSeed = '64526f129648ee631ba47554ebe60ebb7886067a87486a8c7eb8447486346953';
}else{
    Asset.network = 'mainnet';
    Asset.apiKey = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0aWQiOiI1N2RlN2VjYTlmNTBlOTY4MTY1ZDc5OWQiLCJleHAiOjE0ODE5NzUyNDIwMzN9.lM2dmyNquCDiGjcjvbp1hfDJ9sjNvnb-J1RynTXNmUg';
    Asset.fpn.assetId = 'Ua4Gyceh1vvBMyiWeEYSfvXDq8cGW9JN9jXopG';
    Asset.mainnetSeed = '25ebc6dae1cb75369de3347270883c92e7090012c99036cc5761bd548d0cd419';
}

api.getPublicConfig = (obj, cbfail, cbok) => {
    cbok({
        network: Asset.network,
        fpn_btc_value: Asset.fpn.btc_value,
    })
}

api.init = function(socket,password,cbfail,cbok){
    if(!socket || !socket.uid || !password || password.length < 8)return cbfail("undefined user");
    db.getMyWalletSeed({
        uid: socket.uid,
        pas: password
    }, fail => {
        if(fail === false){
            db.findUser({
                uid: socket.uid
            }, fail => {
                cbfail('user not found');
            }, ok => {
                var hash = require('../../requires/crypto-hash')(password + config.server_salt);
                if(hash != ok.password)return cbfail('password mismatch with yours');
                var colu = new Colu({
                    apiKey: Asset.apiKey,
                    network: Asset.network,
                });
                colu.on('connect', function() {
                    var seed = colu.hdwallet.getPrivateSeed();
                    db.setMyWalletSeed({
                        uid: socket.uid,
                        seed: seed,
                        pas: password
                    }, fail => {
                        cbfail("unable to create your wallet account");
                    }, ok => {
                        socket.colu = colu;
                        db.logWalletDecryption({
                            uid: socket.uid,
                            addresses: colu.addresses.slice(0,2)
                        }, fail => {
                            cbfail('cannot register your wallet addresses');
                        }, ok => {
                            cbok(api);
                        });
                    });
                });
                colu.init();
            });
        }else{
            console.log(fail);
            cbfail('unable to decrypt your wallet');
        }
    }, seed => {
        var colu = new Colu({
            apiKey: Asset.apiKey,
            network: Asset.network,
            privateSeed: seed,
        });
        colu.on('connect', function() {
            // console.log('colu privateSeed',colu.hdwallet.getPrivateSeed());
            // console.log('addresses',colu.addresses.length);
            socket.colu = colu;
            db.logWalletDecryption({
                uid: socket.uid,
                addresses: colu.addresses.slice(0,2)
            }, fail => {
                cbfail('cannot register your wallet addresses');
            }, ok => {
                cbok(api);
            });
        });
        colu.init();
    });
}

setTimeout(function(){
    console.log('Loading admin colu...');
    if(Asset.network == 'testnet'){
        var seed = Asset.adminSeed;
    }else{
        var seed = Asset.mainnetSeed;
    }
    if(!seed)return console.log('Admin colu not initialized');
    var colu = new Colu({
        apiKey: Asset.apiKey,
        network: Asset.network,
        privateSeed: seed,
    });
    colu.on('connect', function() {
        // console.log('colu admin privateSeed',colu.hdwallet.getPrivateSeed());
        // console.log('addresses',colu.addresses.length);
        // if(seed === false)console.log(colu.hdwallet.getPrivateSeed());
        Asset.colu_admin = colu;
        console.log('Admin colu ready');
    });
    colu.init();
});

api.getAdminColu = (socket, cbfail, cbok) => {
    if(!socket || !socket.admin)return cbfail("access denied");
    if(!Asset.colu_admin)return cbfail('colu admin error');
    socket.colu_admin = Asset.colu_admin;
    cbok(api);
}

api.getAdminFPNAddress = (obj, cbfail, cbok) => {
    if(!Asset.colu_admin)return cbfail('colu admin error');
    var colu = Asset.colu_admin;
    cbok(colu.addresses[0]);
}

api.getAdminBTCAddress = (obj, cbfail, cbok) => {
    if(!Asset.colu_admin)return cbfail('colu admin error');
    var colu = Asset.colu_admin;
    cbok(colu.addresses[1]);
}

api.getAdminData = (obj, cbfail, cbok) => {
    if(!obj.socket || !obj.socket.colu_admin)return cbfail("permission denied");
    var colu = obj.socket.colu_admin;
    var params = {
        assetId: Asset.fpn.assetId,
    }
    if(obj && obj.addresses)params.addresses = obj.addresses;
    colu.coloredCoins.getAssetData(params,function (err, body) {
        if (err){
        	cbfail('error');
        	return console.error(err);
        }
        cbok(body);
    })
}

api.systemTransferFPN = (obj, cbfail, cbok) => {
    if(!Asset.colu_admin)return cbfail('colu admin error');
    if(!obj.toAddress)return cbfail('undefined receiver');
    if(!obj.amount)return cbfail('undefined amount');
    var colu = Asset.colu_admin;
	var args = {
        from: [colu.addresses[0]],
	    to: [{
            address: obj.toAddress,
            assetId: Asset.fpn.assetId,
            amount: obj.amount,
        }],
    }
	colu.sendAsset(args, function (err, body) {
	    if (err){
	    	cbfail('err, see console');
	    	return console.error(err);
	    }
	    var util = require('util');
	    cbok(util.inspect(body, {depth:1}));
	});
}

api.getMyBalance = (obj, cbfail, cbok) => {
    if(!obj.socket)return cbfail("undefined user");
    if(obj.admin && !obj.socket.colu_admin)return cbfail('permission denied');
    var colu;
    if(obj.admin){
        colu = obj.socket.colu_admin;
    }else{
        if(!obj.socket.colu)return cbfail("undefined user");
        colu = obj.socket.colu;
    }
    var params = {
        assetId: Asset.fpn.assetId,
    }
    params.addresses = colu.addresses[0];//.slice(0,5);
    colu.coloredCoins.getAssetData(params,function (err, body) {
        if (err){
            cbfail('error');
            console.log('error when getting balance')
            return console.error(err);
        }
        cbok(body);
    })
}

api.showAllWallets = (obj, cbfail, cbok) => {
    if(!obj.socket)return cbfail("undefined user");
    if(obj.admin && !obj.socket.colu_admin)return cbfail('permission denied');
    var colu;
    if(obj.admin){
        colu = obj.socket.colu_admin;
    }else{
        if(!obj.socket.colu)return cbfail("undefined user");
        colu = obj.socket.colu;
    }
    cbok(colu.addresses.slice(0,2));
    // cbok([colu.addresses[0]]);
    // colu.hdwallet.getAddressPrivateKey(colu.addresses[1],(e,d) => {console.log(d.getFormattedValue())});
}

api.get_encrypted_backup = (obj, cbfail, cbok) => {
    if(!obj.socket)return cbfail("undefined user");
    if(!obj.socket.colu)return cbfail("undefined user");
    db.getMyWalletEncryptedBackup({
        uid: obj.socket.uid
    }, fail => {
        cbfail(fail);
    }, ok => {
        cbok(ok);
    });
}

api.get_raw_backup = (obj, cbfail, cbok) => {
    if(!obj.socket)return cbfail("undefined user");
    if(!obj.socket.colu)return cbfail("undefined user");
    var colu = obj.socket.colu;
    cbok(colu.hdwallet.getPrivateSeed());
}

api.getMyFPNAddress = (obj, cbfail, cbok) => {
    if(!obj.socket)return cbfail("undefined user");
    if(obj.admin && !obj.socket.colu_admin)return cbfail('permission denied');
    var colu;
    if(obj.admin){
        colu = obj.socket.colu_admin;
    }else{
        if(!obj.socket.colu)return cbfail("undefined user");
        colu = obj.socket.colu;
    }
    cbok(colu.addresses[0]);
}

api.getMyBTCAddress = (obj, cbfail, cbok) => {
    if(!obj.socket)return cbfail("undefined user");
    if(obj.admin && !obj.socket.colu_admin)return cbfail('permission denied');
    var colu;
    if(obj.admin){
        colu = obj.socket.colu_admin;
    }else{
        if(!obj.socket.colu)return cbfail("undefined user");
        colu = obj.socket.colu;
    }
    cbok(colu.addresses[1]);
}

api.issueAsset = (obj, cbfail, cbok) => {
    if(!obj.socket)return cbfail("undefined user");
    if(!obj.admin)return cbfail('permission denied');
    if(obj.admin && !obj.socket.colu_admin)return cbfail('permission denied');
    var colu;
    if(obj.admin){
        colu = obj.socket.colu_admin;
    }else{
        return cbfail('later');
        // if(!obj.socket.colu)return cbfail("undefined user");
        // colu = obj.socket.colu;
    }
    var amount = 1000 * 100000000;
    var asset = {
        amount: amount,
        divisibility: 8,
        reissueable: false,
        transfer: [{
            amount: amount,
            address: colu.addresses[0]
        }]
    }
	colu.issueAsset(asset, function (err, body) {
        if (err){
        	cbfail(err);
        	return console.error(err)
        }
        console.log("Body: ", body);
        cbok(body);
    })
}

api.sendCoins = (obj, cbfail, cbok) => {
    if(!obj.socket)return cbfail("undefined user");
    if(obj.admin && !obj.socket.colu_admin)return cbfail('permission denied');
    var colu;
    if(obj.admin){
        colu = obj.socket.colu_admin;
    }else{
        if(!obj.socket.colu)return cbfail("undefined user");
        colu = obj.socket.colu;
    }
	if(obj.to && obj.from){
        var fromAddress = obj.from,
		toAddress = obj.to;
	}else{
        return cbfail("undefined addresses");
	}
    if(fromAddress == toAddress){
        return cbfail("you shall not pass!");
    }
	var amount = obj.amount || 1;
	var args = {
        from: [fromAddress],
	    to: [{
            address: toAddress,
            assetId: Asset.fpn.assetId,
            amount: amount,
        }],
    }
	colu.sendAsset(args, function (err, body) {
	    if (err){
	    	cbfail(err);
	    	return console.error(err);
	    }
	    var util = require('util');
	    cbok(util.inspect(body, {depth:1}));
	});
}

module.exports = api;
/////////////////////////////////
(function(){
var list = [
    'xtx',
    'bitcoin'
];

var shared = {
    db: db,
    config: config,
    Asset: Asset,
    network_key: Asset.network == 'testnet' ? bitcoin.networks.testnet : bitcoin.networks.bitcoin
}

list.forEach(name => {
	try{
		var obj = require('./' + name)(api,shared);
	}catch(err){
		console.log('Error for Colu API:',name,err);
	}
});

}());