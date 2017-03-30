var config = require('../config');

module.exports = {


	auth: function(req, res, next) {

		var authorizationHeader = req.headers.authorization ? req.headers.authorization.split(' ')[1] : undefined;

		if (authorizationHeader && authorizationHeader === config.authorizationToken) {

			return next();
		} else {
			return res.json({
				success: 0,
				error: 1,
				message: 'No valid authorization token found !'
			})
		}


	}

}