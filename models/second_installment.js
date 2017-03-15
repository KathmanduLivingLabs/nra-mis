
'use strict';

module.exports = function(sequelize,DataTypes){

    var SecondInstallment = sequelize.define('second_installment',{

        record_id : {
            type : DataTypes.INTEGER,
            allowNull : false
        },

        applied_for_second_installment : {
            type : DataTypes.STRING,
            allowNull : false
        },

        how_long_since_applied : {
            type : DataTypes.STRING,
            allowNull : true
        },

        why_not_applied : {
            type : DataTypes.STRING,
            allowNull : true
        },

        specify_why_not_applied : {
            type : DataTypes.STRING,
            allowNull : true
        }



    });

    return SecondInstallment;


}