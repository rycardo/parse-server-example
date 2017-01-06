/*
 *	Parse Cloud Code
 *
 *	Documentation:
 *	https://www.parse.com/docs/js/guide#cloud-code
 *	This URL will probably change to a github url
 *
 *	FOLDERS:
 *
 *	config
 *	contains a JSON configuration file that you shouldn't normally need to deal with
 *
 *	cloud
 *	stores your Cloud Code
 *
 *	public
 *	stores any static content that you want to host on the Parse Server
 *
 *	When you are done editing any of these files,
 *	deploy the changes using git/Git Hub/Git Desktop
 */

/*
 *	Barbershop Apps Methods
 *	These are to connect to and use Parse Server
 *
 *
 *	To use Parse Server you need the following:
 *
 *	Application ID
 *	in APP_ID
 *
 *	Database URI
 *	in DATABASE_URI
 *
 *	File Key
 *	in FILE_KEY
 *
 *	Master Key
 *	in MASTER_KEY
 *
 *	Parse Mount Path
 *	PARSE_MOUNT
 *
 *	The Server URL that the app will use
 *	in SERVER_URL
 *
 */

//do I need to require app.js?
//require('./cloud/app.js');

// Twilio Code
require ('./twilio.js');

//////////////////////////////////////
//
// hello
//
//////////////////////////////////////
Parse.Cloud.define('hello', function(req, res)
{
  res.success('I am not really dreaming of being a website, instead I am dreaming of being the back end to an app... SUCCESS!');
});


///////////////////////////////////////
//
// status
//
///////////////////////////////////////
Parse.Cloud.define('status', function(request, response)
{
	response.success('Up, Plateau, Valid');
});


///////////////////////////////////////
//
// barberIdForBarberName
//
///////////////////////////////////////
Parse.Cloud.define('barberIdForBarberName', function(request, response)
{
	Parse.Cloud.useMasterKey();
	var query = new Parse.Query('Barbers');
	query.equalTo('barberName', request.params.barberName);
	query.equalTo('isActive', true);
	query.find(
	{
		success: function(results)
		{
			if ( results.length == 1 )
			{
				var barberId = results[0].id;
				response.success(barberId);
			}
			else if ( results.length > 1 )
			{
				response.error('more than one barber found');
			}
			else
			{
				response.error('no barbers found with that name');
			}
		},
		error: function(error)
		{
			response.error('barber name lookup failed: ' + error);
		}
	});
});


///////////////////////////////////////
//
// canReplyToUserWithId
//
///////////////////////////////////////
Parse.Cloud.define('canReplyToUserWithId', function(request, response)
{
	console.log('canReplyToUserWithId ' + request.params.userId);

	var User  = Parse.Object.extend('_User');
	console.log('1');
	var query = new Parse.Query(User);
	console.log('2');
	query.equalTo('objectId', request.params.userId);
	console.log('3');
	query.get(
	{
		useMasterKey: true,
		success: function(result)
		{
			console.log('found user!');
			var canReply = result.get('allowsMessages');
			if ( canReply == null )
			{
				canReply = false;
			}
			console.log('can reply is ' + canReply);

			response.success(canReply);
		},
		error: function(error)
		{
			console.log('ERROR querying user');
			console.log(error);

			response.error('user lookup failed');
		}
	});
});

Parse.Cloud.define("canReplyToUserWithId_B", function(request, response)
{
	console.log('canReplyToUserWithId_B ' + request.params.userId);

	var query = new Parse.Query('_User');
	console.log('1');
	query.equalTo('objectId', request.params.userId);
	console.log('2');
	query.find(
	{
		useMasterKey: true,
		success: function(results)
		{
			console.log('3');
			if ( results.length == 1 )
			{
				console.log('4');
				var canReply = results[0].get('allowsMessages');
				if ( canReply == null )
				{
					console.log('5');
					canReply = false;
				}
				console.log('6 can reply:');
				console.log(canReply);
				response.success(canReply);
			}
			else if ( results.length > 1 )
			{
				console.log('more than one user found');
				response.error('more than one user found');
			}
			else
			{
				console.log('no user found');
				response.error('no user found with that objectId');
			}
		},
		error: function(error)
		{
			console.log('error quering user ' + request.params.userId);
			console.log(error);
			response.error('user lookup failed');
		}
	});
});

///////////////////////////////////////
//
// doesMessageToUserWithNoRepeatHashExist
//
///////////////////////////////////////
Parse.Cloud.define('doesMessageToUserWithNoRepeatHashExist', function(request, response)
{
	Parse.Cloud.useMasterKey();

	var userId = request.params.userId;
	var nrHash = request.params.noRepeat;

	var query = new Parse.Query('Messages');
	query.equalTo('userID', request.params.userId);
	query.equalTo('noRepeat', request.params.noRepeat);
	query.find(
	{
		success: function(results)
		{
			if ( results.length == 0 )
			{
				response.success(false);
			}
			else
			{
				response.success(true);
			}
		},
		error: function(error)
		{
			response.error('message lookup failed: ' + error);
		}
	});
});


///////////////////////////////////////
//
// nameForUserWithObjectId
//
///////////////////////////////////////
Parse.Cloud.define('nameForUserWithObjectId', function(request, response)
{
	Parse.Cloud.useMasterKey();

	var User = Parse.Object.extend('_User')
	var query = new Parse.Query(User);
	query.get(request.params.objectId,
	{
		success: function(object)
		{
			// object is an instance of Parse.Object.
			var firstName = object.get('firstName');
			if ( firstName == null )
			{
				firstName = '';
			}
			var lastName = object.get('lastName');
			if ( lastName == null )
			{
				lastName = '';
			}
			var fullName = firstName.trim() + ' ' + lastName.trim();

			response.success(fullName.trim());
		},
		error: function(error)
		{
			// error is an instance of Parse.Error.
			response.error('unable to get user with object id: ' + error);
		}
	});
});

///////////////////////////////////////
//
// serviceIdForBarberNameAndServiceName
//
///////////////////////////////////////
Parse.Cloud.define('serviceIdForBarberNameAndServiceName', function(request, response)
{
	Parse.Cloud.useMasterKey();

	var query = new Parse.Query('Services');
	query.equalTo('barberName', request.params.barberName);
	query.equalTo('serviceName', request.params.serviceName);
	query.find(
	{
		success: function(results)
		{
			if ( results.length == 1 )
			{
				var service = results[0];
				var isActive = service.get('isActive');
				var serviceId = '';
				if ( isActive == true )
				{
					serviceId = service.id;
				}
				else
				{
					var replacement = service.get('replacement');
					if ( replacement != null )
					{
						serviceId = replacement.id;
					}
					else
					{
						serviceId = null;
					}
				}
				response.success(serviceId);
			}
			else if ( results.length > 1 )
			{
				response.error('more than one service found');
			}
			else
			{
				response.error('no services found for barber name and service name');
			}
		},
		error: function(error)
		{
			response.error('service name lookup failed: ' + error);
		}
	});
});


///////////////////////////////////////
//
// serviceIdForServiceIdReplacement
//
///////////////////////////////////////
Parse.Cloud.define('serviceIdForServiceIdReplacement', function(request, response)
{
	Parse.Cloud.useMasterKey();
	// changed equalTo objectId to id 2016 11 07
	var query = new Parse.Query('Services');
	query.equalTo('id', request.params.serviceId);
	query.equalTo('isActive', false);
	query.find(
	{
		success: function(results)
		{
			if ( results.length == 0 )
			{
				response.success(request.params.serviceId);
			}
			else
			{
				var replacement = results[0].get('replacement');
				response.success(replacement.id);
			}
		},
		error: function(error)
		{
			response.error('service id replacement lookup failed: ' + error);
		}
	});
});

///////////////////////////////////////
//
// servicesForBarberId
//
///////////////////////////////////////
Parse.Cloud.define('servicesForBarberId', function(request, response)
{
	Parse.Cloud.useMasterKey();
	// changed objectId to id
	var query = new Parse.Query('Barbers');
	query.equalTo('id', request.params.barber);
	query.find(
	{
		success: function(results)
		{
			var relation = results[0].get('services');
			var relationQuery = relation.query;
			relationQuery.equalTo('isActive', true);
			relationQuery.find(
			{
				success: function(results)
				{
					response.success(results);
				},
				error: function(error)
				{
					response.error('services lookup failed: ' + error);
				}
			});
		},
		error: function(error2)
		{
			response.error('barber lookup failed ' + error2);
		}
	});
});


///////////////////////////////////////
//
// incrementNewAppointmentTally
//
///////////////////////////////////////
Parse.Cloud.define('incrementNewAppointmentTally', function(request, response)
{
	Parse.Cloud.useMasterKey();

	var query = new Parse.Query('GlobalSettings');
	query.equalTo('settingName', 'newAppointmentTally');

	query.find(
	{
		success: function(results)
		{
			var resultObject = results[0];
			var tally = parseInt(resultObject.get('settingValue'));
			tally++;

			var tallyString = String.valueOf(tally);
			//resultObject.set('settingValue', tallyString);
			resultObject.save({'settingValue':tallyString});

			response.success(tally);
		},
		error: function(error)
		{
			response.error(error);
		}
	});
});


///////////////////////////////////////
//
// getUnreadMessageCount
//
///////////////////////////////////////
Parse.Cloud.define('getUnreadMessageCount', function(request, response)
{
	Parse.Cloud.useMasterKey();

	// Unread Messages
	var query = new Parse.Query('Messages');
	query.equalTo('recipientID', request.params.installId);
	query.doesNotExist('readAt');

	console.log('Getting Unread Messages Count for recipient [' + request.params.installId + ']');

	query.find(
	{
		success: function(results)
		{
			console.log('SUCCESS: ');
			response.success(results.count);
		},
		error: function(error)
		{
			console.log('ERROR: ');
			response.error('unable to get unread messages: ' + error);
		}
	});
});


///////////////////////////////////////
//
// getMessageCount
//
///////////////////////////////////////
Parse.Cloud.define('getMessageCount', function(request, response)
{
	//Parse.Cloud.useMasterKey();

	//Parse.Cloud.useMasterKey();
	// Unread Messages

	var query = new Parse.Query('Messages');
	query.equalTo('recipientID', request.params.installId);

	console.log('Getting Messages Count for recipient [' + request.params.installId + ']');

	query.find(
	{
		useMasterKey: true,
		success: function(results)
		{
			console.log('SUCCESS: ');
			response.success(results.count);
		},
		error: function(error)
		{
			console.log('ERROR: ');
			response.error('unable to get messages: ' + error);
		}
	});
});


///////////////////////////////////////
//
// getMessagesCount
//
///////////////////////////////////////
Parse.Cloud.define('getMessagesCount', function(request, response)
{
	//Parse.Cloud.useMasterKey();
	// Unread Messages
	var receiverID = request.params.receiverID;

	var query = new Parse.Query('Messages');
	query.equalTo('receiverID', receiverID);

	console.log('Getting Messages Count for user [' + receiverID + ']');

	query.find(
	{
		useMasterKey: true,
		success: function(results)
		{
			var allCount = results.count;
			var newCount = 0;

			for (mIdx = 0; mIdx < results.count; mIdx++)
			{
				var message = results[mIdx];
				if ( message.has('readAt') )
				{
					// not new
				}
				else
				{
					newCount++;
				}
			}
			console.log('messages count: ' + allCount.toString() );
			console.log('unread count:   ' + newCount.toString() );
			console.log('SUCCESS');
			var theResult = '{"allCount": ' + allCount + ',"newCount": ' + newCount + '}';

			response.success(theResult);
		},
		error: function(error)
		{
			console.log('ERROR: ');
			console.log(error);
			response.error('unable to get messages: ' + error);
		}
	});
});


///////////////////////////////////////
//
// loginUser
//
///////////////////////////////////////
Parse.Cloud.define('loginUser', function(request, response)
{
	// Phone Number
	var phoneNumber		= request.params.phoneNumber;
	phoneNumber		= phoneNumber.replace(/\D/g, '');

	// Verification Code
	var verificationCode 	= request.params.verificationCode;
	verificationCode 	= verificationCode.replace(/\D/g, '');

	// User Service Token
	var userServiceToken	= process.env.USER_SERVICE_TOKEN;

	if (!phoneNumber || phoneNumber.length != 10)
	{
		return response.error('Phone Number missing or invalid length');
	}

	if (!verificationCode || verificationCode.length < 4 || verificationCode.length > 6)
	{
		return response.error('Verification Code missing or invalid length');
	}

	Parse.User.logIn(phoneNumber, userServiceToken + '-' + verificationCode).then(function (user)
	{
		response.success(user.getSessionToken());
	}
	,function (loginError)
	{
		response.error(loginError);
	});
});


///////////////////////////////////////
//
// convertMessagesFromDeviceToUser
//
///////////////////////////////////////
Parse.Cloud.define('convertMessagesFromDeviceToUser', function(request, response)
{
response.error('depreciated function, with same params, use all 3 of these instead: convertMessagesFromDeviceRecipientToUserReceiver, convertMessagesFromUserRecipientToUserReceiver, convertMessagesFromUserUserToUserReceiver');
	//Parse.Cloud.useMasterKey();
	//
	// All Messages
	//var installId = request.params.installId;
	//var userId = request.params.userId;
	//
	//var query = new Parse.Query('Messages');
	//query.equalTo('recipientID', installId);
	//query.doesNotExist('userID');
	//query.find(
	//{
	//	useMasterKey: true,
	//	success: function(results)
	//	{
	//		console.log('Testing Converting');
	//		console.log('found: ' + results.length);
	//		if ( results.length == 0 )
	//		{
	//			response.success('no messages to convert');
	//			//conditionalLog('none to convert');
	//		}
	//		else
	//		{
	//			for ( m = 0; m < results.length; m++ )
	//			{
	//				//conditionalLog(results[m].objectId);
	//				if ( m == 0 )
	//				{
	//					results[m].set('userID', userId);
	//					results[m].save();
	//				}
	//			}
	//			var count = results.length;
	//			var countStr  = count.toString();
	//			var reply = 'converted ' + countStr + ' messages';
	//			response.success(reply);
	//		}
	//	},
	//	error: function(error)
	//	{
	//		response.error('unable to convert messages ' + error);
	//	}
	//});
});


///////////////////////////////////////
//
// convertMessagesFromDeviceRecipientToUserReceiver
//
///////////////////////////////////////
Parse.Cloud.define('convertMessagesFromDeviceRecipientToUserReceiver', function(request, response)
{
	//Parse.Cloud.useMasterKey();
	//
	// All Messages
	var installId	= request.params.installId;
	var userId		= request.params.userId;

	var query		= new Parse.Query('Messages');
	query.equalTo('recipientID', installId);
	query.doesNotExist('receiverID');
	query.find(
	{
		useMasterKey: true,
		success: function(results)
		{
			var foundStr = results.length.toString();
			console.log('Converting from Install ID In recipientID to User ID in receiverID');
			console.log('found: ' + foundStr);

			if ( results.length == 0 )
			{
				response.success('no messages to convert');
				//conditionalLog('none to convert');
			}
			else
			{
				for ( mIdx = 0; mIdx < results.length; mIdx++ )
				{
					var msgId = results[mIdx].objectId;
					console.log('converting msg ' + msgId);
					results[mIdx].set('userID', '-not-used-');
					results[mIdx].set('recipientID', '-not-used-');
					results[mIdx].set('receiverID', userId);
					results[mIdx].save();
				}
				var count		= results.length;
				var countStr	= count.toString();
				var reply		= 'converted ' + countStr + ' messages';
				response.success(reply);
			}
		},
		error: function(error)
		{
			response.error('unable to convert messages ' + error);
		}
	});
});


///////////////////////////////////////
//
// convertMessagesFromUserRecipientToUserReceiver
//
///////////////////////////////////////
Parse.Cloud.define('convertMessagesFromUserRecipientToUserReceiver', function(request, response)
{
	//Parse.Cloud.useMasterKey();
	//
	// All Messages
	var installId	= request.params.installId;
	var userId		= request.params.userId;

	var query		= new Parse.Query('Messages');
	query.equalTo('recipientID', userId);
	query.doesNotExist('receiverID');
	query.find(
	{
		useMasterKey: true,
		success: function(results)
		{
			var foundStr = results.length.toString();
			console.log('Converting from User ID in recipientID to receiverID');
			console.log('found: ' + foundStr);
			if ( results.length == 0 )
			{
				response.success('no messages to convert');
				//conditionalLog('none to convert');
			}
			else
			{
				for ( mIdx = 0; mIdx < results.length; mIdx++ )
				{
					var msgId = results[mIdx].objectId;
					console.log('converting msg ' + msgId);
					results[mIdx].set('userID', '-not-used-');
					results[mIdx].set('recipientID', '-not-used-');
					results[mIdx].set('receiverID', userId);
					results[mIdx].save();
				}

				var count		= results.length;
				var countStr	= count.toString();
				var reply		= 'converted ' + countStr + ' messages';
				response.success(reply);
			}
		},
		error: function(error)
		{
			response.error('unable to convert messages ' + error);
		}
	});
});


///////////////////////////////////////
//
// convertMessagesFromUserIDToReceiverID
//
///////////////////////////////////////
Parse.Cloud.define('convertMessagesFromUserUserToUserReceiver', function(request, response)
{
	//Parse.Cloud.useMasterKey();
	//
	// All Messages
	var installId	= request.params.installId;
	var userId		= request.params.userId;

	var query		= new Parse.Query('Messages');
	query.equalTo('userID', userId);
	query.doesNotExist('receiverID');
	query.find(
	{
		useMasterKey: true,
		success: function(results)
		{
			var foundStr = results.length.toString();
			console.log('Converting from User ID in userID to receiverID');
			console.log('found: ' + foundStr);
			if ( results.length == 0 )
			{
				response.success('no messages to convert');
				//conditionalLog('none to convert');
			}
			else
			{
				for ( mIdx = 0; mIdx < results.length; mIdx++ )
				{
					var msgId = results[mIdx].objectId;
					console.log('converting msg ' + msgId);
					results[mIdx].set('userID', '-not-used-');
					results[mIdx].set('recipientID', '-not-used-');
					results[mIdx].set('receiverID', userId);
					results[mIdx].save();
				}

				var count		= results.length;
				var countStr	= count.toString();
				var reply		= 'converted ' + countStr + ' messages';
				response.success(reply);
			}
		},
		error: function(error)
		{
			response.error('unable to convert messages ' + error);
		}
	});
});


///////////////////////////////////////
//
// convertProductsCartToUserId
//
///////////////////////////////////////
Parse.Cloud.define('convertProductsCartToUserId', function(request, response)
{
	//Parse.Cloud.useMasterKey();
	//
	// All Messages
	var installId	= request.params.installId;
	var userId		= request.params.userId;

	var query		= new Parse.Query('Carts');
	query.equalTo('installationId', installId);
	query.doesNotExist('userId');
	query.find(
	{
		useMasterKey: true,
		success: function(results)
		{
			var foundStr = results.length.toString();
			console.log('Converting Products Cart from Install ID to User ID');
			console.log('found: ' + foundStr);
			if ( results.length == 0 )
			{
				response.success('no carts to convert');
			}
			else
			{
				var cart = results[0];
				var notUsedArray = ['-not-used-'];

				cart.set('installationId', '-not-used-');
				cart.set('productIds',notUsedArray);
				cart.set('userId',userId);
				cart.save();

				for ( cIdx = 1; idx < results.length; idx++ )
				{
					var delCart = results[cIdx];
					delCart.destroy({});
				}
				var count		= results.length;
				var countStr	= count.toString();
				var reply 		= '';
				if ( count == 1 )
				{
					reply = 'the products cart was converted.';
				}
				else
				{
					reply = 'the first of ' + countStr + ' products carts was converted, others deleted.';
				}
				response.success(reply);
			}
		},
		error: function(error)
		{
			response.error('unable to convert products cart ' + error);
		}
	});
});


///////////////////////////////////////
//
// convertUsernameToPhoneNumber
//
///////////////////////////////////////
Parse.Cloud.define('convertUsernameToPhoneNumber', function(request, response)
{
	//Parse.Cloud.useMasterKey();
	// depreciated, add:
	// useMasterKey: true,
	// above your success: lines.

	console.log('Starting convertUsernameToPhoneNumber');

	var emailAddress 	= request.params.emailAddress;
	var phoneNumber  	= request.params.phoneNumber;

	console.log('emailAddress [' + emailAddress + ']');
	console.log('phoneNumber [' + phoneNumber + ']');

	var User = Parse.Object.extend('_User');
	var query = new Parse.Query(User);

	query.equalTo('username',emailAddress);
	query.find(
	{
		useMasterKey: true,
		success: function(results)
		{
			console.log('find with email address in username was successful.');
			console.log(results.length + ' records found');

			if ( results.length == 0 )
			{
				console.log('No records found to convert');
				response.success( '{ "description" : "No records found to convert" }' );
			}
			else
			{
				console.log('convert only first user, remove the remaining');
				// Create New User copying from first
				// lastName, installoids, barberName, isStaffMember, lastSeen, friendsRelation,
				// username, allowsMessages, phoneNumber, language, firstname, password, staffID,
				// email, userRole (pointer)
				var firstUser = results[0];

				//var messaging	= firstUser.get('allowsMessages');
				//var barberName 	= firstUser.get('barberName');
				var emailAddress= firstUser.get('email');
				var firstName 	= firstUser.get('firstName');
				//var friends	= firstUser.get('friendsRelation');
				var installoids = firstUser.get('installoids');
				//var isStaff	= firstUser.get('isStaffMember');
				var lastName 	= firstUser.get('lastName');
				//var lastSeen	= firstUser.get('lastSeen');
				//var phoneNumber	= firstUser.get('phoneNumber');
				var staffId	= firstUser.get('staffID');
				//var userId 	= firstUser.get('id');
				var username	= firstUser.get('username');
				//var userRole	= firstUser.get('userRole);

				console.log('Can update user:');

				console.log('email:      ' + emailAddress);
				console.log('firstName:  ' + firstName);
				console.log('installoids:' + installoids);
				console.log('lastName:   ' + lastName);
				console.log('staffId:    ' + staffId);
				console.log('username:   ' + username);

				var userServiceToken = process.env.USER_SERVICE_TOKEN;

				console.log('token length: ' + userServiceToken.length);

				var random  = randomNumberWithNumberOfDigits(5);

				user.set('gbAssist','CONVERTED')
				user.save(null,
				{
					useMasterKey: true,
					success: function(savedUser)
					{
						console.log('User saved CONVERTED.');
						var userResponse = '{ "email"        : "' + emailAddress     + '" , "firstName"    : "' + firstName        + '" , "installoids"  : "' + installoids      + '" , "lastName"     : "' + lastName         + '" , "staffId"      : "' + staffId          + '" , "username"     : "' + username         + '" , "confirmation" : "' + verification     + '" , "transaction"  : "' + userServiceToken + '" , "description"  : "confirmed" }';

						response.success(userResponse);
					},
					error: function(saveError)
					{
						console.log('unable to save user');
						console.log(saveError);
						response.error('Save was not successful: ' + saveError);
					}
				});
			}
		},
		error: function(queryError)
		{
			console.log('Query find not successful! ' + queryError);
			response.error('Query find not successful: ' + queryError);
		}
	});
});


///////////////////////////////////////
//
// getVerificationCode
//
///////////////////////////////////////
Parse.Cloud.define('getVerificationCode', function(request, response)
{
	var verification 	= randomNumberWithNumberOfDigits(5);
	var token 		= process.env.USER_SERVICE_TOKEN;
	var newPassword		= token + '-' + verification;

	response.success(newPassword);
});


///////////////////////////////////////
//
// randomNumberWithNumberOfDigits - not public
//
///////////////////////////////////////
function randomNumberWithNumberOfDigits(numDigits)
{
	var num = '';

	for(d = 0; d < numDigits; d++)
	{
		var min = 0;
		var max = 9;
		var digit = Math.floor(Math.random() * (max - min + 1)) + min;

		num = num + digit.toString();
	}

	return num;
}


///////////////////////////////////////
//
// conditionalLog - not public
//
///////////////////////////////////////
function conditionalLog(logText)
{
	var doLog = True; //env.process.DEBUG_LOG || True;

	if ( doLog == True || doLog == 'True' )
	{
		console.log(logText);
	}
}
