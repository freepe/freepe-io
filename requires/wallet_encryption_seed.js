const crypto = require('crypto');
const encoding = 'base64';
const algorithm = 'aes-256-gcm';

module.exports.encrypt = function (data,password) {
    try{
        var result,salt,
            iv = crypto.randomBytes(12);
        var paslen = password.length;
        if(paslen < 8)return false;
        if(paslen >= 32){
            if(paslen > 32)password = password.substr(0,32);
            salt = '';
        }else{
            var saltlen = 32 - paslen;
            salt = crypto.randomBytes(saltlen).toString(encoding);
            salt = salt.substr(0,saltlen);
        }
        const cipher = crypto.createCipheriv(algorithm, salt + password, iv);
        var result = cipher.update(data, 'utf8', encoding);
        result += cipher.final(encoding);
        var tag = cipher.getAuthTag();
        return {
            enc:result,
            salt:salt,
            iv:iv.toString(encoding),
            tag:tag.toString(encoding)
        }
    }catch(err){
        // console.log(err);
        return false;
    }
}

module.exports.decrypt = function (data,password) {
    try{
        var result;
        var key = data.salt + password;
        if(key.length > 32)key = key.substr(0,32);
        var iv = Buffer.from(data.iv,encoding);
        var tag = Buffer.from(data.tag,encoding);
        const decipher = crypto.createDecipheriv(algorithm, key, iv);
        decipher.setAuthTag(tag);
        result = decipher.update(data.enc, encoding, 'utf8');
        result += decipher.final('utf8');
        return result;
    }catch(err){
        // console.log(err);
        return false;
    }
}