module.exports = function(mctx,cbfail,cbok){
///////////
var api = mctx.api;
var db = mctx.db;
var Walletkeys = mctx.Walletkeys;
if(!Walletkeys){
    console.log('Walletkeys class not available');
    return cbfail('Wallets not available yet');
}
var wallet_encryption_seed = require('../../requires/wallet_encryption_seed');
if(!wallet_encryption_seed)return cbfail('encryption module not available');
api.getMyWalletSeed = function(obj,cbfail,cbok){
	var query, params;
	if(obj.uid && obj.pas){
		query = 'select encrypted,salt,iv,tag from Walletkeys where owner = :uid';
		params = {
			uid: obj.uid
		}
	}else{
		return cbfail('wrong user or password');
	}
	db.query(query,{
		params: params
	})
	.then(function(data){
        if(data.length == 1){
            var wallet = {
                enc: data[0].encrypted,
                salt: data[0].salt,
                iv: data[0].iv,
                tag: data[0].tag
            }
            var seed = wallet_encryption_seed.decrypt(wallet,obj.pas);
            seed?
            cbok(seed):
            cbfail("unable to decrypt your wallet");
        }else{
            cbfail(false);
        }
	});
}

api.getMyWalletEncryptedBackup = function(obj,cbfail,cbok){
	var query, params;
	if(obj.uid){
		query = 'select encrypted,salt,iv,tag from Walletkeys where owner = :uid';
		params = {
			uid: obj.uid
		}
	}else{
		return cbfail('wrong user or password');
	}
	db.query(query,{
		params: params
	})
	.then(function(data){
        if(data.length == 1){
            cbok({
                enc: data[0].encrypted,
                salt: data[0].salt,
                iv: data[0].iv,
                tag: data[0].tag
            });
        }else{
            cbfail(false);
        }
	});
}

api.setMyWalletSeed = function(obj,cbfail,cbok){
    if(!obj.uid){
        return cbfail('undefined user id');
    }
    if(!obj.seed){
        return cbfail('undefined wallet key');
    }
    if(!obj.pas){
        return cbfail('undefined wallet password');
    }
    if(obj.pas.length < 8)return cbfail('wrong password for wallet');
    var wallet = wallet_encryption_seed.encrypt(obj.seed,obj.pas);
    var params = {
        owner: obj.uid,
        encrypted: wallet.enc,
        salt: wallet.salt,
        iv: wallet.iv,
        tag: wallet.tag,
    };
    Walletkeys.create(params)
    .then(function(data){
        cbok();
    })
    .catch(function(err){
        console.log(err)
        cbfail("unable to create new wallet account");
    });
}
cbok();
///////////
}