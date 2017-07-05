const request = require('request-promise-native');
const AsciiTable = require('ascii-table');
const SanitizeHtml = require('sanitize-html');
const userApi = require('./api/user/user.controller');

/**
 * Get a random Jeopardy question from the jService API
 * Checks a user's answer against the previous question's correct answer. Update score in db if correct.
 * @param user
 * @param  {Object} reqResult - The `req.body.result` value from the Chatbot Fulfillment Request
 * @return {Promise} Promise that resolves to the formatted output to return to api.ai
 */
function getRandomQuestion(user, reqResult) {
	let jservice_url = 'http://jservice.io/api/' + 'random';
	userApi.getOrCreateUser(user);
	return request(jservice_url).then(jServiceResp => {
		// Random returns array of 1, so grab first item
		let jData = JSON.parse(jServiceResp)[0]; 
		// Retry if no question exists or it has been flagged as invalid
		if(!jData || jData.invalid_count) {
			return getRandomQuestion(user, reqResult);
		// If no value set, set it to 200
		} else if(!jData.value) {
			jData.value = 200;
		}
		return generateJeopardyQuestionText(user, jData);
	});
}


/**
 * Generate the message that the chatbot will respond with. Uses Mattermost formatting: ** = bold, * = italics
 * @param {String} user
 * @param  {[Object]} jeopardyData - Jeopardy question data from the JService API
 * @return {Object} The formatted output to return to api.ai
 */
function generateJeopardyQuestionText(user, jeopardyData) {
	return {
		message: `Alright ${user}!  The Category is **${jeopardyData.category.title}**, for **${jeopardyData.value}** points:  
		*${jeopardyData.question}*`,
		context: [{
			'name': 'QUESTION',
			'lifespan': 1,
			'parameters': {
				'data': jeopardyData
			}
		}]
	};
}


/**
 * Checks a user's answer against the previous question's correct answer. Update score in db if correct.
 * @param user
 * @param  {Object} reqResult - The `req.body.result` value from the Chatbot Fulfillment Request
 * @return {Promise} Promise that resolves to the formatted output to return to api.ai
 */
function checkAnswer(user, reqResult) {
	let userSaid = reqResult.resolvedQuery;
	let jeopardyData = reqResult.contexts[0].parameters['data'];
	
	if(isInQuestionForm(userSaid)) {
		let guess = reqResult.parameters.answer;
		let correctAnswer = SanitizeHtml(jeopardyData.answer, {
			allowedTags: []
		}).replace(/\s+(&nbsp;|&amp;|&)\s+/i, " and ")
			.replace(/[()]/g, '')
			.replace(/[^\w\s]/i, "");

		if(isGuessCorrect(guess, correctAnswer)) {
			let value = jeopardyData.value;
			return userApi.getUser(user)
				.then(userInfo => userApi.updateUser(user, userInfo.score + value))
				.then(userInfo => ({
					message: `${user}, you are correct! Your total score is now ${userInfo.score}.`,
					context:[]
				}));
		} else {
			return Promise.resolve({
				message: `Incorrect! The correct answer is ${correctAnswer}. Ah, yes, ${correctAnswer}!`,
				context: []
			});
		}
	} else {
		return Promise.resolve({
			message: `${user}, you clearly have not played Jeopardy before. Your answer must be in the format of a question. Go on...give it another try.`,
			context: [{
				'name': 'QUESTION',
				'lifespan': 1,
				'parameters': {
					'data': jeopardyData
				}
			}] 
		});
	}
}


/**
 * Checks if the user's guess matches the correct answer
 * @param guess
 * @param correctAnswer The correct answer
 * @return {Boolean} Whether or not the user's guess matches the correct answer
 */
function isGuessCorrect(guess, correctAnswer) {
	correctAnswer = correctAnswer.toLowerCase()
		.replace(/^(the|a|an) /i, "");

	guess = guess.toLowerCase()
		.replace(/\s+(&nbsp;|&amp;|&)\s+/i, " and ")
		.replace(/[^\w\s]/i, "")
		.replace(/^(what|whats|where|wheres|who|whos) /i, "")
		.replace(/^(is|are|was|were) /, "")
		.replace(/^(the|a|an) /i, "")
		.replace(/\?+$/, "");
	
	return guess.indexOf(correctAnswer) > -1 || correctAnswer.indexOf(guess) > -1;
}


/**
 * Checks if the user's answer is in the form of a question
 * @param userResp
 * @return {Boolean} Whether or not the user's response was in question form
 */
function isInQuestionForm(userResp) {
	return userResp.replace(/[^\w\s]/i, "").match(/(what|whats|where|wheres|who|whos) /i);
}


/**
 * Gets the top users by score (5) and pretty prints into a table
 * @return {Promise} Promise that resolves to the formatted output of a leaderboard table to return to api.ai
 */
function getTopUsers() {
	return userApi.getTopUsers().then(topUsers => {
		let table = new AsciiTable();
		table
			.setHeading('Rank', 'Username', 'Score')
			.setBorder("", "=", ".", "'")
			.removeBorder()
			.setAlign(2, AsciiTable.RIGHT);

		topUsers.forEach((user, index) => {
			table.addRow(index + 1, user.username, user.score);
		});

		let tableMsg = table.toString().replace(/ /g, '  ');

		return {
			message: tableMsg
		}
	})
	.catch(err => ({
		message: `There are no scores posted yet.`
	}));
}


/**
 * Gets the current score for a particular user
 * @param user
 * @return {Promise} Promise that resolves to the formatted output to return to api.ai
 */
function getMyScore(username) {
	return userApi.getUser(username)
	.then(user => ({
		message: `${username}, your score is ${user.score}. Well done!`
	}))
	.catch(err => ({
		message: `You haven't played before ${username}, so you have 0 points.`
	}));
}


/**
 * Handles a user answering for another user out of turn
 * @param username
 * @return {Promise} Promise that resolves to the formatted output to return to api.ai
 */
function handleOutOfTurnAnswer(username) {
	return Promise.resolve({
		message: `Sorry ${username}, I didn't ask you a new question, so you can't answer. But feel free to ask me for a question if you'd like to test your knowledge.`
	});
}


module.exports = {
	getRandomQuestion: getRandomQuestion,
	checkAnswer: checkAnswer,
	getTopUsers: getTopUsers,
	getMyScore: getMyScore,
	handleOutOfTurnAnswer: handleOutOfTurnAnswer
};
