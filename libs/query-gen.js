var config = require('../config');
var formatVdc = require('../libs/format-vdc-code');

module.exports = {

	generate: function(queryOptions) {

		var codes = config.codes[queryOptions.column];
		var query = "SELECT ";
		for (var code in codes) {
			query = query + "COUNT ( CASE WHEN " + queryOptions.column + " ='" + codes[code] + "' THEN 1 END ) AS " + code + "$" + codes[code];
			if (Object.keys(codes).indexOf(code) < Object.keys(codes).length - 1) {
				query = query + ",";
			}
		}
		query = query + " FROM  " + queryOptions.table;

		if (queryOptions.where) {

			for (var filter in queryOptions.where) {

			}

		}

		return query;

	},

	extrapolate: function(queryOptions, regionOption) {

		if (!regionOption.district) {
			var codes = config.codes['district'];
		} else {
			var codes = config.codes['vdc'][regionOption.district].split(' ');
		}



		var query = "SELECT ";
		for (var code in codes) {
			var codeName = !regionOption.district ? code : 'vdc';
			var concernedRow = !regionOption.district ? 'district' : 'vdc';
			query = query + " COUNT ( CASE WHEN  " + queryOptions.join.table + "." + queryOptions.join.on + "= '" + queryOptions.join.value + "' AND records." + concernedRow + "='" + codes[code] + "' THEN 1 END) AS " + codeName + "$" + codes[code];

			if (Object.keys(codes).indexOf(code) < Object.keys(codes).length - 1) {
				query = query + " , ";
			}
		}

		query = query + " FROM  records " + " INNER JOIN " + queryOptions.join.table + " ON " + queryOptions.join.table + ".record_id=records.id ";

		return query;


	},

	generateForVdcs: function(queryOptions, regionOption) {


		if (regionOption.district && config.codes[queryOptions.column][regionOption.district]) {

			var codes = config.codes[queryOptions.column][regionOption.district].split(' ');
			var query = "SELECT ";

			codes.forEach(function(code, index) {
				query = query + "COUNT ( CASE WHEN " + queryOptions.column + " ='" + code + "' THEN 1 END ) AS vdc$" + formatVdc.unformat(code);
				if (index < (codes).length - 1) {
					query = query + ",";
				}
			})

			query = query + " FROM  " + queryOptions.table;

			if (regionOption.vdc) {
				query = query + " WHERE vdc='" + regionOption.vdc + "'";

			}

			return query;

		} else {
			return false;
		}


	},


	generatorForbeneficiaries: function(queryOptions) {

		var codes = config.codes[queryOptions.column];
		var query = "SELECT ";
		for (var code in codes) {

			query = query + "COUNT ( CASE WHEN " + queryOptions.row_name + " ='" + codes[code] + "' THEN 1 END ) AS " + code + "$" + codes[code];
			if (Object.keys(codes).indexOf(code) < Object.keys(codes).length - 1) {
				query = query + ",";
			}
		}
		query = query + " FROM  " + queryOptions.table;


		return query;


	},

	generatorForbeneficiariesVDC: function(queryOptions, regionOption) {

		if (regionOption.district && config.codes[queryOptions.column][regionOption.district]) {

			var codes = config.codes[queryOptions.column][regionOption.district].split(' ');
			var query = "SELECT ";

			codes.forEach(function(code, index) {


				query = query + "COUNT ( CASE WHEN " + queryOptions.row_name + " ='" + Number(code.slice(regionOption.district.length, code.length)).toString() + "' THEN 1 END ) AS vdc$" + formatVdc.unformat(code);
				if (index < (codes).length - 1) {
					query = query + ",";
				}
			})

			query = query + " FROM  " + queryOptions.table + " WHERE district_code='" + regionOption.district + "'";

			if (regionOption.vdc) {
				query = query + " AND vdc_mun_code='" + Number(regionOption.vdc.slice(regionOption.district.length, regionOption.vdc.length)).toString() + "'";

			}

			return query;

		} else {
			return false;
		}



	},

	houseDesign: function(queryOptions, regionOption) {

		if (regionOption.type === 'construction') {

			switch (regionOption.assessmentId) {

				case "1":

					var query = "SELECT count(CASE WHEN house_statuses.house_design_followed='1' THEN 1 END) as \"Prototype Design (NRA Catalog)\", count(CASE WHEN  house_statuses.house_design_followed='2' THEN 1 END) as \"Old traditional design (non engineered)\", count(CASE WHEN  house_statuses.house_design_followed='3' THEN 1 END) as \"Technical Support from Architect/Engineer (engineered)\", count(CASE WHEN  house_statuses.house_design_followed='4' THEN 1 END) as \"Building code norms followed without engineer\", 	count(CASE WHEN  house_statuses.house_design_followed='5' THEN 1 END) as \"Other\"  	FROM records INNER JOIN house_statuses ON records.id = house_statuses.record_id where house_statuses.status='" + queryOptions.status + "'";

					break;

				case "2":

					var query = "SELECT count(CASE WHEN house_statuses.building_foundation='1' THEN 1 END) as \"Brick mud mortar\", count(CASE WHEN  house_statuses.building_foundation='2' THEN 1 END) as \"Brick cement mortar\", count(CASE WHEN  house_statuses.building_foundation='3' THEN 1 END) as \"Stone mud mortar\", count(CASE WHEN  house_statuses.building_foundation='4' THEN 1 END) as \"Stone cement mortar\", 	count(CASE WHEN  house_statuses.building_foundation='5' THEN 1 END) as \"RC frame\", 	count(CASE WHEN  house_statuses.building_foundation='6' THEN 1 END) as \"Other\"  	FROM records INNER JOIN house_statuses ON records.id = house_statuses.record_id where house_statuses.status='" + queryOptions.status + "'";
					break;

				case "3":

					var query = "SELECT count(CASE WHEN superstructures.structure='1' THEN 1 END) as \"Adobe/Mud construction\", count(CASE WHEN  superstructures.structure='2' THEN 1 END) as \"Mortar-less stones (stacked stones)\", count(CASE WHEN  superstructures.structure='3' THEN 1 END) as \"Stone in mud mortar\",	count(CASE WHEN  superstructures.structure='4' THEN 1 END) as \"Stone in cement mortar\" ,	count(CASE WHEN  superstructures.structure='5' THEN 1 END) as \"Brick in mud mortar\" ,	count(CASE WHEN  superstructures.structure='6' THEN 1 END) as \"Brick in cement mortar\" ,	count(CASE WHEN  superstructures.structure='7' THEN 1 END) as \"Wood\" ,	count(CASE WHEN  superstructures.structure='8' THEN 1 END) as \"Bamboo\" ,	count(CASE WHEN  superstructures.structure='9' THEN 1 END) as \"RC frame\" ,	count(CASE WHEN  superstructures.structure='10' THEN 1 END) as \"Other\"  	FROM records INNER JOIN superstructures ON records.id = superstructures.record_id INNER JOIN house_statuses ON records.id=house_statuses.record_id where house_statuses.status='" + queryOptions.status + "'";
					break;


				case "4":

					var query = "SELECT count(CASE WHEN house_statuses.roof_design='1' THEN 1 END) as \"CGI sheet\", count(CASE WHEN  house_statuses.roof_design='2' THEN 1 END) as \"RCC roof\", count(CASE WHEN  house_statuses.roof_design='3' THEN 1 END) as \"Traditional roof/tile/slate\",	count(CASE WHEN  house_statuses.roof_design='4' THEN 1 END) as \"Other\"  	FROM records INNER JOIN house_statuses ON records.id = house_statuses.record_id where house_statuses.status='" + queryOptions.status + "'";
					break;


				case "5":

					var query = "SELECT count(CASE WHEN house_statuses.funding_source='1' THEN 1 END) as \"Self-funded\", count(CASE WHEN  house_statuses.funding_source='2' THEN 1 END) as \"In support of agencie(s)\", count(CASE WHEN  house_statuses.funding_source='3' THEN 1 END) as \"Loan\",	count(CASE WHEN  house_statuses.funding_source='4' THEN 1 END) as \"Other\"  	FROM records INNER JOIN house_statuses ON records.id = house_statuses.record_id where house_statuses.status='" + queryOptions.status + "'";
					break;

				case "6":

					var query = "SELECT count(CASE WHEN house_statuses.building_code_followed='1' THEN 1 END) as \"Yes\", count(CASE WHEN  house_statuses.building_code_followed='2' THEN 1 END) as \"No\"	FROM records INNER JOIN house_statuses ON records.id = house_statuses.record_id where house_statuses.status='" + queryOptions.status + "'";
					break;

				case "7":

					var query = "SELECT count(CASE WHEN house_statuses.code_not_followed='1' THEN 1 END) as \"Don’t know how to do it\", count(CASE WHEN  house_statuses.code_not_followed='2' THEN 1 END) as \"Too expensive\", count(CASE WHEN  house_statuses.code_not_followed='3' THEN 1 END) as \"Lack of trained masons\", count(CASE WHEN  house_statuses.code_not_followed='4' THEN 1 END) as \"Don’t care\", count(CASE WHEN  house_statuses.code_not_followed='5' THEN 1 END) as \"Other\"	FROM records INNER JOIN house_statuses ON records.id = house_statuses.record_id where house_statuses.status='" + queryOptions.status + "'";
					break;

				case "8":

					var query = "SELECT count(CASE WHEN construction_not_starteds.construction_not_started='1' THEN 1 END) as \"Displaced by earthquake\",count(CASE WHEN construction_not_starteds.construction_not_started='2' THEN 1 END) as \"Delay in receiving government grant\",count(CASE WHEN construction_not_starteds.construction_not_started='3' THEN 1 END) as \"Lack of technical knowledge\",count(CASE WHEN construction_not_starteds.construction_not_started='4' THEN 1 END) as \"Lack of construction materials\",count(CASE WHEN construction_not_starteds.construction_not_started='5' THEN 1 END) as \"Lack of human resource (eg: mason/carpenter/plumber)\",count(CASE WHEN construction_not_starteds.construction_not_started='6' THEN 1 END) as \"Land ownership problem\",count(CASE WHEN construction_not_starteds.construction_not_started='7' THEN 1 END) as \"Absence of  household member to oversee construction\",count(CASE WHEN construction_not_starteds.construction_not_started='8' THEN 1 END) as \"Other\"	FROM records  INNER JOIN construction_not_starteds ON construction_not_starteds.record_id = records.id  INNER JOIN house_statuses ON records.id = house_statuses.record_id where house_statuses.status='" + queryOptions.status + "'";
					break;



				default:


			}


		} else if (regionOption.type === 'installment') {

			switch (regionOption.assessmentId) {

				case "1":

					var query = "SELECT count(CASE WHEN second_installments.how_long_since_applied='1' THEN 1 END) as \"Less than a week\",count(CASE WHEN second_installments.how_long_since_applied='2' THEN 1 END) as \"Less than a month\",count(CASE WHEN second_installments.how_long_since_applied='3' THEN 1 END) as \"1 month to 3 months \",count(CASE WHEN second_installments.how_long_since_applied='4' THEN 1 END) as \"3 months to 6 months\",count(CASE WHEN second_installments.how_long_since_applied='5' THEN 1 END) as \"More than 6 months \" 	FROM records INNER JOIN second_installments ON records.id = second_installments.record_id where second_installments.applied_for_second_installment='" + queryOptions.status + "'";
					break;


				case "2":

					var query = "SELECT count(CASE WHEN second_installments.why_not_applied='1' THEN 1 END) as \"Building not in stage to apply for second installment\",count(CASE WHEN second_installments.why_not_applied='2' THEN 1 END) as \"Building doesn’t comply with building norms\",count(CASE WHEN second_installments.why_not_applied='3' THEN 1 END) as \"Don’t know how to apply\",count(CASE WHEN second_installments.why_not_applied='4' THEN 1 END) as \"Very difficult process\",count(CASE WHEN second_installments.why_not_applied='5' THEN 1 END) as \"Not  needed\" ,count(CASE WHEN second_installments.why_not_applied='6' THEN 1 END) as \"Others\"	FROM records INNER JOIN second_installments ON records.id = second_installments.record_id where second_installments.applied_for_second_installment='" + queryOptions.status + "'";
					break;


				default:


			}

		}



		if (regionOption.district) {
			query = query + " AND records.district='" + regionOption.district + "' ";

			if (regionOption.vdc) {
				query = query + " AND  records.vdc='" + regionOption.vdc + "'";
			}
		}

		// console.log('**********************&&^^',query)

		return query;
	}

}