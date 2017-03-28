var dbInstance = require('../../../models');

module.exports = {


	dailySubmission:function(req,res,next){

		var query = "select count(*),date_trunc('day', submission_time) as dater from records group by dater";

		dbInstance.sequelize.query(query)
			.then(function(dailysubmission){
				console.log('@#@#',dailysubmission);

			})
			.catch(function(err){
				res.json({
					success : 0,
					message : err
				})
			})

	}
}