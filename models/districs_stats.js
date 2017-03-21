'use strict';

module.exports = function(sequelize,DataTypes){

    var DistrictStats = sequelize.define('district_stats',{

        district_code : {
            type : DataTypes.STRING,
            allowNull : false
        },

        heading : {
            type : DataTypes.STRING,
            allowNull : true
        },

        subtitle : {
            type : DataTypes.STRING,
            allowNull : true
        },

        stat : {
            type : DataTypes.STRING,
            allowNull : false
        }




    });

    return DistrictStats;


}