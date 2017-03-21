'use strict';

module.exports = function(sequelize,DataTypes){

    var VdcBeneficiaries = sequelize.define('vdc_beneficiaries',{

        vdc_code : {
            type : DataTypes.STRING,
            allowNull : false
        },

        district : {
            type : DataTypes.STRING,
            allowNull : false
        },

        count : {
            type : DataTypes.STRING,
            allowNull : false
        }




    });

    return VdcBeneficiaries;


}