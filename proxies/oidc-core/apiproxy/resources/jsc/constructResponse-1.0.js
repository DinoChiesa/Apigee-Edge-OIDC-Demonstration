/*
 * Construct response based on /authorize response_type parameter
 *
 * construct.response-1.0.js
*/

var application_uri = context.getVariable("redirect_uri"),
    state = context.getVariable("req_state"),
    id_token= context.getVariable("jwt_jwt"),
    access_token = context.getVariable("apigee.access_token"),
    code = context.getVariable("oauthv2authcode.OAuthV2-GenerateAuthorizationCode.code"),
    expires = context.getVariable("oauthv2accesstoken.OAuthV2-GenerateAccessToken-Implicit.expires_in"),
    token_type = context.getVariable("token_type"),
    response_type_code = context.getVariable("response_type_code"),
    response_type_token = context.getVariable("response_type_token"),
    response_type_id_token = context.getVariable("response_type_id_token");


// Based on the response_type construct the application response
// if the response_type contains id_token or token then add a "#" else add a "?"
application_uri += ((response_type_id_token=="true") || (response_type_token=="true")) ? "#" : '?';

application_uri += "state=" + state;


if(response_type_id_token=="true"){
  application_uri += "&id_token=" + id_token;
}

if(response_type_token=="true"){
  application_uri += "&access_token=" + access_token +
    "&expires=" + expires +
    "&token_type=" + token_type;
}

if(response_type_code=="true"){
  application_uri += "&code=" + code;
}

context.setVariable("application_uri", application_uri);
