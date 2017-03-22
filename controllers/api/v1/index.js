var importFn = require('./import');
var recordsFn = require('./records');
var assessmentFn = require('./assesment');


module.exports = (router) => {

	router.post('/api/v1/mis/import', importFn.authorize, importFn.import);


	// router.post('/api/v1/mis/regular/import', importFn.authorize, importFn.regularImport,importFn.import);

	router.post('/api/v1/mis/beneficiaries/create', importFn.authorize, importFn.beneficiariesCreate);

	/**
	    * @api {get} /api/v1/mis/region/records  Records  
	    * @apiName Records
	    * @apiGroup Fetch
		*
		*
		* @apiParam {Varchar} district District code for the region
		* @apiParam {Varchar} vdc VDC code for the region

		* @apiSuccessExample {json} Parameters Format
		*						{
		*							"district":"30",
		*							"vdc" : "30013",
		*						}
		* @apiSuccess {Integer} success Success status
		* @apiSuccess {String} message Success message
	    * @apiSuccess {Object[]} stats Stats Object
	    * @apiSuccess {Object[]} percentageStats Percentage Stats Object
	    * @apiSuccessExample {json} Success-Response:
	    *
		*	    {
		*	      "success": 1,
		*	      "stats": {
		*	        "surveys": "21363",
		*	        "surveyors": "200",
		*	        "construction_completed": "3001",
		*	        "construction_in_progress": "3773",
		*	        "construction_not_started": "14589",
		*	        "grant_received": "20256",
		*	        "grant_not_received": "1107",
		*	        "applied_for_second_installment": "2159",
		*	        "not_applied_for_second_installment": "19204",
		*	        "regionalStats": {
		*	          "okhaldunga$12": "0",
		*	          "sindhuli$20": "0",
		*	          "ramechap$21": "0",
		*	          "dolakha$22": "4081",
		*	          "sindhupalchowk$23": "6255",
		*	          "kavre$24": "0",
		*	          "lalitpur$25": "0",
		*	          "bhaktapur$26": "0",
		*	          "kathmandu$27": "0",
		*	          "nuwakot$28": "3129",
		*	          "rasuwa$29": "0",
		*	          "dhading$30": "2998",
		*	          "makwanpur$31": "0",
		*	          "gorkha$36": "4900"
		*	        }
		*	      },
		*	      "percentageStats": {
		*	        "construction_completed": 14,
		*	        "construction_in_progress": 18,
		*	        "construction_not_started": 68,
		*	        "grant_received": 95,
		*	        "grant_not_received": 5,
		*	        "applied_for_second_installment": 10,
		*	        "not_applied_for_second_installment": 90
		*	      },
				 "message" : "Stats fetched successfully"
		*	    }
		*	
	    *
	    * @apiDescription API that fetch regional stats
	    * @apiVersion 1.0.0
	    */

	router.get('/api/v1/mis/region/records', recordsFn.collect, recordsFn.stats, recordsFn.getRegionnames, recordsFn.getNumericalInsights);

	// router.get('/api/v1/mis/region/records/try', recordsFn.collect, recordsFn.stats, recordsFn.getRegionnames, recordsFn.getNumericalInsights);


	router.post('/api/v1/mis/numericalstats/create', recordsFn.collect, recordsFn.createNumericalStats);

	router.post('/api/v1/mis/count/beneficiaries/create', recordsFn.collect, recordsFn.creteBeneficiariesCount);

	router.get('/api/v1/mis/records', recordsFn.initialStats);


	/**
	    * @api {get} /api/v1/mis/assessment/queries  Assessment  
	    * @apiName Assessment
	    * @apiGroup Fetch
		*
		*
		* @apiParam {Varchar} district District code for the region
		* @apiParam {Varchar} vdc VDC code for the region
		* @apiParam {Varchar} assessmentId Assessment query ID
		* @apiParam {Varchar} type Assessment type : Construction or Installment

		* @apiSuccessExample {json} Parameters Format
		*						{
		*							"district":"30",
		*							"vdc" : "30013",
		*							"assessmentId" : "1",
		*							"type" : "construction" or installment // defaults to construction
		*						}
		* @apiSuccess {Integer} success Success status
		* @apiSuccess {String} message Success message
	    * @apiSuccess {Object[]} stats Stats Object
	    * @apiSuccess {Object[]} percentageStats Percentage Stats Object
	    
	    * @apiDescription API that fetch regional stats
	    * @apiVersion 1.0.0
	    */


	router.get('/api/v1/mis/assessment/queries',assessmentFn.collect,assessmentFn.queries);


}