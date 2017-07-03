const request = require('request-promise-native');
const userApi = require('./api/user/user.controller');

/**
 * Create A URL query to get data from the Wunderground API
 * @return {Promise} - The HTTP Query to the Jeopardy API service
 */
function getRandomQuestion(requestBody) {
	let jservice_url = 'http://jservice.io/api/' + 'random';
	let user = requestBody.sessionId;
	userApi.getOrCreateUser(user);
	return request(jservice_url).then(jServiceResp => generateJeopardyQuestionText(requestBody.sessionId, jServiceResp));
}


/**
 * Checks a user's answer against the previous question's correct answer
 * @param  {Object} requestBody - The `req.body.result` value from the Chatbot Fulfillment Request
 * @return {Promise}
 */
function checkAnswer(requestBody) {
	let userSaid = requestBody.result.resolvedQuery;
	let answer = requestBody.result.parameters.answer.toLowerCase();
	let correctAnswer = requestBody.result.parameters.correctAnswer.toLowerCase();
	let user = requestBody.sessionId;
	
	if(userSaid.toLowerCase().indexOf('what') > -1 || userSaid.toLowerCase().indexOf('who') > -1) {
		if(answer.indexOf(correctAnswer) > -1 || correctAnswer.indexOf(answer) > -1) {
			return userApi.getUser(user).then(userInfo => {
				return {
					message: `${userInfo.username}, you are correct! You are clearly a genius. Your total score is now ${userInfo.score}`,
					context:[]
				};
			});
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
					'correctAnswer': correctAnswer
				}
			}] 
		});
	}
}


/**
 * Generate the message that the chatbot will respond with
 * @param  {[type]} jeopardyResp - Response object from the JService API
 * @return {String}
 */
function generateJeopardyQuestionText(user, data) {
	let jeopardyData = JSON.parse(data)[0]; // only grab first question from array
	return {
		message: `Alright ${user}!  The Category is ${jeopardyData.category.title}, for ${jeopardyData.value} points:  
		${jeopardyData.question}`,
		context: [{
			'name': 'QUESTION',
			'lifespan': 1,
			'parameters': {
				'correctAnswer': jeopardyData.answer,
				'data': jeopardyData
			}
		}]
	};
}

module.exports = {
	getRandomQuestion: getRandomQuestion,
	checkAnswer: checkAnswer,
};
