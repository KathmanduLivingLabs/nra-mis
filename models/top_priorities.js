'use strict';

module.exports = function(sequelize,DataTypes){

    var Priorities = sequelize.define('priorities',{

        record_id : {
            type : DataTypes.INTEGER,
            allowNull : false
        },

        priority : {
            type : DataTypes.STRING,
            allowNull : false
        }


    });

    return Priorities;


}