// authenticateUser.js
// ------------------------------------------------------------------
//
// A node app that connects with usergrid to authenticate a user. It
// relies on a userAuthentication module that exports methods to
// authenticate against a local DB, or against usergrid, or ... with a
// faked always-positive response.
//
// Run this with
//     node ./authenticateUser.js
//
//
// Sunday, 28 February 2016, 13:47
//
// ------------------------------------------------------------------

// // this allows nested requires
// var globalScope = (function(){ return this; }).call(null);
// globalScope.rootRequire = function(name) {
//     return require(__dirname + '/' + name);
// };
//
// globalScope.relativeRequire = function(path, name) {
//     return require(__dirname + '/' + path + name);
// };


var q = require('q'),
    config = require('./../webapp/config/config.json'),
    userAuth = require('./../webapp/lib/userAuthentication.js'),
    authSystem,
    Getopt = require('node-getopt'),
    getopt = new Getopt([
      ['u', 'username=ARG', 'the username to authenticate.'],
      ['p', 'password=ARG', 'the password for the user.'],
      ['a', 'authn=ARG', 'the authn system to use. One of {fake, usergrid, local}'],
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
  console.log('specify a password');
  getopt.showHelp();
  process.exit(1);
}

if ( ! opt.options.authn) {
  opt.options.authn = config.authSystem || 'usergrid';
}

if (userAuth.hasOwnProperty(opt.options.authn)) {
  authSystem = userAuth[opt.options.authn];
}
else {
  console.log('specify a valid user authn system');
  getopt.showHelp();
  process.exit(1);
}


function logError(e) {
  console.log('unhandled error: ' + e);
  console.log(e.stack);
}

function reportOut(ctx) {
  console.log('context: ' + JSON.stringify(ctx, null, 2));
}


var context = {
      credentials : {
        username : opt.options.username,
        password : opt.options.password
      }
    };


authSystem.config(config);

q(context)
  .then(authSystem.authn)
  .done(reportOut, logError);
