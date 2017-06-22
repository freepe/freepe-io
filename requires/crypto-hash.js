module.exports = function(pas){
	var crypto = require("crypto");
	return crypto.createHash("sha256").update(pas).digest("base64");
}