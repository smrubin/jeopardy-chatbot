const request = require('request-promise-native');
const AsciiTable = require('ascii-table');
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
	return request(jservice_url).then(jServiceResp => generateJeopardyQuestionText(user, jServiceResp));
}


/**
 * Generate the message that the chatbot will respond with
 * @param {String} user
 * @param  {[Object]} rawData - Response object array from the JService API
 * @return {Object} The formatted output to return to api.ai
 */
function generateJeopardyQuestionText(user, rawData) {
	let jeopardyData = JSON.parse(rawData)[0]; // only grab first question from array
	return {
		message: `Alright ${user}!  The Category is ${jeopardyData.category.title}, for ${jeopardyData.value} points:  
		${jeopardyData.question}`,
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
	
	if(userSaid.toLowerCase().indexOf('what') > -1 || userSaid.toLowerCase().indexOf('who') > -1) {
		let answer = reqResult.parameters.answer.toLowerCase();
		let correctAnswer = jeopardyData.answer;
		
		if(answer.indexOf(correctAnswer.toLowerCase()) > -1 || correctAnswer.toLowerCase().indexOf(answer) > -1) {
			let value = jeopardyData.value;
			return userApi.getUser(user)
				.then(userInfo => userApi.updateUser(user, userInfo.score + value))
				.then(userInfo => ({
					message: `${user}, you are correct! You are clearly a genius. Your total score is now ${userInfo.score}`,
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
 * Gets the top users by score (5) and pretty prints into a table
 * @return {Promise} Promise that resolves to the formatted output of a leaderboard table to return to api.ai
 */
function getTopUsers() {
	return userApi.getTopUsers().then(topUsers => {
		let table = new AsciiTable();
		table.setHeading('Rank', 'Username', 'Score');

		topUsers.forEach((user, index) => {
			table.addRow(index + 1, user.username, user.score);
		});

		return {
			message: table.toString()
		}
	});
}


function getMyScore(username) {
	return userApi.getUser(username).then(user => ({
		message: `Your score is ${user.score}. Well done!`
	}));
}

module.exports = {
	getRandomQuestion: getRandomQuestion,
	checkAnswer: checkAnswer,
	getTopUsers: getTopUsers,
	getMyScore: getMyScore
};
