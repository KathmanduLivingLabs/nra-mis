module.exports = {

	format: function (code) {
		code = code.slice(0, 2) + code.slice(3);
		return code;
	},

	unformat: function (code) {
		code = code.slice(0, 2) + "0" + code.slice(2);
		return code;
	}


}