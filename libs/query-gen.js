var config = require('../config');

module.exports = {



	generate: function(queryOptions) {

		var codes = config.codes[queryOptions.column];
		var query = "SELECT ";
		for (var code in codes) {
			query = query + "COUNT ( CASE WHEN " + queryOptions.column + " ='" + codes[code] + "' THEN 1 END ) AS " + code;
			if (Object.keys(codes).indexOf(code) < Object.keys(codes).length - 1) {
				query = query + ",";
			}
		}
		query = query + " FROM  " + queryOptions.table;

		if(queryOptions.where){

			for (var filter in queryOptions.where){
				
				
			}

		}

		return query;

	}

}