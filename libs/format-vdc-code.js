module.exports = {

	format : function format (code){

		code = code.slice(0,2) + code.slice(3);

		return code;


	},

	unformat : function unformat(code){

		code = code.slice(0,2) + "0" +  code.slice(2);

		return code;

		

	}


}