'use strict';

module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define('User', {
    username: DataTypes.STRING,
    score: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  });

  return User;
};
