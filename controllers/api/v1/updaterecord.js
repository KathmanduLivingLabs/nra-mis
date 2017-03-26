var config = require('../../../config');

var dbInstance = require('../../../models');

function allPromisesGenerator(on, columnname, option, concernedEntities, t) {

	var promises = [];

	function promiseGenerator(columnname, entity, option, addSpecify) {
		return new Promise((resolve, reject) => {


			var optionPromise = {
				record_id: option.recordId
			}
			optionPromise[columnname] = entity;
			if (option.specify && addSpecify) optionPromise['specify'] = option.specify;
			on.create(optionPromise, {
					transaction: t
				})
				.then(function(res) {
					resolve(res);
				})
				.catch(function(err) {
					reject(err);
				})

		});
	}

	concernedEntities.forEach(function(entity, index) {

		promises.push(promiseGenerator(columnname, entity, option, index === concernedEntities.length - 1 ? true : false));
	})

	return promises;

}

module.exports = {


	update : function(record,updateId){

		// console.log('hera!!',record)

		var attachment1 = record['g3/g3_b/g3_b1/building_photo_1_1'] || record['g3/g3_c/g3_c1/building_photo_2_1'] || record['g3/g3_d/g3_d1/building_photo_3_1'];
		var attachment2 = record['g3/g3_b/g3_b1/building_photo_1_2'] || record['g3/g3_c/g3_c1/building_photo_2_2'] || record['g3/g3_d/g3_d1/building_photo_3_2'];

		var recordsOptions = {
			hh_key: record["g1/g1_b/hh_key"],
			ona_record_id: record['_id'],
			submission_time: record['_submission_time'],
			district: record['g1/g1_a/district'],
			vdc: record['g1/g1_b/vdc'],
			ward: record['g1/g1_b/g1_b1/ward'],
			enumeration_area: record['g1/g1_b/g1_b1/enumeration_area'],
			household_sn: record['g1/g1_b/g1_b1/house_no'],
			owner_id: record['g1/g1_b/g1_b1/h_sn'],
			beneficiary_name: record['g1/g1_b/hown_name'],
			gps_location: {
				type: 'Point',
				coordinates: record['_geolocation']
			},
			slip_no: record['g2/g2_a/g2_a1/identity_slip_num'],
			distance_to_nearest_road: record['g4/access'],
			final_recommendations: record['g4/final_recommendation'],
			submitted_by: record['_submitted_by'],
			attachment_1: attachment1,
			attachment_2: attachment2,
			no_subsequent_amount: record["g3/g3_g/no_subsequent_amount"],
			masons_availability: record["g3/g3_g/mason_available"],
			describe_household: record["g2/describe_hh"],
			specify_household: record["g2/describe_other"],
			nra_catalogue_knowledge: record["g3/g3_g/eq_resistance_knowledge"],
			specify_nra_catalogue_knowledge: record["g3/g3_g/eq_resistance_knowledge_other"],
			primary_livelyhood: record["g4/livelihood_activites"],
			specify_primary_livelyhood: record["g4/livelihood_activites_other"]

		}
				console.log('******************')


		var recordId = updateId;

		return dbInstance.sequelize.transaction(function(t) {
				return records
					.update(recordsOptions, {
						where : {
							hh_key : recordsOptions.hh_key
						},
						transaction: t
					})
					.then(function(response) {
						if (response && response.length) {

							var houseStatusOptions = {
								status: record["g3/g3_a/house_status"],
								cost: record["g3/g3_b/cost_1"] || record["g3/g3_c/cost_2"] || record["g3/g3_d/cost_3"],
								house_design_followed: record["g3/g3_b/house_design_1"] || record["g3/g3_c/house_design_2"] || record["g3/g3_d/house_design_3"],
								specify_house_design_followed: record["g3/g3_b/house_design_other_1"] || record["g3/g3_c/house_design_other_2"] || record["g3/g3_d/house_design_other_3"],
								building_foundation: record["g3/g3_b/building_foundation_1"] || record["g3/g3_c/building_foundation_2"] || record["g3/g3_d/building_foundation_3"],
								specify_building_foundation: record["g3/g3_b/building_foundation_other_1"] || record["g3/g3_c/building_foundation_other_2"] || record["g3/g3_d/building_foundation_other_3"],
								roof_design: record["g3/g3_b/roof_design_1"] || record["g3/g3_c/roof_design_2"] || record["g3/g3_d/roof_design_3"],
								specify_roof_design: record["g3/g3_b/roof_design_other_1"] || record["g3/g3_c/roof_design_other_2"] || record["g3/g3_d/roof_design_other_3"],
								funding_source: record["g3/g3_b/funding_source_1"] || record["g3/g3_c/funding_source_2"] || record["g3/g3_d/funding_source_3"],
								specify_funding_source: record["g3/g3_b/funding_source_other_1"] || record["g3/g3_c/funding_source_other_2"] || record["g3/g3_d/funding_source_other_3"],
								building_code_followed: record["g3/g3_b/codes_followed_1"] || record["g3/g3_c/codes_followed_2"] || record["g3/g3_d/codes_followed_3"],
								code_not_followed: record["g3/g3_b/code_not_followed_1"] || record["g3/g3_c/code_not_followed_2"] || record["g3/g3_d/code_not_followed_3"],
								specify_why_not_followed: record["g3/g3_b/code_not_followed_other_1"] || record["g3/g3_c/code_not_followed_other_2"] || record["g3/g3_d/code_not_followed_other_3"]

							};

							return house_status.update(houseStatusOptions, {
								where : {
									record_id : recordId
								},
								transaction: t
							});


						} else {

							throw "Error creating record";

						}
					})
					.then(function(housestatusresponse) {

						if (housestatusresponse && housestatusresponse.length) {

							var grantOptions = {
								grant_received: record["g3/g3_e/received_grant"],
								grant_spend_on: record["g3/g3_e/spent_grant"],
								specify_grant_spend_on: record["g3/g3_e/spent_grant_other"],
								reason_no_grant: record["g3/g3_e/reason_no_grant"],
								specify_reason_no_grant: record["g3/g3_e/reason_no_grant_other"]

							}

							return grant_received.update(grantOptions, {
								where : {
									record_id : recordId
								},
								transaction: t
							});

						} else {
							throw "Error creating house status";
						}

					})
					.then(function(grantsresponse) {

						if (grantsresponse && grantsresponse.length) {

							var installmentOptions = {
								applied_for_second_installment: record["g3/g3_f/applied_sec_installment"],
								how_long_since_applied: record["g3/g3_f/applied_how_long"],
								why_not_applied: record["g3/g3_f/not_applied"],
								specify_why_not_applied: record["g3/g3_f/not_applied_other"]
							}

							return second_installment.update(installmentOptions, {
								where : {
									record_id : recordId
								},
								transaction: t
							});

						} else {
							throw "Error creating grants";
						}

					})

				.then(function(installmentreponse){

					return superstructures.destroy({
						where : {
							record_id : recordId
						},
						transaction: t
					})

				})

				.then(function(installmentreponse){

					return construction_not_started.destroy({
						where : {
							record_id : recordId
						},
						transaction: t
					})

				})

				.then(function(installmentreponse){

					return priorities.destroy({
						where : {
							record_id : recordId
						},
						transaction: t
					})

				})



				.then(function(installmentreponse) {
					console.log('installmentreponse',installmentreponse)
					if (installmentreponse) {

						var flag = record['g4/top_priorities'];

						if (flag) {

							var concernedPriorites = flag.split(' ');

							var priorityOption = {
								recordId: recordId
							}

							var generatedPromises = allPromisesGenerator(priorities, 'priority', priorityOption, concernedPriorites, t);

							return Promise.all(generatedPromises)

						} else {
							return true;
						}



					} else {
						throw "Error creating installment"
					}
				})

				.then(function(prioritiesresponse) {
					console.log('@#@#@#',prioritiesresponse)

					if (prioritiesresponse) {


						var flag = record["g3/g3_b/superstructure_1"] || record["g3/g3_c/superstructure_2"] || record["g3/g3_d/superstructure_3"];

						if (flag) {

							var concernedSuperstructures = flag.split(' ');

							var structureOption = {
								recordId: recordId,
								specify: record["g3/g3_b/superstructure_other_1"] || record["g3/g3_c/superstructure_other_2"] || record["g3/g3_d/superstructure_other_3"]
							}

							var generatedPromises = allPromisesGenerator(superstructures, 'structure', structureOption, concernedSuperstructures, t);

							return Promise.all(generatedPromises);

						} else {
							return true;
						}



					} else {
						throw "Error creating priorities"
					}
				})

				.then(function(structuresresponse) {
					if (structuresresponse) {

						if (record["g3/g3_d/construction_not_started"]) {

							var flag = record["g3/g3_d/construction_not_started"];

							if (flag) {

								var concerned = flag.split(' ');


								var option = {
									recordId: recordId,
									specify: record["g3/g3_d/construction_not_started_other"]
								}

								var generatedPromises = allPromisesGenerator(construction_not_started, 'construction_not_started', option, concerned, t);

								return Promise.all(generatedPromises);
							} else {

								return true;
							}



						} else {

							return true;

						}



					} else {
						throw "Error creating structures"
					}
				})


			})
			.then(function(result) {
				return result;
			})

		.catch(function(err) {
			throw err;
		})
	}

}