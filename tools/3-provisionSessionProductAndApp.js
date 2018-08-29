#! /usr/local/bin/node
/*jslint node:true, esversion:6 */
// 3-provisionSessionProductAndApp.js
// ------------------------------------------------------------------
// provision an Apigee Edge Developer, API Product, and App for OIDC Session.
//
// last saved: <2018-August-28 16:29:28>

const fs            = require('fs'),
      edgejs        = require('apigee-edge-js'),
      common        = edgejs.utility,
      apigeeEdge    = edgejs.edge,
      sprintf       = require('sprintf-js').sprintf,
      Getopt        = require('node-getopt'),
      version       = '20180828-1626',
      settings      = {
        product: {
          name : 'OIDC-Session',
          proxies : ['oidc-session']
        },
        app : {
          name : 'OIDC-Session-App',
          keyExpiry : '180d'
        },
        developer : {
          email : 'oidc-session-example@example.com',
          last : 'Example',
          first : 'OIDCSession'
        }
      },
      getopt        = new Getopt(common.commonOptions).bindHelp();

function handleError(e) {
  if (e) {
    common.logWrite(JSON.stringify(e, null, 2));
    common.logWrite(JSON.stringify(result, null, 2));
    //console.log(e.stack);
    process.exit(1);
  }
}

function maybeCreateProduct(org){
  return new Promise( (resolve, reject) => {
    org.products.get(function(e, productsList){
      if (e) { return reject(e); }
      if ( ! productsList.find(x => (x == settings.product.name))) {
        var options = {
              productName: settings.product.name,
              proxies: settings.product.proxies,
              approvalType : 'auto'
            };

        org.products.create(options, function(e, result){
          console.log('e = ' + JSON.stringify(e));
          console.log('result = ' + JSON.stringify(result));
          if (e) { return reject(e); }
          common.logWrite(sprintf('ok. product name: %s', result.name));
          resolve(result);
        });
      }
      else {
        return resolve();
      }
    });
  });
}

function maybeCreateDeveloper(org) {
  return new Promise( (resolve, reject) => {
    org.developers.get(function(e, developerList){
      if (e) { return reject(e); }
      if ( ! developerList.find(x => (x == settings.developer.email))) {
        var options = {
              developerEmail : settings.developer.email,
              lastName : settings.developer.last,
              firstName : settings.developer.first,
              userName : settings.developer.first + '.' + settings.developer.last
            };

        org.developers.create(options, function(e, result){
          if (e) { return reject(e); }
          common.logWrite(sprintf('ok. developer: %s', JSON.stringify(result, null, 2)));
          return resolve(result);
        });
      }
      else {
        // developer exists
        return resolve();
      }
    });
  });
}

function maybeCreateDeveloperApp(org) {
  return new Promise( (resolve, reject) => {
    org.developerapps.get({email: settings.developer.email}, function(e, appList){
      if (e) { return reject(e); }
      if ( ! appList.find(x => (x == settings.app.name))) {
        var options = {
              developerEmail : settings.developer.email,
              appName : settings.app.name,
              apiProduct : settings.product.name,
              expiry : settings.app.keyExpiry
            };
        org.developerapps.create(options, function(e, result){
          if (e) { return reject(e); }
          common.logWrite(sprintf('ok. app name: %s', result.name));
          common.logWrite(sprintf('apikey %s', result.credentials[0].consumerKey));
          common.logWrite(sprintf('secret %s', result.credentials[0].consumerSecret));
          return resolve(result);
        });
      }
      else {
        // developer app exists
        org.developerapps.get({email: settings.developer.email, name: settings.app.name}, function(e, result){
          if (e) { return reject(e); }
          common.logWrite(sprintf('apikey %s', result.credentials[0].consumerKey));
          common.logWrite(sprintf('secret %s', result.credentials[0].consumerSecret));
          return resolve();
        });
      }
    });
  });
}


// ========================================================

console.log(
  'Apigee Edge OIDC Asset Provisioning tool, version: ' + version + '\n' +
    'Node.js ' + process.version + '\n');

common.logWrite('start');

// process.argv array starts with 'node' and 'scriptname.js'
var opt = getopt.parse(process.argv.slice(2));

common.verifyCommonRequiredParameters(opt.options, getopt);

var options = {
      mgmtServer: opt.options.mgmtserver,
      org : opt.options.org,
      user: opt.options.username,
      password: opt.options.password,
      no_token: opt.options.notoken,
      verbosity: opt.options.verbose || 0
    };

apigeeEdge.connect(options, function(e, org) {
  handleError(e);
  common.logWrite('connected');

  maybeCreateProduct(org)
    .then(result => maybeCreateDeveloper(org))
    .then(result => maybeCreateDeveloperApp(org))
    .catch(handleError);
});
