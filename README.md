AlexTrebot Chatbot Fulfillment Service
==========================

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
* [Sequelize]() - ORM used for Postgres DB
