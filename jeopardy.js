const request = require('request-promise-native');

/**
 * Create A URL query to get data from the Wunderground API
 * @return {Promise} - The HTTP Query to the Jeopardy API service
 */
function getRandomQuestion() {
	let jservice_url = 'http://jservice.io/api/' + 'random';
	return request(jservice_url);
}

/**
 * Returns a string to be consumed by the Weather API service representing the geographic location parsed from the charbot
 * @param  {Object} chatBotParams - The `req.body.result.parameters` value from the Chatbot Fulfillment Request
 * @return {String}
 */
// function getLocationParams(chatBotParams) {
// 	var cityParam = chatBotParams['geo-city'] || 'Rosslyn';
// 	var stateParam = chatBotParams['geo-state-us'] || 'VA';
// 	return cityParam.replace(' ', '_') + "_" + stateParam.replace(' ', '_');
// }

/**
 * Generate the message that the chatbot will respond with
 * @param  {[type]} jeopardyResp - Response object from the JService API
 * @return {String}
 */
function generateJeopardyResponseText(jeopardyResp) {
	let jeopardyInfo = JSON.parse(jeopardyResp);
	return jeopardyInfo.question;
}

module.exports = {
	getCityWeather: getCityWeather,
	getLocationParams: getLocationParams,
	generateJeopardyResponseText: generateJeopardyResponseText
};
