#! /usr/local/bin/node
/*jslint node:true, esversion:6 */
// provisionCache.js
// ------------------------------------------------------------------
// provision the cache for the example OIDC API proxy.
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
// last saved: <2018-August-28 14:37:53>

var fs = require('fs'),
    edgejs = require('apigee-edge-js'),
    common = edgejs.utility,
    apigeeEdge = edgejs.edge,
    sprintf = require('sprintf-js').sprintf,
    Getopt = require('node-getopt'),
    async = require('async'),
    version = '20180828-1433',
    stackdriverJson,
    defaults = { cache: 'cache1' },
    getopt = new Getopt(common.commonOptions.concat([
      ['e' , 'env=ARG', 'required. the Edge environment for which to store the KVM data'],
      ['C' , 'cache=ARG', 'optional. name of the Cache in Edge. Will be created if nec. Default: ' + defaults.cache]
    ])).bindHelp();

// ========================================================

console.log(
  'Apigee Edge Cache provisioning tool for OIDC demo, version: ' + version + '\n' +
    'Node.js ' + process.version + '\n');

common.logWrite('start');

// process.argv array starts with 'node' and 'scriptname.js'
var opt = getopt.parse(process.argv.slice(2));

if ( !opt.options.env ) {
  console.log('You must specify an environment');
  getopt.showHelp();
  process.exit(1);
}

if ( !opt.options.cache ) {
  common.logWrite(sprintf('defaulting to %s for cache', defaults.cache));
  opt.options.cache = defaults.cache;
}

common.verifyCommonRequiredParameters(opt.options, getopt);

const options = {
      mgmtServer: opt.options.mgmtserver,
      org : opt.options.org,
      user: opt.options.username,
      password: opt.options.password,
      no_token: opt.options.notoken,
      verbosity: opt.options.verbose || 0
    };

apigeeEdge.connect(options, function(e, org) {
  if (e) {
    common.logWrite(JSON.stringify(e, null, 2));
    process.exit(1);
  }
  common.logWrite('connected');

  org.caches.get({ env: opt.options.env }, function(e, result){
    if (e) {
      common.logWrite(JSON.stringify(e, null, 2));
      console.log(e.stack);
      process.exit(1);
    }

    if (result.indexOf(opt.options.cache) == -1) {
      org.caches.create({ env: opt.options.env, name: opt.options.cache},
                        function(e, result){
                          if (e) return cb(e);
                          common.logWrite('OK. Created cache %s.', opt.options.cache);
                        });
    }
    else {
      common.logWrite('OK. Cache (%s) exists.', opt.options.cache);
    }
  });

});
