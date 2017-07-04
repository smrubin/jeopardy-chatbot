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
function getTopUsers() {
  return User.findAll({
    order: [['score', 'DESC']],
    limit: 5
  })
}


// Check if a certain user already exists in the database. If yes, return respective instance. If no, it will be created.
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


// Update a user's score by their username, returning the updated record.
function updateUser(username, score) {
  return User.update({
    score: score
  }, {
    where: {
      username: username
    },
    returning: true,
    plain: true
  })
  // The promise returns an array with one or two elements. The first element is always the number of affected rows, while the second element is the actual affected rows
  .then(result => result[1].dataValues);
}

module.exports = {
	getUsers: getUsers,
	getUser: getUser,
  getTopUsers: getTopUsers,
  getOrCreateUser: getOrCreateUser,
  updateUser: updateUser
};
