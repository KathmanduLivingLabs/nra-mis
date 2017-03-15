'use strict';

module.exports = function(sequelize,DataTypes){

    var Housestatus = sequelize.define('house_status',{

        record_id : {
            type : DataTypes.INTEGER,
            allowNull : false
        },

        status : {
            type : DataTypes.STRING,
            allowNull : false
        },

        cost : {
            type : DataTypes.STRING,
            allowNull : false
        },

        house_design_followed : {
            type : DataTypes.STRING,
            allowNull : true
        },

        specify_house_design_followed : {
            type : DataTypes.STRING,
            allowNull : true
        },

        building_foundation : {
            type : DataTypes.STRING,
            allowNull : true
        },

        specify_building_foundation : {
            type : DataTypes.STRING,
            allowNull : true
        },

        roof_design : {
            type : DataTypes.STRING,
            allowNull : true
        },

        specify_roof_design : {
            type : DataTypes.STRING,
            allowNull : true
        },

        funding_source : {
            type : DataTypes.STRING,
            allowNull : true
        },

        specify_funding_source : {
            type : DataTypes.STRING,
            allowNull : true
        },

        building_code_followed : {
            type : DataTypes.STRING,
            allowNull : true
        },

        code_not_followed : {
            type : DataTypes.STRING,
            allowNull : true
        },

        specify_why_not_followed : {
            type : DataTypes.STRING,
            allowNull : true
        }





    });

    return Housestatus;


}