var importFn = require('./import');
var recordsFn = require('./records');


module.exports = (router) => {

	router.post('/api/v1/mis/import', importFn.authorize, importFn.import);

	router.get('/api/v1/mis/region/records', recordsFn.collect , recordsFn.stats );

	router.get('/api/v1/mis/records', recordsFn.initialStats);


}