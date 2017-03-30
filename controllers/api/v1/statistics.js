var dbInstance = require('../../../models');
var moment = require('moment');
module.exports = {


	dailySubmission: function(req, res, next) {

		var query = "select count(*),date_trunc('day', submission_time) as submissiondate from records group by submissiondate";

		dbInstance.sequelize.query(query)
			.then(function(dailysubmission) {
				if (dailysubmission && dailysubmission.length && dailysubmission[0].length) {

					dailysubmission[0].forEach(function(submission) {
						submission.submissiondate = moment(submission.submissiondate).format('YYYY-MM-DD');
					})

					return res.json({
						success: 1,
						dailysubmission: dailysubmission[0]
					})
				}

			})
			.catch(function(err) {
				res.json({
					success: 0,
					message: err
				})
			})

	},


	test: function(req, res, next) {

		var checkDuplicatesOn = 'hh_key';

		var query = `select id,${checkDuplicatesOn} from records where records.is_deleted=false AND ${checkDuplicatesOn} in ( select ${checkDuplicatesOn} from records group by ${checkDuplicatesOn} having count(${checkDuplicatesOn})>1)`;


		function removeDuplicatesPromiseGenerator(updateoptions) {

			return records.update({
				is_deleted: true
			}, {
				where: {
					id: updateoptions.id
				}
			})

		}

		dbInstance.sequelize.query(query)
			.then(function(duplicates) {


				var rows = duplicates[0];

				var tracker = [];

				var duplis = [];

				if (rows && rows.length) {


					rows.forEach(function(row) {

						if (tracker.indexOf(row[checkDuplicatesOn]) === -1) {


							tracker.push(row[checkDuplicatesOn]);
						} else {
							var dupli = row;
							duplis.push(dupli);
						}

					})

					var promises = [];

					duplis.forEach(function(dupli) {

						promises.push(removeDuplicatesPromiseGenerator(dupli));

					})


					Promise.all(promises)
						.then(function(resolvedrecords) {
							next();
						})
						.catch(function(err) {
							return res.json({
								success: 0,
								message: err
							})
						})


				} else {
					next();
				}



			})
			.catch(function(err) {
				return res.json({
					success: 0,
					message: err
				})
			})


	},

	info: function(req, res, next) {

		var query = "select count(*) as all,count(distinct(ona_record_id)) as distinct from records";
		dbInstance.sequelize.query(query)
			.then(function(reply) {
				return res.json({
					success: 1,
					info: reply[0][0]
				})
			})
			.catch(function(err) {
				return res.json({
					success: 0,
					message: err
				})
			})


	},


	missing: function(req, res, next) {

		var query = "select cast(ona_record_id as int) as ie from records order by ie asc";
		dbInstance.sequelize.query(query)
			.then(function(reply) {
				var values = reply[0];
				var missing = [];

				values.forEach(function(value, index) {
					if (values[index + 1]) {
						var num1 = Number(values[index + 1].ie);
						var num2 = Number(values[index].ie);
						if (Math.abs(num2 - num1) !== 1) {
							missing.push(value);
						}
					}
				})

				return res.json({
					success: 1,
					missing
				})
			})
			.catch(function(err) {
				return res.json({
					success: 0,
					message: err
				})
			})


	}
}