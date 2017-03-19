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


	generatorForbeneficiaries : function(queryOptions){

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

	generatorForbeneficiariesVDC : function(queryOptions,regionOption){

		if (regionOption.district && config.codes[queryOptions.column][regionOption.district]) {

			var codes = config.codes[queryOptions.column][regionOption.district].split(' ');
			var query = "SELECT ";

			codes.forEach(function(code, index) {


				query = query + "COUNT ( CASE WHEN " + queryOptions.row_name + " ='" + Number(code.slice(regionOption.district.length,code.length)).toString() + "' THEN 1 END ) AS vdc$" + formatVdc.unformat(code);
				if (index < (codes).length - 1) {
					query = query + ",";
				}
			})

			query = query + " FROM  " + queryOptions.table +" WHERE district_code='"+regionOption.district+"'" ;

			if (regionOption.vdc) {
				query = query + " AND vdc_mun_code='" + Number(regionOption.vdc.slice(regionOption.district.length,regionOption.vdc.length)).toString()  + "'";

			}

			return query;

		} else {
			return false;
		}



	}

}