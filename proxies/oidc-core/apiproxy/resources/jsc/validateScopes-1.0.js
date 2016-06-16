/*
 * validate-scopes-1.0.js script validates the following:
 * 1. scopes in /authorize request against scopes defined in API Products
 * 2. redirect_uri in /authorize request against callback_uri defined in developer application configuration
 *
 * validateScopes-1.0.js (c) 2015,2016 Apigee
*/


/**
 *
 * @param {String} scopesXML
 * @param {String} applicationScope
 *
 * @return boolean
 */
function validateScopes(scopesXML, applicationScope){
  // Convert the scope from application request to Array
  if(scopesXML === null) { return false; }

  var receivedScopes = applicationScope.split(" ");
  var re1 = new RegExp('<Scope>([^<]+)</Scope>', 'g');

  // strip XML decl from the XML
  scopesXML = scopesXML.replace(/^<\?xml\s+version\s*=\s*(["'])[^\1]+\1[^?]*\?>/, "");

  // Create a new xml object from scope xml string
  scopesXML = new XML(scopesXML);
  // an element, such as
  //<Scopes><Scope>email</Scope>\n<Scope>openid</Scope>\n<Scope>profile</Scope></Scopes>

  // convert to an array of strings
  var scopes = scopesXML.Scope
    .toString()
    .replace(re1, ' $1 ')
    .trim()
    .split(new RegExp(' +'));

  // // Iterate, parse and validate the application scopes against the API Products scopes
  // var lookup = {};
  // scopes.foreach(function(scope){
  //   lookup[scope.toString()]=scope.toString();
  // });

  return receivedScopes.every(function(rscope) {
    return (scopes.indexOf(rscope) != -1);
  });

}


function validate() {
  // compare received data to that which is required
  var expectedRedirectUri = context.getVariable("verifyapikey.VerifyAPIKey-1.redirection_uris");
  var receivedRedirectUri = context.getVariable("oidc_redirect_uri");
  var scopesXML = context.getVariable("AccessEntity.AE-APIProduct.ApiProduct.Scopes");
  var applicationScope = context.getVariable("oidc_scope");


  if (expectedRedirectUri != receivedRedirectUri){
    context.setVariable("error_type", "invalid_request");
    context.setVariable("error_variable", "Invalid redirect_uri parameter");
    return;
  }

  if(!validateScopes(scopesXML, applicationScope)){
    context.setVariable("error_type", "invalid_scope");
    context.setVariable("error_variable", "The requested scope is invalid, unknown, or malformed");
    return;
  }
}


validate();
