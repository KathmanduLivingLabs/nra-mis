'use strict';

module.exports = function(sequelize,DataTypes){

    var GrantReceived = sequelize.define('grant_received',{

        record_id : {
            type : DataTypes.INTEGER,
            allowNull : false
        },

        grant_received : {
            type : DataTypes.STRING,
            allowNull : false
        },

        grant_spend_on : {
            type : DataTypes.STRING,
            allowNull : true
        },

        specify_grant_spend_on : {
            type : DataTypes.STRING,
            allowNull : true
        },

        reason_no_grant : {
            type : DataTypes.STRING,
            allowNull : true
        },

        specify_reason_no_grant : {
            type : DataTypes.STRING,
            allowNull : true
        }





    });

    return GrantReceived;


}