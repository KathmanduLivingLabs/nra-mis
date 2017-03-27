var winston = require('winston');

var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)(),
        new (winston.transports.File)({ filename: './logs/'+ new Date() +'.log' })
    ]
  });


module.exports = logger;