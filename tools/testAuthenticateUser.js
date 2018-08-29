/* jslint esversion:6 */
// authenticateUser.js
// ------------------------------------------------------------------
//
// A node app that connects with usergrid to authenticate a user. It
// relies on a userAuthentication module that exports methods to
// authenticate against a local DB, or against other user authentication
// service, eg, ... with a faked always-positive response.
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


const config = require('../consent-ui/webapp/config/config.json'),
      userAuth = require('../consent-ui/webapp/lib/userAuthentication.js'),
      readlineSync = require('readline-sync'),
      defaults = { authn : 'local'},
      userAuthOptions = Object.keys(userAuth),
      Getopt = require('node-getopt'),
      getopt = new Getopt([
        ['u', 'username=ARG', 'the username to authenticate.'],
        ['p', 'password=ARG', 'the password for the user.'],
        ['a', 'authn=ARG', 'the authn system to use. currently One of {' + userAuthOptions.join(',')+'}'],
        ['h', 'help']
      ]).bindHelp(),

      // process.argv starts with 'node' and 'scriptname.js'
      opt = getopt.parse(process.argv.slice(2));


if ( ! opt.options.authn) {
  opt.options.authn = config.authSystem || defaults.authn;
  console.log('using authn realm: "%s"', opt.options.authn);
}

if ( ! opt.options.username) {
  console.log('specify a username');
  getopt.showHelp();
  process.exit(1);
}

if ( ! opt.options.password) {
  opt.options.password = readlineSync.question('Password for ' + opt.options.username + ' : ',
                                               {hideEchoBack: true});
  if ( ! opt.options.password) {
    console.log('specify a password');
    getopt.showHelp();
    process.exit(1);
  }
}

if ( ! userAuth.hasOwnProperty(opt.options.authn)) {
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

const authSystem = userAuth[opt.options.authn];
const context = {
      credentials : {
        username : opt.options.username,
        password : opt.options.password
      }
    };

authSystem.config(config);

Promise.resolve(context)
  .then(authSystem.authn)
  .then(reportOut)
  .catch(logError);
