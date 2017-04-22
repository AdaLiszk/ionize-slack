#!/usr/bin/env node

/*
 * The MIT License (MIT)
 *
 * Copyright (C) 2017 Ádám Liszkai <adaliszk@gmail.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies
 * or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
 * TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
 * CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 *
 */

'use strict';

const express = require('express');
const handlebars = require('handlebars');
const cleancss = require('clean-css');

const spdy = require('spdy');
const http = require('http');
const fs = require('mz/fs');

const app = express();

// Handle the root file
app.get(/([^/]*)(\/|\/index.html)$/i, (request, response) => {

	let baseURL = request.baseUrl; if(baseURL=='') baseURL = '/';
	console.log(request.method+' Request: '+baseURL);

	var parameters = {};

	let includeFiles = [
		fs.readFile(__dirname + '/website/assets/template.css')
	];
	let includeFileNames = ['template_styles'];

	Promise.all(includeFiles)
	.then(includes => {
		for(let idx in includes)
		{
			let content = includes[idx];
			let contentName = includeFileNames[idx];

			let contentString = content.toString();
				contentString = contentString.replace(/url\('/g,"url('assets/");

			let minified = new cleancss().minify(contentString).styles;

			parameters[contentName] = minified;
		}

		//console.log('Paramters Updated:', parameters);
		return includes;
	})
	.then(includes => fs.readFile(__dirname + '/website/index.html'))
	.then(template => {
		//console.log('Template:', template);

		let compile = handlebars.compile(template.toString(), {noEscape: true});
		let compiled = compile(parameters);
		//console.log('Compiled:', compiled);

		//let tpl = handlebars.compile('{{foo}}');
		//let compiled = tpl({'foo':'asd'});

		return compiled;
	})
	.then(compiled => response.send(compiled))
	.catch(error => {
		console.error(error);
		response.status(500).send(error.toString())
	});
});

// Handle the static contents
app.use('/', express.static('website'));

// Get logged in profile information
app.post('/api/send_invite', (request, response) => {
    // @TODO: Call slack_invite.js with parameters
	response.status(501).send(null);
});

// Configuring Webserver
const port = 9100;
const options = {
	key: fs.readFileSync(__dirname + '/credentials/development.key'),
	cert:  fs.readFileSync(__dirname + '/credentials/development.crt')
};

// Starting Webserver
spdy.createServer(options, app).listen(port, error =>
{
	if (!error) console.log('Listening https on :' + port);
	else
	{
		console.error(error);
		return process.exit(1)
	}
});