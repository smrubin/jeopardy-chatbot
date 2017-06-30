'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');

var db = {};
// var sequelize = new Sequelize(config.mysql.database, config.mysql.user, config.mysql.password, config.mysql.options);

fs.readdirSync(__dirname + '/api')
  .filter(function(file) {
    return (fs.existsSync(path.join(__dirname, 'api', file, file + '.model.js')));
  })
  .forEach(function(file) {
    var model = sequelize.import(path.join(__dirname, 'api', file, file + '.model.js'));
    db[model.name] = model;
  });

Object.keys(db).forEach(function(modelName) {
  if(db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
