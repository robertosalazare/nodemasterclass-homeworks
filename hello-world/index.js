const http = require('http');
const https = require('https');
const url = require('url');
const { StringDecoder } =require('string_decoder');
const config = require('./config');
const fs = require('fs');

const httpServer = http.createServer(function(req, res) {
	unifiedServer(req, res);
});

httpServer.listen(config.httpPort, function() {
	console.log(`The server is listening on port ${config.httpPort}`);
});

const httpsServerOptions = {
	'key': fs.readFileSync('./https/key.pem'),
	'cert': fs.readFileSync('./https/cert.pem'),
};

const httpsServer = https.createServer(httpsServerOptions, function(req, res) {
	unifiedServer(req, res);
});

httpsServer.listen(config.httpsPort, function() {
	console.log(`The server is listening on port ${config.httpsPort}`);
});

const unifiedServer = function(req, res) {
	const parsedUrl = url.parse(req.url, true);

	const path = parsedUrl.pathname;
	const trimmedPath = path.replace(/^\/+|\/+$/g, '');

	const queryStringObject = parsedUrl.query;

	const method = req.method.toLowerCase();

	const headers = req.headers;

	const decoder = new StringDecoder('utf-8');
	let buffer = '';
	req.on('data', function(data) {
		buffer += decoder.write(data);
	});

	req.on('end', function() {
		buffer += decoder.end();

		var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

		var data = {
			trimmedPath,
			queryStringObject,
			method,
			headers,
			payload: buffer,
		};

		chosenHandler(data, function(statusCode, payload) {
			statusCode = typeof(statusCode) === 'number' ? statusCode : 200;

			payload = typeof(payload) === 'object' ? payload : {};

			var payloadString = JSON.stringify(payload);

			res.setHeader('Content-Type', 'application/json');
			res.writeHead(statusCode);
			res.end(payloadString);

			console.log('request received with this response: ', statusCode, payloadString);
		});
	});
}

var handlers = {};

handlers.hello = function(data, callback) {
	callback(200, {
		message: 'Hello World!',
	});
}

handlers.notFound = function(data, callback) {
	callback(404);
};

var router = {
	'hello': handlers.hello,
};