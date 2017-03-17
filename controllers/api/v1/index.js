var importFn = require('./import');
var dbInstance = require('../../../models');

var queryGen = require('../../../libs/query-gen');

module.exports = (router) => {

	router.post('/api/v1/mis/import', importFn.authorize, importFn.import);

	router.get('/api/v1/mis/region/records', function(req, res) {

		var regionOption = {
			district: req.query.district,
			vdc: req.query.vdc
		}

		var regionStats = {};

		var dbQuery = "SELECT \
			count(records.*) as surveys, \
			count(DISTINCT(records.submitted_by))  as surveyors , \
			count(CASE WHEN house_statuses.status = '1' THEN 1 END) as construction_completed ,\
			count(CASE WHEN house_statuses.status = '2' THEN 1 END) as construction_in_progress, \
			count(CASE WHEN house_statuses.status = '3' THEN 1 END) as construction_not_started,  \
			count(CASE WHEN grant_receiveds.grant_received = '1' THEN 1 END) as grant_received,  \
			count(CASE WHEN grant_receiveds.grant_received = '2' THEN 1 END) as grant_not_received,  \
			count(CASE WHEN second_installments.applied_for_second_installment = '1' THEN 1 END) as applied_for_second_installment,  \
			count(CASE WHEN second_installments.applied_for_second_installment = '2' THEN 1 END) as not_applied_for_second_installment  \
			FROM records \
				INNER JOIN house_statuses ON records.id = house_statuses.record_id \
				INNER JOIN second_installments ON records.id = second_installments.record_id \
				INNER JOIN grant_receiveds ON records.id = grant_receiveds.record_id ";

		if (regionOption.district) {
			dbQuery = dbQuery + " WHERE records.district='" + regionOption.district + "' ";

			if (regionOption.vdc) {
				dbQuery = dbQuery + " AND  records.vdc='" + regionOption.vdc + "'";
			}
		}

		dbInstance.sequelize.query(dbQuery)
			.then(function(response) {

				if (response && response.length && response[0].length) {
					regionStats = Object.assign(regionStats, response[0][0])
				}

				if (regionOption.district) {

					var recordsqueryOptions = {
						column: 'vdc',
						table: 'records'
					}

					var queryToRun = queryGen.generateForVdcs(recordsqueryOptions, regionOption);

					if (queryToRun) {
						return dbInstance.sequelize.query(queryToRun);
					} else {
						return true;
					}



				} else {

					var recordsqueryOptions = {
						column: 'district',
						table: 'records'
					};

					return dbInstance.sequelize.query(queryGen.generate(recordsqueryOptions));

				}



			})

		.then(function(inforesponse) {

			if (inforesponse && inforesponse.length && inforesponse[0].length) {

				var vdcStats = inforesponse[0][0];

				regionStats = Object.assign(regionStats, {
					"regionalStats": vdcStats
				})

			}

			res.json({
				success: 1,
				stats: regionStats
			})



		})

		// return records.count({
		// 		where: regionOption,
		// 		include: [{
		// 			model: house_status
		// 		}, {
		// 			model: construction_not_started
		// 		}, {
		// 			model: grant_received
		// 		}, {
		// 			model: second_installment
		// 		}, {
		// 			model: superstructures
		// 		}, {
		// 			model: priorities
		// 		}]
		// 	})
		// 	.then(function(resp) {
		// 		console.log('RESULT', resp);
		// 	})


	});

	router.get('/api/v1/mis/records', function(req, res) {

		// second_installment.count({

		// 		where : {
		// 			applied_for_second_installment : '1'
		// 		}

		// 	})
		// 	.then(function(resp) {
		// 		res.json({
		// 			success: 1,
		// 			count: resp
		// 		})
		// 	})



		var stats = {};

		return records.count({


			})
			.then(function(resp) {

				stats.surveys = resp;

				var statusqueryOptions = {
					column: 'status',
					table: 'house_statuses'
				}

				return dbInstance.sequelize.query(queryGen.generate(statusqueryOptions));

			})


		.then(function(response) {

			if (response && response.length && response[0].length) {
				Object.assign(stats, response[0][0]);
			}

			var recordsqueryOptions = {
				column: 'district',
				table: 'records'
			}

			return dbInstance.sequelize.query(queryGen.generate(recordsqueryOptions));

		})

		.then(function(districtresponse) {

			if (districtresponse && districtresponse.length && districtresponse[0].length) {
				Object.assign(stats, districtresponse[0][0]);

			}

			return records.findAll({

				attributes: [
					[dbInstance.sequelize.literal('COUNT(DISTINCT(submitted_by))'), 'surveyorsCount']
				]

			})


		})

		.then(function(surveyorsresponse) {

			var percentage = {};

			for (var stat in stats) {

				percentage[stat] = (stats[stat] / stats['surveys']) * 100;

				percentage[stat] = percentage[stat] > 0.5 ? Math.round(percentage[stat]) : Math.round(percentage[stat] * 100) / 100;

			}

			return res.json({
				success: 1,
				surveystatistics: stats,
				surveyorsCount: surveyorsresponse[0].dataValues.surveyorsCount,
				percentage: percentage
			})

		})

		.catch(function(err) {
			return res.json({
				success: 0,
				message: err
			})
		})



		// records.count({
		// 		where : {
		// 			district : '23',
		// 			vdc : '2343'
		// 		}


		// 		// include: [{
		// 		// 	model: house_status,
		// 		// 	where: {
		// 		// 		status: "1"
		// 		// 	}
		// 		// }]

		// 	})
		// 	.then(function(resp) {
		// 		res.json({
		// 			success: 1,
		// 			count: resp
		// 		})
		// 	})

		// records.findAll({

		// 		attributes: [
		// 			[dbInstance.sequelize.literal('COUNT(DISTINCT(submitted_by))'), 'surveyors'],
		// 			[dbInstance.sequelize.literal('COUNT(DISTINCT(hh_key))'), 'beneficiaries']
		// 		],

		// 		// include: [{
		// 		// 	model: house_status,
		// 		// 	attributes: [
		// 		// 		[dbInstance.sequelize.literal('COUNT(DISTINCT(status))'), 'construction_completed']
		// 		// 	],
		// 		// 	where: {
		// 		// 		status: "1"
		// 		// 	}
		// 		// }]

		// 	})
		// 	.then(function(resp) {
		// 		res.json({
		// 			success: 1,
		// 			count: resp
		// 		})
		// 	})


		// records.findAll({

		// 		attributes : [
		// 			 	[dbInstance.sequelize.literal('COUNT(DISTINCT(submitted_by))'), 'surveyors'],
		// 			 	[dbInstance.sequelize.literal('COUNT(DISTINCT(hh_key))'), 'beneficiaries']
		// 		]

		// 	})
		// 	.then(function(resp) {
		// 		res.json({
		// 			success: 1,
		// 			count: resp
		// 		})
		// 	})


		// records.aggregate('hh_key', 'count', {
		// 		distinct: true,
		// 		// where : {
		// 		// 	district :  '23'
		// 		// }
		// 	})
		// 	.then(function(count) {
		// 		res.json({
		// 			success : 1,
		// 			count : count
		// 		})
		// 	});


		// records.count({
		// 		where: {
		// 			vdc: '2343'
		// 		}
		// 	})
		// 	.then(function(recordsresponse) {
		// 		res.json({
		// 			success: 1,
		// 			records: recordsresponse
		// 		})
		// 	})
		// 	.catch(function(err) {
		// 		console.log(err);
		// 	})


		// records.findAll({
		// 	limit :1,
		// 	include : [
		// 		{
		// 			model : house_status
		// 		},
		// 		{
		// 			model : construction_not_started
		// 		},
		// 		{
		// 			model : grant_received
		// 		},
		// 		{
		// 			model : second_installment
		// 		},
		// 		{
		// 			model : superstructures
		// 		},
		// 		{
		// 			model : priorities
		// 		}
		// 	]
		// })
		// 	.then(function(recordsresponse){
		// 		res.json({
		// 			success : 1,
		// 			records : recordsresponse
		// 		})
		// 	})
		// 	.catch(function(err){
		// 		console.log(err);
		// 	})

	})


}