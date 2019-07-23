/* global context */
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
      'req_state',
      'req_scope',
      'appName',
      'appLogoUrl'
  ];

// Set flow variables
namesToExport.forEach(function(name){
  context.setVariable(name, hash[name]);
});
if (hash.response_type_code && hash.response_type_code == "true") {
  context.setVariable("code", "code");
}
if (hash.response_type_id_token && hash.response_type_id_token == "true") {
  context.setVariable("id_token", "id_token");
}
if (hash.response_type_token && hash.response_type_token == "true") {
  context.setVariable("token", "token");
}
