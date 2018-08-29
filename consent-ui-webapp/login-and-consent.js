/* jslint esversion:6 */
// login-and-consent.js
// ------------------------------------------------------------------
//
// A node app that implements an authentication and consent-granting web
// app. This thing implements what is known in the OAuth docs as the
// Authorization Server. This app uses jade for view rendering, and
// bootstrap CSS in the HTML pages, but those details are irrelevant for
// its main purpose.
//
// Run this with
//     node ./login-and-consent.js
//
// See the package.json for dependencies.
//
// This app is designed to also run on heroku. In fact, since Edge needs
// to redirect to the login app, it works best if this app runs in a
// server that is accessible from the internet.
//
// To pop the login page:
// GET https://ORGNAME-ENVNAME-test.apigee.net/PROXYBASEPATH/oauth2/authorize?client_id=VALID_CLIENT_ID_HERE&redirect_uri=http://dinochiesa.github.io/openid-connect/callback-handler.html&response_type=id_token&scope=openid%20profile&nonce=A12345&state=ABCDEFG
//
// Sunday, 28 February 2016, 13:47
//
// ------------------------------------------------------------------

const express        = require('express'),
      bodyParser     = require('body-parser'),
      querystring    = require('querystring'),
      morgan         = require('morgan'), // a logger
      request        = require('request'),
      path           = require('path'),
      defaultAppLogo = 'http://i.imgur.com/6DidtRS.png',
      url            = require('url'),
      app            = express(),
      config         = require('./config/config.json'),
      userAuth       = require('./lib/userAuthentication.js'),
      authSystem     = userAuth[config.authSystem || 'local'];

require ('./lib/dateExtensions.js');

authSystem.config(config);

if (typeof String.prototype.startsWith != 'function') {
  String.prototype.startsWith = function (str){
    return this.slice(0, str.length) == str;
  };
}

function getType(obj) {
  return Object.prototype.toString.call(obj);
}

function logError(e) {
  console.log('unhandled error: ' + e);
  console.log(e.stack);
}

function copyHash(obj) {
  var copy = {};
  if (null !== obj && typeof obj == "object") {
    Object.keys(obj).forEach(function(attr){copy[attr] = obj[attr];});
  }
  return copy;
}

function formifyHash(obj) {
  // By default, qs serializes an array like roles : [ 'foo', 'bar', 'bam']
  // into roles[0]=foo&roles[1]=bar&roles[2]=bam
  // We want
  // into roles=foo bar bam
  var result = {};
  Object.keys(obj).forEach(function(key) {
    var prop = obj[key];
    result[key] = (Array.isArray(prop)) ? prop.join(' ') : prop;
  });
  return result;
}

function base64Encode(item) {
  return new Buffer(item).toString('base64');
}

function base64Decode(item) {
  return new Buffer(item, 'base64').toString('ascii');
}

function postAuthorization (ctx) {
  return new Promise((resolve, reject) => {
    var authEndpoint = ctx.oidcserver? ctx.oidcserver.replace('/authorize', '/auth') : config.authEndpoint,
        options = {
          method: 'POST',
          uri: authEndpoint,
          headers: {
            'content-type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
          },
          form : formifyHash(copyHash(ctx.userInfo))
        };

    console.log('postAuthorization, auth endpoint:' + authEndpoint);
    console.log('postAuthorization, context:' + JSON.stringify(ctx, null, 2));
    options.form.sessionid = ctx.txid;
    delete options.form.status;

    request(options, function(error, response, body) {
      console.log('auth response: ' + response.statusCode);
      if (response.statusCode == 302) {
        try {
          ctx.authRedirLoc = response.headers.location;
        }
        catch (exc1) {
          console.log('auth exception: ' + exc1.message);
          console.log(exc1.stack);
          reject(exc1);
        }
      }
      else {
        console.log('auth, statusCode = ' + response.statusCode);
      }
      resolve(ctx);
    });
  });
}


function inquireOidcSessionId(ctx) {
  return new Promise((resolve, reject) => {
    // send a query to Edge to ask about the OIDC session
    var infoEndpoint;
    if (ctx.oidcserver) {
      infoEndpoint = ctx.oidcserver.replace('/oidc-core/oauth2/authorize', '/oidc-session');
    }
    else {
      ctx.oidcserver = infoEndpoint = config.sessionApi.endpoint;
    }

    const options = {
            method: 'GET',
            uri:  infoEndpoint + '/info?' + querystring.stringify({ txid : ctx.txid }),
            headers: {
              'apikey': config.sessionApi.apikey,
              'Accept': 'application/json'
            }
          };

    console.log('inquireOidcSessionId request: ' + JSON.stringify(options, null, 2));

    request(options, function(error, response, body) {
      console.log('inquireOidcSessionId response: ' + body);
      if (error) {
        return reject(error);
      }
      if (response.statusCode == 200) {
        try {
          body = JSON.parse(body);
          // Edge knows about the session and has returned information about it.
          ctx.sessionInfo = body;
        }
        catch (exc1) {
          console.log('inquireOidcSessionId exception: ' + exc1.message);
          reject(exc1);
        }
        resolve(ctx);
      }
      else {
        console.log('inquireOidcSessionId, statusCode = ' + response.statusCode);
        resolve(ctx);
      }
    });
  });
}


app.use(morgan('combined')); // logger
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/img', express.static(path.join(__dirname, 'img')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views', path.join(__dirname, '/views'));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());


app.get('/logout', function (request, response) {
  var auth = request.session.username;
  request.session = null; // logout
  response.redirect('manage');
});


// display the cancel page
app.get('/cancel', function (request, response) {
  response.status(200);
  response.render('cancel', {
    title: "Declined",
    mainMessage: "You have declined.",
  });
});


// display the login form
app.get('/login', function (request, response) {

  function renderLogin (ctx) {
    // sessionInfo:
    //   client_id
    //   response_type
    //   response_type_token
    //   response_type_id_token
    //   response_type_code
    //   scope
    //   redirect_uri
    //   req_state
    //   appName
    //   appLogoUrl
    //   nonce
    //   display
    //   login_hint
    if (ctx.sessionInfo && ctx.sessionInfo.open_id) {
      ctx.viewData = copyHash(ctx.sessionInfo);
      ctx.viewData.action = 'Sign in';
      ctx.viewData.txid = ctx.txid;
      ctx.viewData.oidcserver = ctx.oidcserver;
      ctx.viewData.errorMessage = null; // must be present and null
      response.render('login', ctx.viewData);
    }
    else {
      response.status(404);
      response.render('error404', {
        mainMessage: "the txid is not known.",
        title : "bad txid"
      });
    }
    return ctx;
  }

  var context = { txid: request.query.sessionid };
  if (request.query.oidcserver) {
    context.oidcserver = decodeURIComponent(request.query.oidcserver);
  }
  Promise.resolve(context)
    .then(inquireOidcSessionId)
    .then(renderLogin)
    .catch(logError);

});


// respond to the login form postback
app.post('/validateLoginAndConsent', function (request, response) {
  console.log('BODY: ' + JSON.stringify(request.body));
  if ( ! request.body.redirect_uri) {
    response.status(400);
    response.render('error', {
      errorMessage : "Bad request"
    });
    return;
  }

  if (request.body.submit != 'yes') {
    console.log('user has declined to login');
    // ! request.body.redirect_uri.startsWith('oob') &&
    // ! request.body.redirect_uri.startsWith('urn:ietf:wg:oauth:2.0:oob')
    response.status(302);
    response.header('Location', request.body.redirect_uri + '?error=access_denied');
    response.end();
    return;
  }

  // validate form data
  if ( ! request.body.username || ! request.body.password) {
    // missing form fields
    response.status(401);
    response.render('login', {
      action        : 'Sign in',
      txid          : request.body.sessionid,
      oidcserver    : request.body.oidcserver,
      client_id     : request.body.client_id,
      response_type : request.body.response_type,
      req_scope     : request.body.requestedScopes,
      redirect_uri  : request.body.redirect_uri,
      req_state     : request.body.clientState,
      appName       : request.body.appName,
      appLogoUrl    : request.body.appLogoUrl || defaultAppLogo,
      display       : request.body.display,
      login_hint    : request.body.login_hint,
      errorMessage  : "You must specify a user and a password."
    });
    return;
  }

  Promise.resolve({
        credentials : {
          username: request.body.username,
          password: request.body.password
        },
        txid : request.body.sessionid
      })
    .then(authSystem.authn)
    .then(function(ctx){
      if (ctx.loginStatus != 200) {
        response.status(401);
        response.render('login', {
          action        : 'Sign in',
          txid          : ctx.txid,
          oidcserver    : request.body.oidcserver,
          client_id     : request.body.client_id,
          response_type : request.body.response_type,
          req_scope     : request.body.requestedScopes,
          redirect_uri  : request.body.redirect_uri,
          req_state     : request.body.clientState,
          appName       : request.body.appName,
          appLogoUrl    : request.body.appLogoUrl || defaultAppLogo,
          display       : request.body.display,
          login_hint    : request.body.login_hint,
          errorMessage  : "That login failed."
        });
        return ctx;
      }

      // else, a-ok.
      // This app got a 200 ok from the user Authentication service.
      response.status(200);
      response.render('consent', {
        action        : 'Consent',
        txid          : ctx.txid,
        oidcserver    : request.body.oidcserver,
        client_id     : request.body.client_id,
        response_type : request.body.response_type,
        req_scope     : request.body.requestedScopes,
        redirect_uri  : request.body.redirect_uri,
        req_state     : request.body.clientState,
        appName       : request.body.appName,
        appLogoUrl    : request.body.appLogoUrl || defaultAppLogo,
        display       : request.body.display,
        login_hint    : request.body.login_hint,
        userProfile   : base64Encode(JSON.stringify(ctx.userInfo))
      });

      return ctx;
    })
    .catch(logError);
});


// respond to the consent form postback
app.post('/grantConsent', function (request, response) {
  console.log('BODY: ' + JSON.stringify(request.body));
  if ( ! request.body.redirect_uri) {
    response.status(400);
    response.render('error', { errorMessage : 'Bad request' });
    return;
  }

  if (request.body.submit != 'yes') {
    console.log('user has declined to consent');
    // ! request.body.redirect_uri.startsWith('oob') &&
    // ! request.body.redirect_uri.startsWith('urn:ietf:wg:oauth:2.0:oob')
    response.status(302);
    response.header('Location', request.body.redirect_uri + '?error=access_denied');
    response.end();
    return;
  }


  Promise.resolve({
      userInfo : JSON.parse(base64Decode(request.body.userProfile)),
      txid : request.body.sessionid,
      oidcserver : request.body.oidcserver
    })
    .then(postAuthorization)
    .then(function(ctx){
      response.status(302);
      if (!ctx.authRedirLoc) {
        // the post did not succeed
        response.header('Location', request.body.redirect_uri + '?error=server_error');
      }
      else {
        response.header('Location', ctx.authRedirLoc);
      }
      response.end();
      return ctx;
    })
    .catch(logError);
});


app.get('/*', function (request, response) {
    response.status(404);
    response.render('error404', {
      mainMessage : 'There\'s nothing to see here.',
      title : 'That\'s 404 dude!'
    });
});


var httpPort = process.env.PORT || 5150;
app.listen(httpPort, function() {
  console.log('Listening on port ' + httpPort);
});
