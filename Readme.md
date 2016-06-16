## OpenID Connect setup

OpenID Connect adds an Authentication mechanism to OAuth 2.0.

There are 3 parts to this demonstration:
* The Edge proxies - there are 2: oidc-core and oidc-session
* The login-and-consent application, which is a web app


In this demonstration, we do not provide the client app. Instead, the client app is something you imagine. Use the browser to GET the URL to kick off the OIDC flow. 

This simulates the client app behavior.


## Setup

Ten Easy? Steps.


1. If desired, modify the basepath in the API proxies called 'oidc-core' and 'oidc-session'

2. create a cache in Edge called 'cache1' in your desired deployment environment.

3. deploy the proxies to an edge org + env

4. in Edge, create an API Product called "OIDC-Session" and add the oidc-session proxy to it. 

4. in Edge, create a Developer App called "OIDC-Session-App" and give it access to the OIDC-Session API Product.  Get the API Key. 

5. Modify the config for the login-and-consent app to specify the endpoints for Auth and Session.
In the session section, specify the API key from the prior step.

6. Also modify the config for the login-and-consent app to specify which authentication service to use. 'local' is easiest.  'usergrid' is fine, but you need to set up accounts in a usergrid org+app. (See the [Readme for the consent webapp](consent-ui/Readme.md).)

7. deploy the login-and-consent webapp to a location that is reachable from the internet, like Heroku.

8. in Edge, create an API Product called "OIDC-Core-Product" and
  - add the oidc-core proxy to it
  - add a "custom attribute" to the API Product called 'login-url' containing the URL from the prior step.
    eg, https://myappname.herokuapp.com/login

9.  create a Developer App in Edge with authorization to the OIDC-Core-Product API Product.
  - set the callback URL to ... for example http://dinochiesa.github.io/openid-connect/callback-handler.html
  - add a custom attribute, called "logo-url"
    with value of an url for an image, eg, https://www.marketingtechblog.com/wp-content/uploads/2010/06/example-logo-660x330.png  
    This will be displayed to the user at runtime, by the login-and-consent web app when ascertaining consent. 


10. Kick off the login by using http://dinochiesa.github.io/openid-connect/link-builder2.html
... specifying  your org, env, chosen basepath (See step 1), client id from the final step, any nonce and state, the callback url from above, and etc.



## Using the Link Builder

The link builder is just a webform that helps you build the link to kick off the OIDC flow.
Fill out all the fields, with the data from your configuration . It uses localStorage to retain that information for next time.

When you fill out the form, the hyperlink at the bottom is dynamically updated. I suggest you alt-click the link when you're ready, so the login page appears in a new browser window.


If you have an authorization_code flow (response_type=code), after you login and consent, you will get a code.  Copy the code, then return to the link-builder page.  Paste the code into the form at the bottom.  The very bottom of the page will show a curl command that will redeem the code for an oauth token. Click the "copy" button and run that curl command from the terminal to retrieve the token.


## ID Tokens

JWT are tokens, that are formatted as JSON and then potentially signed. With respect to OpenID Connect, JWT are used to represent identification information about a subject, so they're called "id tokens", aka id_tokens.

JWT can be:
* unsigned. In which case they ought to be untrusted. 
* signed with a private key. (RSA-256) These can be verified with the corresponding public key. 
* signed with a secret key, via HMAC-256.  These can be verified with the secret key. 

This demonstration issues JWT that are signed with a secret key. The key used is the client_secret from the developer app in Apigee Edge  - this is a secret shared  between the app and the JWT issuer (Edge). 



## Other Info

There are 4 proxies in this package.

* *oidc-core* - Core OpenID Connect capability
* *oidc-discovery* - Supporting the Discovery part of OpenID Connect
* *oidc-userinfo* - Supporting the Userinfo part of OpenID Connect
* *oidc-session* - Custom stuff, outside the spec of OIDC, supporting the login app.

If you want to demonstrate only token or code issuance (including JWT issuance) via OIDC, then you need only the core and session proxies. This demonstration does not illustrate the userinfo or discovery pieces of OIDC. 


