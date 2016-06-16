// userAuthentication.js
// ------------------------------------------------------------------
//
// A module to do user authentication. It supports three different mechanisms,
// currently: fake, local, and usergrid. The usergrid authentication does not rely
// on the usergrid npm module. Not needed, since there's really only one call made
// to usergrid: a request-for-token.
//
// This module could be extended by adding new functions and expanding the list of
// exports.
//
// created: Wed Jun 15 14:13:56 2016
// last saved: <2016-June-15 17:25:19>


(function (globalScope){
  var q = require('q'),
      request = require('request'),
      crypto = require('crypto'),
      ugConfig,
      localUserDb;

  function configureNoop(config) { }

  function alwaysAuthenticateSuccessfully(ctx) {
    ctx.loginStatus = 200;
    ctx.userInfo = {
      picture     : 'http://i.imgur.com/60rQbfy.png',
      uuid        : '6BAE464E-C76D-42F0-998B-C59517C13C4A',
      user_id     : ctx.credentials.username,
      username    : ctx.credentials.username,
      email       : ctx.credentials.username + '@example.com',
      motto       : 'Experience is what you get when you didn\'t get what you wanted.',
      family_name : 'Williams',
      given_name  : 'Freda'
    };
    return ctx;
  }

function authenticateUserInUsergrid(ctx) {
  var deferred = q.defer(),
      uri = ugConfig.uri || 'https://api.usergrid.com/' ,
        options = {
          uri: uri + ugConfig.org + '/' + ugConfig.app + '/token',
          method: 'POST',
          headers: {
            'content-type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
          },
          form : {
            grant_type : 'password',
            username : ctx.credentials.username,
            password : ctx.credentials.password
          }
        };

    console.log('Authenticate %s/%s against usergrid', ctx.credentials.username, ctx.credentials.password);

    request(options, function(error, response, body) {
      console.log('authn response: ' + response.statusCode);
      ctx.loginStatus = response.statusCode;
      if (response.statusCode == 200) {
        try {
          body = JSON.parse(body);
          // {
          //   "access_token": "YWMtfLrJtOA.._TZG46Vfit-Ok",
          //   "expires_in": 604800,
          //   "user": {
          //     "uuid": "7fc95522-ff6b-11e1-b1ca-12313d2b9967",
          //     "type": "user",
          //     "name": "Bob Odell",
          //     "created": 1347737296831,
          //     "modified": 1456883878639,
          //     "username": "BobO",
          //     "email": "bob@odell.com",
          //     "activated": true,
          //     "family_name": "Odell",
          //     "gender": "M",
          //     "given_name": "Bob"
          //   }
          // }
          ctx.userInfo = body.user;
          if ( ! ctx.userInfo.user_id) {
            ctx.userInfo.user_id = ctx.userInfo.username;
          }
          if ( ! ctx.userInfo.picture) {
            ctx.userInfo.picture = "http://i.imgur.com/60rQbfy.png";
          }
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

  function configUsergridConnection(config) {
    if ( ! config.usergrid.app || !config.usergrid.org) {
      throw new Error("specify a valid Usergrid org + app");
    }
    ugConfig = config.usergrid;
  }

  function joinPathElements() {
    var re1 = new RegExp('^\\/|\\/$', 'g'),
        elts = Array.prototype.slice.call(arguments);
    return '/' + elts.map(function(element){
      if ( ! element) {return '';}
      return element.replace(re1,""); }).join('/');
  }

  function loadLocalUserDb(filename) {
    localUserDb = require(joinPathElements(__dirname, filename));
    if ( ! localUserDb) {
      throw new Error("localUserDb cannot be loaded.");
    }
  }

  function configureLocalAuth(config) {

    // Read the usernames + passwords "user database" that is passed in, in config.
    // This allows the "stored" credentials to be dynamically specified at init time.

    if ( !config.localUserDb) {
      throw new Error("there is no localUserDb configured.");
    }

    loadLocalUserDb(config.localUserDb);
  }

  function authenticateAgainstLocalUserDb(ctx) {
    console.log('Authenticate against localDB');
    if ( !ctx.credentials.username || !ctx.credentials.password) {
      ctx.userInfo = null;
      return ctx;
    }
    if ( !localUserDb) {
      throw new Error("localUserDb is null.");
    }

    console.log('Authenticate %s/%s against localDB', ctx.credentials.username, ctx.credentials.password);
    var storedRecord = localUserDb[ctx.credentials.username];
    if (storedRecord && storedRecord.hash) {
      // user has been found
      var computedHash = crypto.createHash('sha256')
        .update(ctx.credentials.password)
        .digest("hex")
        .toLowerCase();
      if (computedHash == storedRecord.hash) {
        var copy = shallowCopyObject(storedRecord);
        delete(copy.hash);
        copy.email = ctx.credentials.username;
        ctx.loginStatus = 200;
        ctx.userInfo = copy;
      }
    }
    else {
      ctx.loginStatus = 404;
    }
    return ctx;
  }


  function shallowCopyObject(obj) {
    var copy = {};
    if (null !== obj && typeof obj == "object") {
      Object.keys(obj).forEach(function(attr){copy[attr] = obj[attr];});
    }
    return copy;
  }

  module.exports = {
    fake : {
      config: configureNoop,
      authn: alwaysAuthenticateSuccessfully
    },
    local : {
      config: configureLocalAuth,
      authn: authenticateAgainstLocalUserDb
    },
    usergrid : {
        config: configUsergridConnection,
        authn : authenticateUserInUsergrid
      }
  };


}(this));
