// setUserPassword.js
// ------------------------------------------------------------------
//
// A node app that sets the password of a user in usergrid.
//
// Run this with
//     node ./setUserPasswordInUsergrid.js
//
//
//
// Sunday, 28 February 2016, 13:47
//
// ------------------------------------------------------------------

var q = require('q'),
    //os = require('os'),
    request = require('request'),
    Getopt = require('node-getopt'),
    // fs = require('fs'),   // for later retrieval of config info from settings file?
    config = require('./../webapp/config/config.json');

var getopt = new Getopt([
      ['u', 'username=ARG', 'the username to set the password of.'],
      ['p', 'password=ARG', 'the new password for the user.'],
      //['v', 'verbose'],
      ['h', 'help']
    ]).bindHelp(),

    // process.argv starts with 'node' and 'scriptname.js'
    opt = getopt.parse(process.argv.slice(2));

if ( ! opt.options.username) {
  console.log('specify a username');
  getopt.showHelp();
  process.exit(1);
}
if ( ! opt.options.password) {
  console.log('specify a new password');
  getopt.showHelp();
  process.exit(1);
}


function logError(e) {
  console.log('unhandled error: ' + e);
  console.log(e.stack);
}


function ugAuthenticate(ctx) {
  var deferred = q.defer(),
      options = {
        uri: 'https://api.usergrid.com/' + config.usergrid.org + '/' +
          config.usergrid.app + '/token',
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'Accept': 'application/json'
        },
        body : JSON.stringify({
          grant_type : 'client_credentials',
          client_id : config.usergrid.id,
          client_secret : config.usergrid.secret
        })
      };

  request(options, function(error, response, body) {
    if (response.statusCode == 200) {
      try {
        body = JSON.parse(body);
        ctx.access_token = body.access_token;
      }
      catch (exc1) {
        console.log('authn exception: ' + exc1.message);
        console.log(exc1.stack);
      }
    }
    else {
      console.log('authn, statusCode = ' + response.statusCode);
      console.log('authn, body = ' + body);
    }
    deferred.resolve(ctx);
  });

  return deferred.promise;
}


function setUserPassword(ctx) {
  var deferred = q.defer(),
      options = {
        uri: 'https://api.usergrid.com/' + config.usergrid.org + '/' +
          config.usergrid.app + '/users/' + ctx.username + '/password',
        method: 'POST',
        headers: {
          'Authorization' : 'Bearer ' + ctx.access_token,
          'content-type': 'application/json',
          'Accept': 'application/json'
        },
        body : JSON.stringify({
          newpassword : ctx.newpassword
        })
      };

  console.log('setUserPassword, context:' + JSON.stringify(ctx, null, 2));

  request(options, function(error, response, body) {
    console.log('sup response: ' + response.statusCode);
    if (response.statusCode == 200) {
      try {
        body = JSON.parse(body);
        ctx.supBody = body;
      }
      catch (exc1) {
        console.log('sup exception: ' + exc1.message);
        console.log(exc1.stack);
      }
    }
    else {
      console.log('sup, statusCode = ' + response.statusCode);
      console.log('sup, body = ' + body);
    }
    deferred.resolve(ctx);
  });

  return deferred.promise;
}

function reportOut(ctx) {
  console.log('context: ' + JSON.stringify(ctx, null, 2));
}

var context = {
      username : opt.options.username,
      newpassword : opt.options.password
    };

q(context)
  .then(ugAuthenticate)
  .then(setUserPassword)
  .done(reportOut, logError);
