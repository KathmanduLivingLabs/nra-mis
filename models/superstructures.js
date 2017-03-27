'use strict';

module.exports = function(sequelize,DataTypes){

    var Superstructures = sequelize.define('superstructures',{

        record_id : {
            type : DataTypes.INTEGER,
            allowNull : false
        },

        structure : {
            type : DataTypes.STRING,
            allowNull : true
        },

        specify : {
            type : DataTypes.STRING,
            allowNull : true
        }





    });

    return Superstructures;


}