var importFn = require('./import');


module.exports = (router) => {

	router.post('/api/v1/mis/import',importFn.import)


}


