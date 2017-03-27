var dbInstance = require('../../../models');
var queryGen = require('../../../libs/query-gen');
var sanitize = require('google-caja').sanitize;
var formatVdc = require('../../../libs/format-vdc-code');

module.exports = {


	collect: function(req, res, next) {

		req.collects = {};

		var fields = ['district', 'vdc','assessmentId','type'];

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

		return next();


	},

	queries: function(req,res,next) {

		function assessmentPromiseGenerator(queryOption){

			var query = queryGen.houseDesign(queryOption,req.collects);


			return new Promise(function(resolve,reject){

				dbInstance.sequelize.query(query)
					.then(function(query) {
						resolve({
							response : query,
							title : queryOption.title
						});
					})
					.catch(function(err){
						reject(err);
					})


			})

			


		}

		if(!req.collects.type) req.collects.type = 'construction';

		if(req.collects.type==='construction'){
			var queryFor = [
				{
					status : '1',
					title : 'completed'
				},
				{
					status : '2',
					title : 'progress'
				},
				{
					status : '3',
					title : 'not started'
				}
			]

		}else if(req.collects.type==='installment') {
			var queryFor = [
				{
					status : '1',
					title : 'applied'
				},
				{
					status : '2',
					title : 'not applied'
				}
				
			]

		}
		

		var queryPromises = [];

		queryFor.forEach(function(query){

			queryPromises.push(assessmentPromiseGenerator(query));


		})

		return Promise.all(queryPromises)
			.then(function(allresponse){

				var stats = {};

				allresponse.forEach(function(eachresponse){
					
					if(!stats[eachresponse.title]){
						stats[eachresponse.title] = {};
					}

					for(var availableOption in eachresponse.response[0][0]){
						stats[eachresponse.title][availableOption] = eachresponse.response[0][0][availableOption];
					}

				})

				var amendedStatObj = {};
				for(var stat in stats){

					amendedStatObj[stat] = {
						stats : stats[stat],
						percentageStats : {}
					}
					var count = 0;
					
					Object.keys(stats[stat]).map(function(value){
						count = count + Number(stats[stat][value]);
					})

					for(var availableOption in stats[stat]){
						if(count===0){
							amendedStatObj[stat].percentageStats[availableOption] = 0;
						}else{
							var percentageValue = (stats[stat][availableOption]/count) * 100
							amendedStatObj[stat].percentageStats[availableOption] =   percentageValue > 0.5 ? Math.round(percentageValue) : Math.round(percentageValue * 100)/100;
						}
						
					}



				}

				// console.log('@!#!@#',amendedStatObj)

				return res.json({
					success : 1,
					assessmentStats : amendedStatObj
				})

			})
			.catch(function(err){
				if(err) winstonLogger.log('info',err);
				return res.json({
					success : 0,
					message : err
				})
			})


		
	}


}