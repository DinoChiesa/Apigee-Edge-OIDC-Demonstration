// userAuthentication.js
// ------------------------------------------------------------------
//
// A module to do user authentication. It supports three different mechanisms,
// currently: fake, and local.
//
// This module could be extended by adding new functions and expanding the list of
// exports. Good candidates might be firebase auth, or Google Signin.
//
// created: Wed Jun 15 14:13:56 2016
// last saved: <2018-August-28 11:06:38>


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
    if (storedRecord && storedRecord.password) {
      console.log('authenticateAgainstLocalUserDb: user has been found');
      if (storedRecord.password == ctx.credentials.password) {
        console.log('authenticateAgainstLocalUserDb: user is authentic');
        var copy = shallowCopyObject(storedRecord);
        delete(copy.password);
        copy.email = ctx.credentials.username;
        ctx.loginStatus = 200;
        ctx.userInfo = copy;
      }
      else {
        console.log('authenticateAgainstLocalUserDb: user is not authentic');
        ctx.loginStatus = 401;
      }
    }
    else {
      ctx.loginStatus = 401;
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
    }
  };


}(this));
