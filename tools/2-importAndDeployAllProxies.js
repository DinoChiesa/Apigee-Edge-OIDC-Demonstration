#! /usr/local/bin/node
/*jslint node:true, esversion:6 */
// 2-importAndDeployAllProxies.js
// ------------------------------------------------------------------
// import and deploy all Apigee Edge proxy bundles in a directory.
//
// Copyright 2017-2018 Google LLC.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// last saved: <2018-August-28 16:56:30>

const fs         = require('fs'),
      path       = require('path'),
      edgejs     = require('apigee-edge-js'),
      common     = edgejs.utility,
      apigeeEdge = edgejs.edge,
      sprintf    = require('sprintf-js').sprintf,
      Getopt     = require('node-getopt'),
      version    = '20180828-1443',
      defaults   = { source : '../proxies' },
      getopt     = new Getopt(common.commonOptions.concat([
        ['d' , 'source=ARG', 'optional. source directory for the API Proxies. default: ' + defaults.source ],
        ['e' , 'env=ARG', 'required. the Edge environment(s) to which to deploy the proxies.']
      ])).bindHelp();

// ========================================================


function deployProxy(org, importResult) {
  return new Promise(function(resolve, reject) {
    const options = {
            environment : opt.options.env,
            name : importResult.name,
            revision : importResult.revision
          };
    org.proxies.deploy(options, function(e, result) {
      if (e) {
        common.logWrite(JSON.stringify(e, null, 2));
        if (result) { common.logWrite(JSON.stringify(result, null, 2)); }
        reject(e);
      }
      common.logWrite('deploy ok.');
      resolve(result);
    });
  });
}

function importProxy(org, sourceDir) {
  return new Promise ( (resolve, reject) => {
    org.proxies.import({source:path.join(opt.options.source, sourceDir)}, function(e, importResult) {
      if (e) {
        common.logWrite('error: ' + JSON.stringify(e, null, 2));
        if (result) { common.logWrite(JSON.stringify(importResult, null, 2)); }
        reject(e);
      }
      common.logWrite(sprintf('import ok. name: %s r%d', importResult.name, importResult.revision));
      resolve(importResult);
    });
  });
}

/*
 * resolveInSeries executes Promises sequentially.
 * @param {funcs} An array of funcs that return promises.
 * @example
 * const urls = ['/url1', '/url2', '/url3']
 * resolveInSeries(urls.map(url => () => $.ajax(url)))
 *     .then(console.log.bind(console))
 */
const resolveInSeries = funcs =>
    funcs.reduce((promise, func) =>
                 promise.then(result => func().then(Array.prototype.concat.bind(result))), Promise.resolve([]));

console.log(
  'Apigee Edge OIDC Proxy Import + Deploy tool, version: ' + version + '\n' +
    'Node.js ' + process.version + '\n');

common.logWrite('start');

// process.argv array starts with 'node' and 'scriptname.js'
var opt = getopt.parse(process.argv.slice(2));

if ( !opt.options.source ) {
  opt.options.source = defaults.source;
  common.logWrite('using source dir: ' + opt.options.source );
}

common.verifyCommonRequiredParameters(opt.options, getopt);

var options = {
      mgmtServer: opt.options.mgmtserver,
      org : opt.options.org,
      user: opt.options.username,
      password: opt.options.password,
      no_token: opt.options.notoken,
      verbosity: opt.options.verbose || 0
    };

function isDir(partialpath) {
  const stat = fs.statSync(path.join(opt.options.source, partialpath));
  return (stat && stat.isDirectory());
}


apigeeEdge.connect(options, function(e, org){
  if (e) {
    common.logWrite(JSON.stringify(e, null, 2));
    process.exit(1);
  }
  common.logWrite('connected');

  fs.readdir(opt.options.source, function(e, entries) {
    if (e) {
        common.logWrite('error: ' + JSON.stringify(e, null, 2));
        process.exit(1);
    }
    let directories = entries.filter(isDir);

    // map the list of directories into a series of Promises to import+deploy
    resolveInSeries( directories.map(dir => () => importProxy(org, dir)) )
      .then( results => {
        return resolveInSeries(results.map (importResult => () => deployProxy(org, importResult)));
      })
      .then(() => { common.logWrite('all done...'); })
      .catch(console.error);
  });
});
