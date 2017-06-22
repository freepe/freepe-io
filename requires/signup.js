var db = require('../backend/database/db_api');

module.exports = function(req,res) {
	var ref_link=req.params.ref_link;
    if(ref_link.length!=17){
		// res.redirect('/');
		fail(ref_link, res, 1);
    	return;
    }
	db.find_ref_link({
		ref_link: ref_link,
	},function(){
		// failed
		fail(ref_link, res);
	},function(){
		// found
		res.render('registration',{ref_link:ref_link});
	});
};

function fail(ref_link,res,err){
	if(err){
		if(!ref_link)ref_link = '';
		res.send('Refferal link <b>' + ref_link + '</b>  has wrong structure');
	}else{
		res.send('Refferal link <b>' + ref_link + '</b> not found or not active more');
	}
}