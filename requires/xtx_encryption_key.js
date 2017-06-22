const crypto = require('crypto');
const secret = require('../config').xtx_secret_key;
const encoding = 'base64';

module.exports.encrypt = function (data) {
    if(!secret || secret.length < 8)return false;
    try{
        var result;
        const cipher = crypto.createCipher('aes192', secret);
        var result = cipher.update(data, 'utf8', encoding);
        return result += cipher.final(encoding);
    }catch(err){
        return false;
    }
}

module.exports.decrypt = function (data) {
    if(!secret || secret.length < 8)return false;
    try{
        var result;
        const decipher = crypto.createDecipher('aes192', secret);
        result = decipher.update(data, encoding, 'utf8');
        return result += decipher.final('utf8');
    }catch(err){
        return false;
    }
}