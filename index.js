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

require('dotenv').config();

const express = require('express');
const querystring = require('querystring');
const bodyParser = require('body-parser');
const multer = require('multer');
const formData = multer();
const handlebars = require('handlebars');
const cleancss = require('clean-css');

const https = require('https');
const fs = require('mz/fs');

const app = express();

const PORT = process.env.PORT || 8080;
console.log('PORT:',PORT);

const os = require("os");

const HOSTNAME = process.env.HOSTNAME || os.hostname();
console.log('HOSTNAME:',HOSTNAME);

const HOSTPORT = ':'+PORT;
console.log('HOSTPORT:',HOSTPORT);

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// Handle the root file
app.get(/([^/]*)(\/|\/index.html)$/i, (request, response) => {

	let baseURL = request.baseUrl; if(baseURL=='') baseURL = '/';
	console.log(request.method+' Request: '+baseURL);

	var parameters = {
		'error': '{{error}}',
		'message': '{{message}}'
	};

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

		let compile = handlebars.compile(template.toString(), {noEscape: true, explicitPartialContext: true});
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
app.post('/api/send_invite', formData.fields([]), (request, response) => {

	// https://ionizecms.slack.com/api/users.admin.invite?_x_id=<RequestToken>&email=<Email>&channels=<ChannelID>

	console.log('POST /api/send_invite');
	console.log('BODY:', request.body);

	const POST_EMAIL = request.body.email || '';
	const POST_NAME = request.body.name || '';

	const API_HOST = 'ionizecms.slack.com';
	const API_PATH = '/api/users.admin.invite?_x_id=4c4ba70c-'+(Date.now()/1000);

	const QUERY_DATA = {
		'email': POST_EMAIL,
		'channels': 'C33UQ7GCA',
		'first_name': POST_NAME,
		'token': process.env.API_TOKEN || ''
	};
	console.log('QUERY_DATA:', QUERY_DATA);

	const QUERY_STRING = querystring.stringify(QUERY_DATA);
	console.log('QUERY_STRING:', QUERY_STRING);

	const REQUEST_OPTIONS = {method:'GET',host:API_HOST,path:API_PATH+'&'+QUERY_STRING};
	console.log('REQUEST_OPTIONS:', REQUEST_OPTIONS);

	const SlackRequest = https.request(REQUEST_OPTIONS, (res) => {
		var responseText = '';
		res.setEncoding('utf8');

		res.on('data', (chunk) => { responseText += chunk; });

		res.on('end', () => {
			console.log('SlackRequest::end',responseText);

			response.set('Content-Type', 'application/json');
			console.log('Content-Type:', response.get('Content-Type'));

    		response.set('Access-Control-Allow-Origin', request.protocol+'://'+HOSTNAME+HOSTPORT);
			console.log('Access-Control-Allow-Origin:', response.get('Access-Control-Allow-Origin'));

			response.set('Access-Control-Expose-Headers','AMP-Access-Control-Allow-Source-Origin');
			console.log('Access-Control-Expose-Headers:', response.get('Access-Control-Expose-Headers'));

			response.set('AMP-Access-Control-Allow-Source-Origin', request.protocol+'://'+HOSTNAME+HOSTPORT);
			console.log('AMP-Access-Control-Allow-Source-Origin:', response.get('AMP-Access-Control-Allow-Source-Origin'));

			try
			{
				let responseJson = JSON.parse(responseText);

				if(responseJson.ok == true) response.status(200).send('{"message": "success"}');
				else
				{
					let message = ``;

					switch(responseJson.error)
					{
						case "already_invited":
								message  = `This email is already invited, plase check your spam folders too for the invitation.\n`;
								message += `If you still didn't received then contact me on adaliszk[at]gmail.com`;
							break;

						default:
								message  = `Something went wrong, plase contact me on adaliszk[at]gmail.com\n`;
								message += `<code>${e.message}</code>`
							break;
					}

					responseJson.error = responseJson.error.toUpperCase();
					responseJson.message = message;
					response.status(409).send(JSON.stringify(responseJson));
				}
			}
			catch(e)
			{
				let message  = `Something went wrong, plase contact me <a href="mailto:adaliszk@gmail.com">adaliszk@gmail.com</a>`;
					message += `<code>${e.message}</code>`

				let responseJson = {"message":message};

				response.status(500).send(JSON.stringify(responseJson));
			}
		});
	}).end();
});

app.listen(PORT, error => {
	if (!error) console.log('Listening on:',PORT);
	else
	{
		console.error(error);
		return process.exit(1)
	}
});
