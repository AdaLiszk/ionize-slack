
// https://ionizecms.slack.com/api/users.admin.invite?_x_id=<Token>&email=<Email>&channels=<ChannelID>

const querystring = require('querystring');
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
