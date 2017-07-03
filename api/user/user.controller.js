'use strict';

var User = require('../../models').User;

// Return the full list of users
function getUsers() {
  return User.findAll();
}

// Return a user by username
function getUser(username) {
  return User.find({
    where: {
      username: username
    }
  });
}

// Return the top players and scores
function getTopUsers(n = 5) {
  return User.findAll({
    order: 'score DESC',
    limit: n
  })
}


function getOrCreateUser(username) {
  return User.findOrCreate({
    where: {
      username: username
    },
    defaults: {
      score: 0
    }
  });
}

module.exports = {
	getUsers: getUsers,
	getUser: getUser,
  getTopUsers: getTopUsers,
  getOrCreateUser: getOrCreateUser
};
