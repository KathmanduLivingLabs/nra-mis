var dbInstance = require('../../../models');
var queryGen = require('../../../libs/query-gen');
var config = require('../../../config');

module.exports = {

	generate : function (regionOption) {

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



			// console.log('****************',allresponses[0]);

			// console.log('$$$$$$$$$$$',allresponses[0].obj);

			var operationLevel = !regionOption.district ? 'district' : 'vdc';

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
							district: regionOption.district,
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
	}
}