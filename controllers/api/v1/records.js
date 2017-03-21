var dbInstance = require('../../../models');

var queryGen = require('../../../libs/query-gen');

var sanitize = require('google-caja').sanitize;
var formatVdc = require('../../../libs/format-vdc-code');

module.exports = {


	collect: function(req, res, next) {

		req.collects = {};

		var fields = ['district', 'vdc', 'ns'];

		fields.forEach((field) => {

			if (typeof req.body[field] !== 'undefined' || typeof req.query[field] !== 'undefined') {
				req.collects[field] = sanitize(req.body[field] || req.query[field]);
			}

		});

		if (req.collects.district === "*") {
			delete req.collects.district;
		}

		if (req.collects.vdc) {

			if (req.collects.vdc === "*") {
				delete req.collects.vdc;
			} else {
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

			for (var vdcStat in vdcStats) {
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

				req.beneficiariesStats = beneficiariesStats;

				apiResponse['beneficiariesStats'] = beneficiariesStats;

				var beneficiariesCount = 0;
				for (var beneficiary in beneficiariesStats) {
					beneficiariesCount = beneficiariesCount + Number(beneficiariesStats[beneficiary]);
				}

				// beneficiariesStats['total'] = beneficiariesCount;
				req.beneficiariesCount = beneficiariesCount;

				// console.log('HERAMMMM',beneficiariesCount)


				var beneficiaryReachPercentage = {};
				// console.log('$$$$$$$$$$',req.beneficiariesStats)
				for (var eachstat in beneficiariesStats) {
					// console.log('%%%%%%%%%',eachstat,beneficiariesStats[eachstat])
					if (beneficiariesStats[eachstat] && Number(beneficiariesStats[eachstat])) {
						// console.log('****',req.vdcStats[regionalStat],regionalStat,'!!!!!!',beneficiariesStats[regionalStat])
						beneficiaryReachPercentage[eachstat] = (Number(req.vdcStats[eachstat]) / Number(beneficiariesStats[eachstat])) * 100;
						// console.log('!~~~~~~~~~~~~~`',beneficiaryReachPercentage[regionalStat])
						beneficiaryReachPercentage[eachstat] = beneficiaryReachPercentage[eachstat] > 0.5 ? Math.round(beneficiaryReachPercentage[eachstat]) : Math.round(beneficiaryReachPercentage[eachstat] * 100) / 100;
					} else {
						beneficiaryReachPercentage[eachstat] = 0;
					}

				}

				apiResponse['beneficiaryReachPercentage'] = beneficiaryReachPercentage;

			}

			var percentageStats = {};

			var calculatePercentageFor = ['construction_completed', 'construction_in_progress', 'construction_not_started', 'grant_received', 'grant_not_received', 'applied_for_second_installment', 'not_applied_for_second_installment'];

			calculatePercentageFor.forEach(function(eachstat) {

				if (regionStats[eachstat] && Number(regionStats['surveys'])) {
					percentageStats[eachstat] = (regionStats[eachstat] / regionStats['surveys']) * 100;
					// percentageStats[eachstat] = (regionStats[eachstat] / regionStats['surveys']) * 100;

					percentageStats[eachstat] = percentageStats[eachstat] > 0.5 ? Math.round(percentageStats[eachstat]) : Math.round(percentageStats[eachstat] * 100) / 100;
				} else {
					percentageStats[eachstat] = 0;
				}

			});

			apiResponse.percentageStats = percentageStats;

			var finalApiResponse = {

				"success": 1,
				"stats": {
					"survey_status": {
						"surveys": apiResponse.stats.surveys,
						"surveyors": apiResponse.stats.surveyors,
						"beneficiaries": req.beneficiariesCount
					},
					"construction_status": {
						"Completed": apiResponse.stats.construction_completed,
						"In Progress": apiResponse.stats.construction_in_progress,
						"Not Started": apiResponse.stats.construction_not_started

					},
					"grant_status": {
						"Received": apiResponse.stats.grant_received,
						"Not Received": apiResponse.stats.grant_not_received

					},
					"installment_status": {
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
				"numericalStats": {},
				"message": "Stats fetched successfully"



			}


			req.finalApiResponse = finalApiResponse;


			// return res.json(finalApiResponse);

			return next();



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

	},


	getRegionnames: function(req, res, next) {

		if (req.collects.ns) {



			if (!req.collects.district) {
				var query = 'select distinct(district),district_code from beneficiaries';
				var codeName = 'district_code';
				var columnName = 'district';
			} else {
				var query = "select distinct(vdc_mun),vdc_mun_code from beneficiaries where district_code='" + req.collects.district+"'";
				var codeName = 'vdc_mun_code';
				var columnName = 'vdc_mun';
			}

			dbInstance.sequelize.query(query)
				.then(function(response) {

					var regionNames = {};

					response[0].forEach(function(region) {
						regionNames[region[codeName]] = region[columnName];
					})

					console.log('@#!@#@!', regionNames)

					req.regionCodes = regionNames;



					// response[0][0]

					return next();

				})
				.catch(function(err) {
					return res.json({
						success: 0,
						message: err
					})
				})


		} else {
			return next();
		}

	},


	allregionStats: function(req, res, next) {


		if (req.collects.ns) {

			var regionOption = req.collects;

			function numericalStatPromiseGenerator(recordsqueryOptions, regionOption) {

				return new Promise(function(resolve, reject) {

					dbInstance.sequelize.query(queryGen.extrapolate(recordsqueryOptions, regionOption))
						.then(function(response) {
							resolve({
								obj: response,
								title: recordsqueryOptions.title
							});
						})
						.catch(function(err) {
							reject(err);
						})
				})



			}

			var calculateStatsFor = [{
					"join": {
						table: 'house_statuses',
						on: 'status',
						value: '1'
					},
					"title": {
						heading: "construction",
						subtitle: "completed"
					}
				}, {
					"join": {
						table: 'house_statuses',
						on: 'status',
						value: '2'
					},
					"title": {
						heading: "construction",
						subtitle: "inprogress"
					}
				}, {
					"join": {
						table: 'house_statuses',
						on: 'status',
						value: '3'
					},
					"title": {
						heading: "construction",
						subtitle: "not_started"
					}
				},

				{
					"join": {
						table: 'second_installments',
						on: 'applied_for_second_installment',
						value: '1'
					},
					"title": {
						heading: "second_installment",
						subtitle: "applied"
					}
				},

				{
					"join": {
						table: 'second_installments',
						on: 'applied_for_second_installment',
						value: '2'
					},
					"title": {
						heading: "second_installment",
						subtitle: "not_applied"
					}
				},

				{
					"join": {
						table: 'grant_receiveds',
						on: 'grant_received',
						value: '1'
					},
					"title": {
						heading: "grant",
						subtitle: "received"
					}
				},

				{
					"join": {
						table: 'grant_receiveds',
						on: 'grant_received',
						value: '2'
					},
					"title": {
						heading: "grant",
						subtitle: "not_received"
					}
				},



			];

			var numericalStatsPromises = [];

			calculateStatsFor.forEach(function(calculate) {
				numericalStatsPromises.push(numericalStatPromiseGenerator(calculate, regionOption));
			})

			return Promise.all(numericalStatsPromises)



			.then(function(allresponses) {

				var ns = {};

				allresponses.forEach(function(response) {

					for (var region in response.obj[0][0]) {
						if (!ns[region]) {
							ns[region] = {};
						}

						if (!ns[region][response.title.heading]) {
							ns[region][response.title.heading] = {};
						}

						ns[region][response.title.heading][response.title.subtitle] = response.obj[0][0][region];

					}

				})


				// console.log('@#!#!@#@!',ns);



				// allresponses.forEach(function(response) {

				// 	if (!ns[response.title.heading]) {
				// 		ns[response.title.heading] = {}
				// 	}

				// 	ns[response.title.heading][response.title.subtitle] = response.obj[0][0];


				// })

				if (req.collects.district) {
					for (var stat in ns) {
						var tempvalue = ns[stat];
						var statstring = 'vdc$' + formatVdc.unformat(stat.split('$')[1]);
						ns[statstring] = tempvalue;
						delete ns[stat];
					}
				}


				for (var stat in req.beneficiariesStats) {
					if (ns[stat]) {
						if (!ns[stat]['beneficiaries']) {
							ns[stat]['beneficiaries'] = {};
						}

						ns[stat]['beneficiaries']['total'] = req.beneficiariesStats[stat];
						ns[stat]['beneficiaries']['surveyed'] = req.vdcStats[stat];

					}
				}

				for (var region in ns) {

					var regionCode = region.split('$')[1].toString();
					if (req.collects.district) {
						regionCode = Number(regionCode.slice(req.collects.district.length, regionCode.length)).toString();
					}
					if (req.regionCodes[regionCode]) {
						var tempvalue = ns[region];
						delete ns[region];
						ns[req.regionCodes[regionCode] + '$' + region.split('$')[1]] = tempvalue;
					}

				}

				// ns.beneficiariesStats = req.beneficiariesStats;
				req.finalApiResponse.numericalStats = Object.assign(req.finalApiResponse.numericalStats, ns);


				return res.json(req.finalApiResponse);



			})

			.catch(function(err) {
				return res.json({
					success: 0,
					error: 1,
					message: err
				})
			})

		} else {



			return res.json(req.finalApiResponse);

		}

	},


	createNumericalStats: function(req, res, next) {

		var regionOption = req.collects;

		function numericalStatPromiseGenerator(recordsqueryOptions, regionOption) {

			return new Promise(function(resolve, reject) {

				dbInstance.sequelize.query(queryGen.extrapolate(recordsqueryOptions, regionOption))
					.then(function(response) {
						resolve({
							obj: response,
							title: recordsqueryOptions.title
						});
					})
					.catch(function(err) {
						reject(err);
					})
			})



		}

		var calculateStatsFor = [{
				"join": {
					table: 'house_statuses',
					on: 'status',
					value: '1'
				},
				"title": {
					heading: "construction",
					subtitle: "completed"
				}
			}, {
				"join": {
					table: 'house_statuses',
					on: 'status',
					value: '2'
				},
				"title": {
					heading: "construction",
					subtitle: "inprogress"
				}
			}, {
				"join": {
					table: 'house_statuses',
					on: 'status',
					value: '3'
				},
				"title": {
					heading: "construction",
					subtitle: "not_started"
				}
			},

			{
				"join": {
					table: 'second_installments',
					on: 'applied_for_second_installment',
					value: '1'
				},
				"title": {
					heading: "second_installment",
					subtitle: "applied"
				}
			},

			{
				"join": {
					table: 'second_installments',
					on: 'applied_for_second_installment',
					value: '2'
				},
				"title": {
					heading: "second_installment",
					subtitle: "not_applied"
				}
			},

			{
				"join": {
					table: 'grant_receiveds',
					on: 'grant_received',
					value: '1'
				},
				"title": {
					heading: "grant",
					subtitle: "received"
				}
			},

			{
				"join": {
					table: 'grant_receiveds',
					on: 'grant_received',
					value: '2'
				},
				"title": {
					heading: "grant",
					subtitle: "not_received"
				}
			},



		];

		var numericalStatsPromises = [];

		calculateStatsFor.forEach(function(calculate) {
			numericalStatsPromises.push(numericalStatPromiseGenerator(calculate, regionOption));
		})

		return Promise.all(numericalStatsPromises)



		.then(function(allresponses) {

			// console.log('ALLL$$$$',allresponses);


			// console.log('****************',allresponses[0]);

			// console.log('$$$$$$$$$$$',allresponses[0].obj);

			var operationLevel = !req.collects.district ? 'district' : 'vdc';

			function statPromiseGenerator(options) {

				var model = operationLevel === 'district' ? district_stats : vdc_stats;

				return new Promise(function(resolve, reject) {

					if (operationLevel === 'district') {
						var whereOptions = {
							district_code: options.district_code,
							heading: options.heading,
							subtitle: options.subtitle
						}

					} else {
						var whereOptions = {
							vdc_code: options.vdc_code,
							district: options.district,
							heading: options.heading,
							subtitle: options.subtitle
						}
					}



					model.findAll({
							where: whereOptions
						})
						.then(function(res) {
							if (res && res.length) {
								model.update({
									stat: options.stat
								}, {
									where: whereOptions
								}).
								then(function(updated) {
										resolve(updated)
									})
									.catch(function(err) {
										reject(err);
									})
							} else {
								model.create(options)
									.then(function(created) {
										resolve(created);
									})
									.catch(function(err) {
										reject(err);
									})
							}
						})
						.catch(function(err) {
							reject(err);
						})


				})


			}

			var statPromises = [];

			allresponses.forEach(function(response) {

				for (var region in response.obj[0][0]) {

					if (operationLevel === 'district') {
						var createOptions = {
							district_code: region,
							heading: response.title.heading,
							subtitle: response.title.subtitle,
							stat: response.obj[0][0][region]
						}
					} else {
						var createOptions = {
							vdc_code: region,
							district: req.collects.district,
							heading: response.title.heading,
							subtitle: response.title.subtitle,
							stat: response.obj[0][0][region]
						}
					}



					statPromises.push(statPromiseGenerator(createOptions));

				}

			})

			return Promise.all(statPromises);


		})

		.then(function(allstats) {
			return res.json({
				success: 1,
				message: 'numericalStats created successfully'
			})
		})

		.catch(function(err) {
			return res.json({
				success: 0,
				error: 1,
				message: err
			})
		})

	},


	getNumericalInsights: function(req, res, next) {

		if (req.collects.ns) {

			var operationLevel = !req.collects.district ? 'district' : 'vdc';

			var model = operationLevel === 'district' ? district_stats : vdc_stats;

			var whereOptions = operationLevel === 'vdc' ? {
				district: req.collects.district
			} : {}

			model.findAll({
					where: whereOptions
				})
				.then(function(districtStats) {

					var region = {};

					var onCode = operationLevel === 'district' ? 'district_code' : 'vdc_code'

					districtStats.forEach(function(districtStat) {
						if (!region[districtStat[onCode]]) {
							region[districtStat[onCode]] = {};
						}

						if (!region[districtStat[onCode]][districtStat.heading]) {
							region[districtStat[onCode]][districtStat.heading] = {}
						}

						region[districtStat[onCode]][districtStat.heading][districtStat.subtitle] = districtStat.stat

					})

					var ns = region;

					if (req.collects.district) {
						for (var stat in ns) {
							var tempvalue = ns[stat];
							var statstring = 'vdc$' + formatVdc.unformat(stat.split('$')[1]);
							ns[statstring] = tempvalue;
							delete ns[stat];
						}
					}


					for (var stat in req.beneficiariesStats) {
						if (ns[stat]) {
							if (!ns[stat]['beneficiaries']) {
								ns[stat]['beneficiaries'] = {};
							}

							ns[stat]['beneficiaries']['total'] = req.beneficiariesStats[stat];
							ns[stat]['beneficiaries']['surveyed'] = req.vdcStats[stat];

						}
					}


					for (var region in ns) {

						var regionCode = region.split('$')[1].toString();
						if (req.collects.district) {
							regionCode = Number(regionCode.slice(req.collects.district.length, regionCode.length)).toString();
						}
						if (req.regionCodes[regionCode]) {

							var tempvalue = ns[region];
							delete ns[region];
							ns[req.regionCodes[regionCode] + '$' + region.split('$')[1]] = tempvalue;
						}

					}

					req.finalApiResponse.numericalStats = Object.assign(req.finalApiResponse.numericalStats, ns);


					return res.json(req.finalApiResponse);


				})


		} else {

			return res.json(req.finalApiResponse);
		}



	}

}