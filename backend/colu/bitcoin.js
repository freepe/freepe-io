var bitcoin = require('bitcoinjs-lib');
var request = require('request');
var fn_api = require('../functions/');
var ejs = require('ejs')
    , fs = require('fs')
    , appRoot = process.cwd()
    , html_for_affiliate = fs.readFileSync(appRoot+'/views/email_triggers/percent_from_referral.ejs', 'utf8');

function sat2btc(sat){
	sat = parseInt(sat);
	if(isNaN(sat))return false;
	var btc = sat/100000000;
	btc = btc.toFixed(8) * 1;
	return btc;
}
function btc2sat(btc){
	btc = parseFloat(btc);
	if(isNaN(btc))return false;
	btc = btc.toFixed(8);
	var sat = btc * 100000000;
	return sat;
}
function n2fpn(sat) {
    sat = parseInt(sat);
    if (isNaN(sat)) return false;
    var btc = sat / 10000000;
    btc = btc.toFixed(7) * 1;
    return btc;
}
function fpn2n(btc) {
    btc = parseFloat(btc);
    if (isNaN(btc)) return false;
    btc = btc.toFixed(7);
    var sat = btc * 10000000;
    return sat;
}

module.exports = function(api,shared){
///////////
var db = shared.db;
var network_host;
var config = require('../../config');
if(config.islocal){
	network_host = 'https://testnet.api.coinprism.com/v1/';
}else{
	network_host = 'https://api.coinprism.com/v1/';
}

api.btcTransfer = (obj, cbfail, cbok) => {
    var colu = shared.Asset.colu_admin;
    if(!colu)return cbfail("colu admin unavailable");
    if(!obj.key)return cbfail("undefined key for address");
    if(!obj.address)return cbfail('undefined address');
    if(!obj.receiver)return cbfail('undefined receiver address');
    if(!obj.btc)return cbfail('undefined btc amount');
    var fee = 10000;
    var amount = btc2sat(obj.btc);
    var affiliate, percent, affiliate_amount;
    if(amount < fee * 2)return cbfail('too small amount');
    if(obj.affiliate_address && obj.percent){
        if(!obj.affiliate_email)return cbfail('undefined affiliate email');
        affiliate = obj.affiliate_address;
        percent = obj.affiliate_percent;
        if(percent < config.minAffiliatePercent) {
            percent = config.minAffiliatePercent;
        } else if(percent > config.maxAffiliatePercent) {
            percent = config.maxAffiliatePercent;
        }
        affiliate_amount = Math.round(amount * percent);
        if(amount - affiliate_amount < fee * 2)return cbfail('too small amount');
    }
    var receivers;
    if(affiliate_amount) {
        receivers = [
            {
                address: obj.receiver,
                amount: amount - affiliate_amount - fee,
            },
            {
                address: affiliate,
                amount: affiliate_amount
            }
        ]
    } else {
        receivers = [
            {
                address: obj.receiver,
                amount: amount - fee,
            }
        ];
    }
    var params = {
        fees: fee,
        from: obj.address,
        to: receivers
    }
    request({
        method: 'POST',
        url: network_host + 'sendbitcoin?format=json',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
    }, function (error, response, body) {
        if(error){
            console.log(error);
            return cbfail('error');
        }
        if(response.statusCode != 200){
            console.log(response.statusCode,response.body);
            return cbfail('status not 200');
        }
        var o = JSON.parse(body);
        if(o.inputs){
            try{
                var tx = new bitcoin.TransactionBuilder(shared.Asset.network_key);
                var out = o.outputs;
                var inp = o.inputs;
                for(var i = 0; i < inp.length; i++){
                    tx.addInput(inp[i].output_hash, inp[i].output_index);
                }
                for(var i = 0; i < out.length; i++){
                    tx.addOutput(out[i].addresses[0], out[i].value);
                }
                tx.sign(0, obj.key);
                var signedTxHex = tx.build().toHex();
                // console.log(signedTxHex);
                request({
                    method: 'POST',
                    url: network_host + 'sendrawtransaction',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: '"'+signedTxHex+'"'
                }, function (error, response, body) {
                    if(error){
                        console.log(error);
                        return cbfail('error');
                    }
                    if(response.statusCode == 200){
                        cbok(body);
                        var data = {
                            txId: body
                        }
                        var html = ejs.render(html_for_affiliate, data);
                        fn_api.sendOneEmail({
                            to: obj.affiliate_email,
                            subject: 'You received some percents from referral',
                            html: html
                        }, error => {
                            console.log(error);
                        }, () => {
                            // save info to DB
                            db.saveEmailTrigger({
                                email: email,
                                type: 'percents_from_referral',
                                data: data,
                            });
                        });
                    }else{
                        cbfail('status not 200');
                    }
                });
            }catch(err){
                console.log('cannot',err);
                cbfail('error');
            }
        }else{
            cbfail('error format response');
        }
    });

}







///////////
}