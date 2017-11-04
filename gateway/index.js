const express = require('express');
const app = express();
const bodyparser = require('body-parser');
const apiai = require('apiai');
const uuidV1 = require('uuid/v1');

const client = apiai(process.env.AI_APIKEY);
const PORT = (process.env.PORT || 5000);

app.use(bodyparser.json());
app.listen(PORT, function() {
	console.log('Node app is running on port', PORT);
})

/**
 * Makes a request to the API.ai service and resolves with the response that should be sent back to the webhook
 * @param  {String} requestText Message to send to the API.AI bot
 * @return {Promise} Promise containing the respose to send
 */
function getAIResponse(requestText, requestUser) {
	return new Promise(function(resolve, reject) {
		var request = client.textRequest(requestText, {
      sessionId: requestUser // TODO: FIgure out a way for multiple sessions within client. All requests need a unique identifier, generate one with uuids. Note, for client we are using a constant sessionId to keep the chat going for a particular user. Here, we can also access it via apiai
    });
		request.on('response', function(response) {
			resolve({
        "username": 'AlexTrebot',
        "icon_url": 'https://i.imgur.com/6qLjTTo.jpg',
        "text": response.result.fulfillment.speech
      });
		});

		request.on('error', function(error) {
			reject(error);
		});

		request.end();
	});
}

app.post('/', function(req, res) {
	//Check that we're allowed to use this service
	if (req.body.token === process.env.WEBHOOK_TOKEN) {
		//Don't respond to empty messages or messages not addressed to Sassbot
		let alexTrebotRegex = /^alextrebot/i;
		if (!req.body.text || !alexTrebotRegex.test(req.body.text)) {
			return res.sendStatus(204);
		}

		//Remove 'AlexTrebot' from the request we send to the AI service
		var requestText = req.body.text.replace(alexTrebotRegex, '');
		var requestUser = req.body.user_name;

		getAIResponse(requestText, requestUser).then((chatResponse) => {
			res.send(chatResponse);
		}).catch((err) => {
			console.log(err);
			res.sendStatus(500);
		});

	} else {
		res.sendStatus(403);
	}
});
