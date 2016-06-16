/*
 * Validate the authorize request from query or body parameter:
 * 1. Check for empty client_id
 * 2. Validate response_type parameter - http://openid.net/specs/oauth-v2-multiple-response-types-1_0.html
 * 3. Validate scope
 * 4. Check for empty redirect_uri parameter
 * 5. Check for empty state parameter
 * validate-request-1.0.js (c) 2010-2015 @Apigee
 */

var verb = context.getVariable("request.verb");
var params = {
 client_id     : null,
 display       : null,
 login_hint    : null,
 nonce         : null,
 redirect_uri  : null,
 response_type : null,
 scope         : null,
 state         : null
};

var requiredParams = ['response_type',
                      'client_id',
                      'redirect_url',
                      'state',
                      'scope',
                      'nonce'];
var cvPrefix = {
      POST : 'formparam',
      GET  : 'queryparam'
    }[verb];

/**
 * Check if a given element is null/empty
 *
 * @param {String} element
 * @return {boolean}
 */

function isEmptyOrNull(element){
  return ((element === null) ||(element === ""));
}

function isMissingParam(param) {
  if(isEmptyOrNull(params[param])){
    context.setVariable("error_type", "invalid_request");
    context.setVariable("error_description", "The request is missing a required parameter: " + param);
    return true;
  }
  return false;
}


/**
 * Parse response_type. OpenId connect can support multiple response_type
 * for more information - http://openid.net/specs/oauth-v2-multiple-response-types-1_0.html
 * for e.g. a combination of code, token and id_token.
 * This will be used to conditionally execute GenerateIDToken, AuthorizationCode & AccessToken policies
 * @param {String} responseType - Space separated string e.g."code id_token token"
 *
 * @return boolean indicating if the response_type was invalid (true = invalid).
 */
function parseResponseType(responseType){
  var responseTypes = responseType.trim().split(" "),
      response_type_code = false,
      response_type_token = false,
      response_type_id_token = false,
      invalid = false,
      foundOne = false;

  responseTypes.forEach(function(item) {
    switch(item) {
    case "code":
      response_type_code = true;
      foundOne = true;
      break;
    case "token":
      response_type_token = true;
      foundOne = true;
      break;
    case "id_token":
      response_type_id_token = true;
      foundOne = true;
      break;
    default:
      invalid = true;
      break;
    }
  });

  invalid = invalid || ( ! foundOne);
  if (response_type_token || response_type_id_token) {
    context.setVariable("error_response_symbol",'#');
  }

  if ( ! invalid) {
    context.setVariable("response_type_token", response_type_token);
    context.setVariable("response_type_id_token", response_type_id_token);
    context.setVariable("response_type_code", response_type_code);
  }
  return invalid;
}


// ====================================================================

context.setVariable("error_response_symbol",'?');

Object.keys(params).forEach(function(key){
  params[key] = context.getVariable("request." + cvPrefix + "." + key);
});

if ( ! requiredParams.some(isMissingParam) ) {
  if (params.scope.toLowerCase().trim().indexOf("openid") == -1){
    context.setVariable("error_type", "invalid_scope");
    context.setVariable("error_description", "The request is missing a required scope parameter: openid");
  }
  else if (parseResponseType(params.response_type)){
    context.setVariable("error_type", "unsupported_response_type");
    context.setVariable("error_description", "The authorization server does not support: response_type");
  }
  else {
    Object.keys(params).forEach(function(key){
      context.setVariable("oidc_" + key, params[key]);
    });
  }
}
