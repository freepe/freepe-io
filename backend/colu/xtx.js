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
var db = shared.db;
///////////
api.xtx_btc_fpn = (obj, cbfail, cbok) => {
    if(!obj.socket)return cbfail("undefined user");
    if(obj.admin && !obj.socket.colu_admin)return cbfail('permission denied');
    var colu;
    if(obj.admin){
        colu = obj.socket.colu_admin;
    }else{
        if(!obj.socket.colu)return cbfail("undefined user");
        colu = obj.socket.colu;
    }
    // api.getMyBTCAddress(obj, cbfail, cbok);
    obj.network_key = shared.network_key;
    db.xtx_request(obj,cbfail,cbok);
}

api.xtx_buy_fpn = (obj, cbfail, cbok) => {
    if(!obj.socket)return cbfail("undefined user");
    if(obj.admin && !obj.socket.colu_admin)return cbfail('permission denied');
    var colu;
    if(obj.admin){
        colu = obj.socket.colu_admin;
    }else{
        if(!obj.socket.colu)return cbfail("undefined user");
        colu = obj.socket.colu;
    }
    obj.fpn_amount = btc2sat(obj.fpn_amount);// not fpn2n!
    if(!obj.fpn_amount)return cbfail('undefined fpn amount');
    api.getMyFPNAddress(obj, cbfail, myfpn => {
        api.getAdminBTCAddress(obj, cbfail, adminbtc => {
            var sat_needed = Math.round(shared.Asset.fpn.btc_value * obj.fpn_amount);
            if(!obj.fpn_amount)return cbfail('invalid fpn');
            if(!sat_needed || sat_needed < 10000)return cbfail('wrong btc amount needed');
            var params = {
                network_key: shared.network_key,
                a: myfpn,
                b: adminbtc,
                auser: obj.socket.uid,
                buser: 'system',
                fromc: 'btc',
                intoc: 'fpn',
                acv: sat_needed + 10000,
                bcv: obj.fpn_amount / 10,
            }
            db.xtx_request(params,cbfail,o => {
                cbok({
                    a: o.a,
                    c: o.c,
                    btc: o.acv,
                    fpn: o.bcv,
                })
            });
        });
    });
}




















///////////
}