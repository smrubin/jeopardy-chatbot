const request = require('request-promise-native');

/**
 * Create A URL query to get data from the Wunderground API
 * @return {Promise} - The HTTP Query to the Jeopardy API service
 */
function getRandomQuestion() {
	let jservice_url = 'http://jservice.io/api/' + 'random';
	return request(jservice_url).then(jServiceResp => generateJeopardyQuestionText(jServiceResp));
}

/**
 * Returns a string to be consumed by the Weather API service representing the geographic location parsed from the charbot
 * @param  {Object} chatBotParams - The `req.body.result.parameters` value from the Chatbot Fulfillment Request
 * @return {String}
 */
function checkAnswer(requestBody) {
	let userSaid = requestBody.resolvedQuery;
	let answer = requestBody.parameters.answer;
	if(userSaid.toLowerCase().indexOf('what is') > -1 || userSaid.toLowerCase().indexOf('who is') > -1) {
		return Promise.resolve(`Your answer was ${answerParam}.`);
	} else {
		return Promise.resolve(`You clearly have not played Jeopardy before. Your answer must be in the format of a question.`);
	}
}

/**
 * Generate the message that the chatbot will respond with
 * @param  {[type]} jeopardyResp - Response object from the JService API
 * @return {String}
 */
function generateJeopardyQuestionText(data) {
	let jeopardyData = JSON.parse(data)[0]; // only grab first question from array
	return `The Category is ${jeopardyData.category.title}, for ${jeopardyData.value} points:  
					${jeopardyData.question}`
}

module.exports = {
	getRandomQuestion: getRandomQuestion,
	checkAnswer: checkAnswer,
	generateJeopardyQuestionText: generateJeopardyQuestionText
};
