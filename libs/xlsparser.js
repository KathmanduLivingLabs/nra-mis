
var xlsx = require('node-xlsx');

var XLSX = require('xlsx');

var appRootPath = require('app-root-path');

var obj = xlsx.parse(appRootPath+'/data/surveyorslist_dhading_2.xlsx'); 

// var jsonObj = JSON.parse(JSON.stringify(obj[0]['data'])) 
var dataObj = obj[0]['data'];

console.log(dataObj[2]);






// module.exports = {

// 	parse : function(){
		
// 		var obj = xlsx.parse(appRootPath+'/data/surveyorslist.xlsx'); 

// 		var jsonObj = JSON.parse(JSON.stringify(obj[0]['data'])) 

// 		console.log(jsonObj);

		
// 	}

// }