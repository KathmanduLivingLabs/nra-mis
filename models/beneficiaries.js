'use strict';

module.exports = function(sequelize,DataTypes){

    var Beneficiaries = sequelize.define('beneficiaries',{

        sn : {
            type : DataTypes.STRING,
            allowNull : true
        },

        name : {
            type : DataTypes.STRING,
            allowNull : true
        },

        district : {
            type : DataTypes.STRING,
            allowNull : true
        },

        district_code : {
            type : DataTypes.STRING,
            allowNull : true
        },

        vdc_mun : {
            type : DataTypes.STRING,
            allowNull : true
        },

        vdc_mun_code : {
            type : DataTypes.STRING,
            allowNull : true
        },

        ward : {
            type : DataTypes.STRING,
            allowNull : true
        },

        ea : {
            type : DataTypes.STRING,
            allowNull : true
        },

        owner_id : {
            type : DataTypes.STRING,
            allowNull : true
        },

        slip_no : {
            type : DataTypes.STRING,
            allowNull : true
        },

        hh_sn : {
            type : DataTypes.STRING,
            allowNull : true
        },

        ben_type : {
            type : DataTypes.STRING,
            allowNull : true
        },

        pa_no : {
            type : DataTypes.STRING,
            allowNull : true
        }



    

    });

    return Beneficiaries;


}