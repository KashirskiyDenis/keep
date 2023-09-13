'use strict';

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { parse } from 'node:url';
import { config } from './config/index.js';

const requestListener = function (req, res) {
	let path = parse(req.url).pathname;
	
	if (path == '' || path == '/') {
		readFile('./index.html')
		.then(content => {
			res.writeHead(200);
			res.end(content);
		});	
	} else if (path == '/favicon') {
		readFile('./public' + path + '.png')
		.then(content => {
			res.writeHead(200);
			res.end(content);
		});
	} else if (path == '/style') {
		readFile('./public' + path + '.css', { encoding: 'utf8' })
		.then(content => {
			res.writeHead(200);
			res.end(content);
		});	
	} else if (path == '/script') {
		readFile('./public' + path + '.js', { encoding: 'utf8' })
		.then(content => {
			res.writeHead(200);
			res.end(content);
		});	
	}
};

const server = createServer(requestListener);

server.listen(config.port, config.host, () => {
	console.log(`Server is running on: ${config.host}:${config.port}`);
});	