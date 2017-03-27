'use strict';

module.exports = function(sequelize,DataTypes){

    var ConstructionNotStarted = sequelize.define('construction_not_started',{

        record_id : {
            type : DataTypes.INTEGER,
            allowNull : false
        },

        construction_not_started : {
            type : DataTypes.STRING,
            allowNull : true
        },

        specify : {
            type : DataTypes.STRING,
            allowNull : true
        }


    });

    return ConstructionNotStarted;


}