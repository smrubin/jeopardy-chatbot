const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const request = require('request-promise-native');
const PORT = (process.env.PORT || 5000);

const models = require('./models');
const jeopardyApi = require('./jeopardy');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.listen(PORT, function() {
	console.log('Jeopardy fulfillment service is running on port: ', PORT);
});

// Connect to content pq database and define models
models.sequelize.sync().then(function() {}, function(err) {
  console.log('Error: ', err);
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
  console.log('headers: ' + JSON.stringify(req.headers));
  console.log('body: ' + JSON.stringify(req.body));
  let user = req.body.sessionId;

  jeopardyApi[req.body.result.action](req.body).then(function(jeopardyInfoResp) {
		res.send({
      speech: jeopardyInfoResp.message,
      displayText: jeopardyInfoResp.message,
      data: {
        'currentScore': 400,
        'user': 'srubin',
        'question': jeopardyInfoResp
      },
      source: 'AlexTrebot',
      contextOut: jeopardyInfoResp.context || req.body.result.contexts || []
    });
	}).catch(function(err) {
		console.log(err);
		res.sendStatus(500);
	});
});
