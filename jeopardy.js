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
 * @param  {Object} requestBody - The `req.body.result` value from the Chatbot Fulfillment Request
 * @return {Promise}
 */
function checkAnswer(requestBody) {
	let userSaid = requestBody.resolvedQuery;
	let answer = requestBody.parameters.answer.toLowerCase();
	let correctAnswer = requestBody.parameters.correctAnswer.toLowerCase();
	if(userSaid.toLowerCase().indexOf('what') > -1 || userSaid.toLowerCase().indexOf('who') > -1) {
		if(answer.indexOf(correctAnswer) > -1 || correctAnswer.indexOf(answer) > -1) {
			return Promise.resolve({message: `Correct! You are clearly a genius.`, context:[]});
		} else {
			return Promise.resolve({message: `Incorrect! The correct answer is ${correctAnswer}. Ah, yes, what is ${correctAnswer}!`, context: []});
		}
	} else {
		return Promise.resolve({
			message: `You clearly have not played Jeopardy before. Your answer must be in the format of a question. Go on...give it another try.`,
			context: [{'name':'QUESTION', 'lifespan':1, 'parameters':{'correctAnswer':correctAnswer}}] 
		});
	}
}

/**
 * Generate the message that the chatbot will respond with
 * @param  {[type]} jeopardyResp - Response object from the JService API
 * @return {String}
 */
function generateJeopardyQuestionText(data) {
	let jeopardyData = JSON.parse(data)[0]; // only grab first question from array
	return {
		message: `The Category is ${jeopardyData.category.title}, for ${jeopardyData.value} points:  
					${jeopardyData.question}`,
		context: [{'name':'QUESTION', 'lifespan':1, 'parameters':{'correctAnswer':jeopardyData.answer}}]
	};
}

module.exports = {
	getRandomQuestion: getRandomQuestion,
	checkAnswer: checkAnswer,
};
