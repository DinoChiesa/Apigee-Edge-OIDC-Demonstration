/*
 * set context variables from application session data (JSON String)
 *
 */
var sessionData = context.getVariable("session.Payload"),
    hash = JSON.parse(sessionData),
    namesToExport = [
      'response_type_token',
      'response_type_code',
      'response_type_id_token',
      'nonce',
      'redirect_uri',
      'client_id',
      'apiProductName',
      'req_state',
      'req_scope'
    ];

// Set flow variables
namesToExport.forEach(function(name){
  context.setVariable(name, hash[name]);
});
if (hash.response_type_code) {
  context.setVariable("code", "code");
}
if (hash.response_type_token) {
  context.setVariable("token", "token");
}
