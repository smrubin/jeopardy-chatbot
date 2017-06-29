const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const request = require('request-promise-native');
const jeopardyAPI = require('./jeopardy');
const PORT = (process.env.PORT || 5000);

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.listen(PORT, function() {
	console.log('Fulfillment service is running on port: ', PORT);
});

/**
 * This POST Handler listens for the Webhook from the API.AI Fulfillment Request
 * Request body parameters from the language parsing can be found in `req.body.result.parameters`
 * Response must be JSON in the following format:
 * @example
 * {
     speech: "",
     displayText: "",
     source: ""
   }
 * @link https://docs.api.ai/docs/webhook
 */
app.post('/jeopardy', function(req, res) {
	jeopardyAPI.getRandomQuestion().then(function(jeopardyInfoResp) {
		res.send({
      speech: jeopardyAPI.generateJeopardyResponseText(jeopardyInfoResp),
      displayText: jeopardyAPI.generateJeopardyResponseText(jeopardyInfoResp),
      source: "jBot"
    });
	}).catch(function(err) {
		console.log(err);
		res.sendStatus(500);
	});
});
