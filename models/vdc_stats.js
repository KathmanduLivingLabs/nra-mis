'use strict';

module.exports = function(sequelize,DataTypes){

    var VdcStats = sequelize.define('vdc_stats',{

        district : {
            type : DataTypes.STRING,
            allowNull : false
        },
        
        vdc_code : {
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

    return VdcStats;


}