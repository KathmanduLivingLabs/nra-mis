var data = require('../../../data/data.json');


module.exports = {

	import: function(req, res, next) {

		// console.log('data',data[0]);

		var record = data[0];

		var recordsOptions = {
			hh_key: record["g1/g1_b/hh_key"],
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
			attachment_1: record._attachments && record._attachments.length ? _attachments[0].download_url : null,
			attachment_2: record._attachments && record._attachments.length ? _attachments[1].download_url : null,
			no_subsequent_amount: record["g3/g3_g/no_subsequent_amount"],
			masons_availability: record["g3/g3_g/mason_available"],
			describe_household: record["g2/describe_hh"],
			specify_household: record["g2/describe_other"],
			nra_catalogue_knowledge: record["g3/g3_g/eq_resistance_knowledge"],
			specify_nra_catalogue_knowledge: record["g3/g3_g/eq_resistance_knowledge_other"],
			primary_livelyhood: record["g4/livelihood_activites"],
			specify_primary_livelyhood: record["g4/livelihood_activites_other"]

		}

		records
			.create(recordsOptions)
			.then(function(response) {
				if (response && response.id) {

					var recordId = response.id;

					var houseStatusOptions = {
						record_id: recordId,
						status: record["g3/g3_a/house_status"],
						cost: record["g3/g3_b/cost_1"] || record["g3/g3_c/cost_2"] || record["g3/g3_d/cost_3"],
						house_design_followed: record["g3/g3_b/house_design_1"] || record["g3/g3_c/house_design_2"] || record["g3/g3_d/house_design_3"],
						specify_house_design_followed: record["g3/g3_b/house_design_other_1"] || record["g3/g3_c/house_design_other_2"] || record["g3/g3_d/house_design_other_3"],
						building_foundation: record["g3/g3_b/building_foundation_1"] || record["g3/g3_b/building_foundation_2"] || record["g3/g3_b/building_foundation_3"],
						specify_building_foundation: record["g3/g3_b/building_foundation_other_1"] || record["g3/g3_b/building_foundation_other_2"] || record["g3/g3_b/building_foundation_other_3"],
						roof_design: record["g3/g3_b/roof_design_1"] || record["g3/g3_c/roof_design_2"] || record["g3/g3_d/roof_design_3"],
						specify_roof_design: record["g3/g3_b/roof_design_other_1"] || record["g3/g3_c/roof_design_other_2"] || record["g3/g3_d/roof_design_other_3"],
						funding_source: record["g3/g3_b/funding_source_1"] || record["g3/g3_c/funding_source_2"] || record["g3/g3_c/funding_source_3"],
						specify_funding_source: record["g3/g3_b/funding_source_other_1"] || record["g3/g3_c/funding_source_other_2"] || record["g3/g3_c/funding_source_other_3"],
						building_code_followed: record["g3/g3_b/codes_followed_1"] || record["g3/g3_c/codes_followed_2"] || record["g3/g3_d/codes_followed_3"],
						code_not_followed: record["g3/g3_b/code_not_followed_1"] || record["g3/g3_c/code_not_followed_2"] || record["g3/g3_d/code_not_followed_3"],
						specify_why_not_followed: record["g3/g3_b/code_not_followed_other_1"] || record["g3/g3_c/code_not_followed_other_2"] || record["g3/g3_d/code_not_followed_other_3"]

					};



					house_status.create(houseStatusOptions)
						.then(function(housestatusresponse) {
							if (housestatusresponse && housestatusresponse.id) {

								var grantOptions = {
									record_id: recordId,
									grant_received: record["g3/g3_e/received_grant"],
									grant_spend_on: record["g3/g3_e/spent_grant"],
									specify_grant_spend_on: record["g3/g3_e/spent_grant_other"],
									reason_no_grant: record["g3/g3_e/reason_no_grant"],
									specify_reason_no_grant: record["g3/g3_e/reason_no_grant_other"]

								}

								grant_received.create(grantOptions)
									.then(function(grantsresponse) {
										if (grantsresponse && grantsresponse.id) {
											

											var installmentOptions = {
												record_id: recordId,
												applied_for_second_installment : record["g3/g3_f/applied_sec_installment"],
												how_long_since_applied : record["g3/g3_f/applied_how_long"],
												why_not_applied : record["g3/g3_f/not_applied"],
												specify_why_not_applied : record["g3/g3_f/not_applied_other"]
											}

											second_installment.create(installmentOptions)
												.then(function(installmentreponse){
													if(installmentreponse && installmentreponse.id){
														res.json({
															success: 1,
															message: "Record created successfully !"
														})
													}else{
														throw "Error creating installment"
													}
												})
												.catch(function(err){
													throw err;
												})



										} else {
											throw "Error creating grants"
										}
									})
									.catch(function(err) {
										throw err;
									})

							} else {
								throw "Error creating house status";
							}
						})
						.catch(function(err) {
							throw err;
						})



				} else {

					throw "Error creating record";

				}
			})
			.catch(function(err) {
				res.json({
					success: 0,
					error: 1,
					message: err
				})
			})

	}

}