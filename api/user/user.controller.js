'use strict';

var User = require('../../models').User;

// Return the full list of users
function getUsers() {
  User.findAll();
}

// Return a user by username
function getUser(username) {
  User.find({
    where: {
      username: username
    }
  });
}

// Return the top players and scores
function getTopScores() {
  //todo
}

module.exports = {
	getUsers: getUsers,
	getUser: getUser,
  getTopScores: getTopScores
};
