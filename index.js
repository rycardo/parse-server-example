// Example express application adding the parse-server module to expose Parse
// compatible API routes.

// Express Always Required
var express 			= require('express');

// Parse Service
var ParseServer 		= require('parse-server').ParseServer;
var path 				= require('path');

// Twilio Service
// Twilio Init
var twilioAccountSid 	= process.env.TWILIO_ACCOUNT_SID;
var twilioAccountToken  = process.env.TWILIO_ACCOUNT_TOKEN;
var twilioPort			= process.env.TWILIO_PORT || 1338;
var twilioURL			= process.env.TWILIO_URL || '127.0.0.1';
var twilioMount			= process.env.TWILIO_MOUNT || '/';
var twilioSendingNumber	= process.env.TWILIO_PHONE_NUMBER;


//
// Parse Init
var databaseUri 		= process.env.DATABASE_URI || process.env.MONGODB_URI;

if ( !databaseUri )
{
	console.log('DATABASE_URI not specified, falling back to localhost.');
}

// databaseURI	is the mLab database connection string
// cloud		the path to the main cloud code file
// appId		self explanatory, really!
// masterKey	KEEP THIS SECRET
// serverURL	this is what the app uses to connect.
//

/*
 * NOTE ABOUT CLIENT KEYS
 * From:
 * github.com/ParsePlatform/parse-server/wiki/Parse-Server-Guide#why-do-i-need-to-set-failindexkeytoolongfalse
 *
 * Parse Server does not require the use of client-side keys.
 * This includes the client key, JavaScript key, .NET key, and REST API key.
 *
 * The Application ID is sufficient to secure your app.
 *
 * However, you have the option to specify any of these four keys upon initialization.
 * Upon doing so, Parse Server will enforce that any clients passing a key matches.
 * The behavior is consistent with hosted Parse.
 */

var api = new ParseServer(
{
	databaseURI:	databaseUri					||	'mongodb://localhost:27017/dev',
	cloud:			process.env.CLOUD_CODE_MAIN	||	__dirname + '/cloud/main.js',
	appId:			process.env.APP_ID			||	'myAppId',
	masterKey:		process.env.MASTER_KEY		||	'',
	serverURL:		process.env.SERVER_URL		||	'http://localhost:1337/parse',
	push:
	{
		ios:
		[
			{
				pfx:		__dirname + '/push_bin/ca.4xq.Barbershop8.Push_Development_Expires_2017-12-12.p12',
				passphrase:	process.env.PUSH_DEVELOPMENT_P12_PASSPHRASE,
				bundleId:	'ca.4xq.Barbershop8',
				production:	false
			},
			{
				pfx:		__dirname + '/push_bin/ca.4xq.Barbershop8.Push_Production_Expires_2017-10-06.p12',
				passphrase:	process.env.PUSH_PRODUCTION_P12_PASSPHRASE,
				bundleId:	'ca.4xq.Barbershop8',
				production:	true
			}
		]
	}
  //liveQuery: {
  //  classNames: ["GlobalSettings"] // List of classes to support for query subscriptions
  //}
});


// App Init
var app = express();

app.use('/cloud',  express.static(path.join(__dirname, '/cloud')));

// Public mount /public
// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public')));

// Parse mount /barbershop
// Serve the Parse API on the /parse URL prefix
var mountPath = process.env.PARSE_MOUNT || '/parse';
app.use(mountPath, api);


// GETS
//
// no path - Parse default
//
// Parse Server plays nicely with the rest of your web routes
app.get('/', function(request, response) {
  response.status(200).send('I am not really dreaming of being a website, instead I am dreaming of being an app back end!');
});


// Test returns test.html
// There will be a test page available on the /test path of your server url
// Remove this before launching your app
app.get('/test', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/test.html'));
});


// PARSE SERVER
var port 		= process.env.PORT || 1337;

var httpServer 	= require('http').createServer(app);

httpServer.listen(port, function()
{
   console.log('parse-server running on port ' + port + '.');
});


// This will enable the Live Query real-time server
//ParseServer.createLiveQueryServer(httpServer);

app.listen();