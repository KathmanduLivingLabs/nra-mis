module.exports = {

	format: function (code) {
		code = code.slice(0, 2) + code.slice(4);
		return code;
	},

	unformat: function (code) {
		code = code.slice(0, 2) + "00" + code.slice(2);
		return code;
	}


}