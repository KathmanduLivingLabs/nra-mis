var dbInstance = require('../../../models');

var queryGen = require('../../../libs/query-gen');

var sanitize = require('google-caja').sanitize;
var formatVdc = require('../../../libs/format-vdc-code');

module.exports = {


	collect: function(req, res, next) {

		req.collects = {};

		var fields = ['district', 'vdc'];

		fields.forEach((field) => {

			if (typeof req.body[field] !== 'undefined' || typeof req.query[field] !== 'undefined') {
				req.collects[field] = sanitize(req.body[field] || req.query[field]);
			}

		});

		if(req.collects.district === "*"){
			delete req.collects.district;
		}

		if(req.collects.vdc){

			if(req.collects.vdc === "*"){
				delete req.collects.vdc;
			}else{
				req.collects.vdc = formatVdc.format(req.collects.vdc);
			}
		}
		
		// console.log('&&&&&&',req.collects)

		return next();


	},

	stats: function(req, res, next) {

		var regionOption = req.collects;

		var regionStats = {};

		var dbQuery = "\
			SELECT \
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



			var vdcStatsCount = 0;

			for(var vdcStat in vdcStats){
				vdcStatsCount = vdcStatsCount + Number(vdcStats[vdcStat]);
			}
			
			vdcStats.total = vdcStatsCount;

			req.regionStats = regionStats;

			req.vdcStats = vdcStats;



			


			var beneficiariesueryOptions = {

				table: 'beneficiaries'

			};

			if (!regionOption.district) {
				beneficiariesueryOptions.column = 'district';
				beneficiariesueryOptions.row_name = 'district_code';
				return dbInstance.sequelize.query(queryGen.generatorForbeneficiaries(beneficiariesueryOptions));

			} else {

				beneficiariesueryOptions.column = 'vdc';
				beneficiariesueryOptions.row_name = 'vdc_mun_code';
				return dbInstance.sequelize.query(queryGen.generatorForbeneficiariesVDC(beneficiariesueryOptions, regionOption));
			}



		})

		.then(function(responses) {

			if (responses && responses.length && responses[0].length) {
				var beneficiariesStats = responses[0][0];
			}

			

			

			var apiResponse = {
				success: 1,
				stats: req.regionStats,
				// percentageStats: req.percentageStats,
				message: "Stats fetched successfully"
			};

			if (beneficiariesStats) {
				apiResponse['beneficiariesStats'] = beneficiariesStats;

				var beneficiariesCount = 0;
				for(var beneficiary in beneficiariesStats){
					beneficiariesCount = beneficiariesCount + Number(beneficiariesStats[beneficiary]);
				}

				beneficiariesStats['total'] = beneficiariesCount;

				// console.log('HERAMMMM',beneficiariesCount)


				var beneficiaryReachPercentage = {};
				// console.log('$$$$$$$$$$',req.beneficiariesStats)
				for(var eachstat in beneficiariesStats){
					// console.log('%%%%%%%%%',eachstat,beneficiariesStats[eachstat])
					if(beneficiariesStats[eachstat] && Number(beneficiariesStats[eachstat])){
						// console.log('****',req.vdcStats[regionalStat],regionalStat,'!!!!!!',beneficiariesStats[regionalStat])
						beneficiaryReachPercentage[eachstat] = (Number(req.vdcStats[eachstat])/Number(beneficiariesStats[eachstat])) * 100;
						// console.log('!~~~~~~~~~~~~~`',beneficiaryReachPercentage[regionalStat])
						beneficiaryReachPercentage[eachstat] = beneficiaryReachPercentage[eachstat] > 0.5 ? Math.round(beneficiaryReachPercentage[eachstat]) : Math.round(beneficiaryReachPercentage[eachstat] * 100) / 100;
					}else{
						beneficiaryReachPercentage[eachstat] = 0;
					}
					
				}

				apiResponse['beneficiaryReachPercentage'] = beneficiaryReachPercentage;

			}

			var percentageStats = {};

			var calculatePercentageFor = ['construction_completed', 'construction_in_progress', 'construction_not_started', 'grant_received', 'grant_not_received', 'applied_for_second_installment', 'not_applied_for_second_installment'];

			calculatePercentageFor.forEach(function(eachstat) {

				if (regionStats[eachstat] && Number(regionStats['surveys'])) { 
					percentageStats[eachstat] = (regionStats[eachstat] / beneficiariesStats['total']) * 100;
					// percentageStats[eachstat] = (regionStats[eachstat] / regionStats['surveys']) * 100;
				
					percentageStats[eachstat] = percentageStats[eachstat] > 0.5 ? Math.round(percentageStats[eachstat]) : Math.round(percentageStats[eachstat] * 100) / 100;
				}else{
					percentageStats[eachstat] = 0;
				}

			});

			apiResponse.percentageStats = percentageStats;

			var finalApiResponse = {

				"success" : 1,
				"stats" : {
					"survey_status" : {
						"surveys" : apiResponse.stats.surveys,
						"surveyors" : apiResponse.stats.surveyors
					},
					"construction_status" : {
						"Completed": apiResponse.stats.construction_completed,
						"In Progress": apiResponse.stats.construction_in_progress,
						"Not Started": apiResponse.stats.construction_not_started

					},
					"grant_status" : {
						"Received": apiResponse.stats.grant_received,
						"Not Received": apiResponse.stats.grant_not_received

					},
					"installment_status" : {
						"Applied": apiResponse.stats.applied_for_second_installment,
						"Not Applied": apiResponse.stats.not_applied_for_second_installment

					}
				},
				"percentageStats": {
					"construction_status": {
						"Completed": apiResponse.percentageStats.construction_completed,
						"In Progress": apiResponse.percentageStats.construction_in_progress,
						"Not Started": apiResponse.percentageStats.construction_not_started
					},
					"grant_status": {
						"Received": apiResponse.percentageStats.grant_received,
						"Not Received": apiResponse.percentageStats.grant_not_received,
					},
					"installment_status": {
						"Applied": apiResponse.percentageStats.applied_for_second_installment,
						"Not Applied": apiResponse.percentageStats.not_applied_for_second_installment
					},
					"regionalStats": apiResponse.beneficiaryReachPercentage

				},
				"message": "Stats fetched successfully"



			}





			return res.json(finalApiResponse);

		})

		.catch(function(err) {
			return res.json({
				success: 0,
				error: 1,
				message: err
			})
		})

	},


	initialStats: function(req, res) {

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

	}

}