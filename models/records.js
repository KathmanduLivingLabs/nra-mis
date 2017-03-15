'use strict';

module.exports = function(sequelize,DataTypes){

    var Records = sequelize.define('records',{

        hh_key : {
            type : DataTypes.STRING,
            allowNull : true
        },

        district : {
            type : DataTypes.STRING,
            allowNull : true
        },

        vdc : {
            type : DataTypes.STRING,
            allowNull : true
        },

        ward : {
            type : DataTypes.STRING,
            allowNull : true
        },

        enumeration_area : {
            type : DataTypes.STRING,
            allowNull : true
        },

        household_sn : {
            type : DataTypes.STRING,
            allowNull : true
        },

        owner_id : {
            type : DataTypes.STRING,
            allowNull : true
        },

        beneficiary_name : {
            type : DataTypes.STRING,
            allowNull : true
        },

        gps_location : {
            type : DataTypes.GEOMETRY,
            allowNull : true
        },

        slip_no : {
            type : DataTypes.STRING,
            allowNull : true
        },

        distance_to_nearest_road : {
            type : DataTypes.STRING,
            allowNull : true
        },

        final_recommendations : {
            type : DataTypes.STRING,
            allowNull : true
        },

        submitted_by : {
            type : DataTypes.STRING,
            allowNull : true
        },

        attachment_1 : {
            type : DataTypes.STRING,
            allowNull : true
        },

        attachment_2 : {
            type : DataTypes.STRING,
            allowNull : true
        },

        no_subsequent_amount : {
            type : DataTypes.STRING,
            allowNull : true
        },

        masons_availability : {
            type : DataTypes.STRING,
            allowNull : true
        },

        describe_household : {
            type : DataTypes.STRING,
            allowNull : true
        },

        specify_household : {
            type : DataTypes.STRING,
            allowNull : true
        },

        nra_catalogue_knowledge : {
            type : DataTypes.STRING,
            allowNull : true
        },

        specify_nra_catalogue_knowledge : {
            type : DataTypes.STRING,
            allowNull : true
        },

        primary_livelyhood : {
            type : DataTypes.STRING,
            allowNull : true
        },

        specify_primary_livelyhood : {
            type : DataTypes.STRING,
            allowNull : true
        }



    });

    return Records;


}