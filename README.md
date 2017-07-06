AlexTrebot Chatbot Fulfillment Service
==========================

AlexTrebot is a chatbot built as an api.ai fulfillment service integrated with a Mattermost channel. Data is sourced from [jService](http://jservice.io).

AlexTrebot can ask provide help and information about how to play, ask a question from a random category and point value, check if the answer is correct (and make sure it is in question form), tell you your score, and provide a player leaderboard.

For a work-in-progress web version, visit https://bot.api.ai/804067d3-3bac-4e60-9b6e-91288ae97836


Third-party data sources can be incorporated into [api.ai](https://api.ai) by the use of a [Fulfillment Webhook](https://docs.api.ai/docs/webhook). api.ai will parse the request, extract relevant data, and POST it to the fulfillment service. This example uses the [jService API](http://jservice.io) to demonstrate such a service.

## Requirements
The latest [Node.js LTS](https://nodejs.org/en/) is recommended.

## Installation
Install dependencies
```
npm install
```

## Software Used
* [Express](https://expressjs.com) - Web Application Framework
* [Request](https://github.com/request/request) - Simplified HTTP request client.
* [Sequelize](https://github.com/sequelize/sequelize) - An easy-to-use multi SQL dialect ORM for Node.js
* [Node-Postgres](https://github.com/brianc/node-postgres) PostgreSQL client for node.js.
