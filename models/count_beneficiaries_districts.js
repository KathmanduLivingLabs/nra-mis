'use strict';

module.exports = function(sequelize,DataTypes){

    var DistrictBeneficiaries = sequelize.define('district_beneficiaries',{

        district_code : {
            type : DataTypes.STRING,
            allowNull : false
        },


        count : {
            type : DataTypes.STRING,
            allowNull : false
        }




    });

    return DistrictBeneficiaries;


}