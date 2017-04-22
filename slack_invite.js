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

// https://ionizecms.slack.com/api/users.admin.invite?_x_id=<Token>&email=<Email>&channels=<ChannelID>

const queryString = require('querystring');
const http = require('http');
const fs = require('fs');

const Token = fs.ReadFileSync('.slack_token');
const API_HOST = 'ionizecms.slack.com';
const API_PATH = '/api/users.admin.invite?_x_id=8a528229-'+(Date.now()/1000);

var InviteData = {
	'email': 'adaliszk@gmail.com',
	'channels': 'C33UQ7GCA',
	'first_name': 'AdaLiszk',
	'token': Token,
	'set_Active': 'true',
	'_attempts': '1'
};

var URL_PARAMS = '&token='+Token+'&email='+InviteData.email+'&channels='+InviteData.channels;
console.log('URL_PARAMS',URL_PARAMS);

var RequestOptions = {method:'GET',host:API_HOST,port:443,path:API_PATH+URL_PARAMS};
console.log('RequestOptions',RequestOptions);

var Request = http.request(RequestOptions, (response) => {
	response.setEncoding('utf8');
	response.on('data', function (chunk) {
		console.log('Response: ' + chunk);
	});
});
