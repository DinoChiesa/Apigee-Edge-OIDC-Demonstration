# OpenID Connect sample login-and-consent app

This is a login-and-consent app that participates in the OpenID Connect flow.
This is a web application, implemented in nodejs. It is used for demonstration purposes.


## How does it work?

First, the client app must embed within itself a URL that points to Edge, of a well-known form, which is used to kick off a request-for-token according to OpenID Connect. This looks like:

```
https://server/basepath/authorize?
client_id=CLIENTID&
redirect_uri=http://REDIRECT_URI_FOR_THE_CLIENT_ID&
response_type=RESPONSE_TYPE&
state=STATE&
scope=openid+profile&
nonce=C1234
```

This is just standard OpenID Connect stuff. This initial request gets handled by Edge, which does some basic validation, then generates a session id, and redirects (302) the client app to the registered "login and consent" webapp for the system.  When the browser follows that 302 is when this webapp first receives a request.

At that point, the interaction with this webapp starts. The webapp:

* receive a `GET /login` request. (This is via the initiating 302 redirect from Edge)
* verifiy the inbound request (sessionid created by Edge, the token dispensary, and client_id).  It does this by calling the "Session" API Exposed by Edge.
* if verified, present the login form to the user
* verify user credentials. The authentication service is pluggable. 
* if user creds are valid , present a consent form.  "Do you consent, user?"
* if consent granted, post to Edge to get the redirect URL,
* pass redirect (302) location back to browser


After that, the webapp is finished. The browser follows the 302, which gives the app the token, the code, the id_token, etc. 

*If the client app has requested a response_type of code*, then there is an additional step that must be followed: redeem the code for an opaque access token.  This is done with a request sent to Edge. It's outside the scope of responsibility of the webapp.


## Configuring the webapp

Check the [config](webapp/config) directory for the [config.json](webapp/config/config.json) file.  This will let you set various things:

* the endpoints for connecting into the Apigee Edge OAuth token dispensary.
* info for the user authentication system

As regards the latter, there are 3 possible user Authentication mechanisms: fake, local, usergrid.

Specify which one you want in the "authSystem" property. 
if you use usergrid, then also specify a "usergrid" property that provides the org, app, and client_id and client_secret for that org+app.  You can also optionally specify the usergrid base URI, via the uri property, to allow the use of BaaS endpoints. If you do not specify a uri property, the system will use https://api.usergrid.com . 

Example:

```
{
  "authEndpoint" : "https://webmd-eval1-test.apigee.net/E1A50130-A38A-4D0C-A365-3A6CCFF80523/oauth2/auth",
  "sessionApi" : {
    "endpoint" : "https://webmd-eval1-test.apigee.net/E1A50130-A38A-4D0C-A365-3A6CCFF80523/session",
    "apikey" : "i8OY9r3ikjwdksjdkdjRVzB5yvvNJ6h6OhwI"
  },
  "usergrid" : {
    "org": "somebody",
    "app" : "sandbox",
    "uri": "https://myspecial-apibaas-prod.apigee.net/appservices",
    "id" : "BAADBEEF",
    "secret" : "YXSeeeeCREToHQSbA"
  },
  "authSystem" : "usergrid"
}
```

If you would like to use the local authentication option, then specify authSystem = local. 
In the same diirectory, the [localUserDb.js](webapp/config/localUserDb.js) file contains the user database - which is just an object that maps from usernames to objects that contain: password hash, uuid, motto, and other things for each user. This can be used if you wish to authenticate with a database that is "local" with respect to the nodejs server.  

Example:

```
{
  "authEndpoint" : "https://webmd-eval1-test.apigee.net/E1A50130-A38A-4D0C-A365-3A6CCFF80523/oauth2/auth",
  "sessionApi" : {
    "endpoint" : "https://webmd-eval1-test.apigee.net/E1A50130-A38A-4D0C-A365-3A6CCFF80523/session",
    "apikey" : "i8OY9r3ikjwdksjdkdjRVzB5yvvNJ6h6OhwI"
  },
  "localUserDb" : "../config/localUserDb.js",
  "authSystem" : "local"
}
```

Notice that the endpoints for Apigee Edge are the same - only the info for authentication is different. 

When using the localUserDb option, you are free to change that local user database, to modify the users, their passwords, or the metadata associated to them. Just keep the basic form.


The third option for "authSystem", "fake", always returns success in response to a user authentication request regardless of the credentials sent in. It returns a static user object. 

Only one of {usergrid, local, fake} can be used.  To change, you must modify the config.json file and restart the login-and-consent server. You can include the "usergrid" and "localUserDb" properties in the config at the same time - the irrelevant one will be ignored. It is the "authSystem" property that tells the login-and-consent app which one to use. 


## Tools

There is a [tools](tools) subdirectory that contains 2 command-line tools helpful when fiddling around with user authentication.

*  `authenticateUser.js` - allows you to test user credentials.  Helpful in ensuring your BaaS connection is correct, or that you've configured the localUserDb.js thing correctly.  It work with all three pluggable authentication subsystems.

* `setUserPasswordInUsergrid.js` - allows you to set a user password in Usergrid. The user must exist. 




## What's with the Procfile?

That [Procfile](webapp/Procfile) file is used for Heroku. You don't need it if you are not hosting this webapp on Heroku. 



## Extending

A possibly interesting axis for extension is adding authentication services. 
One could imagine including an LDAP user authentication function.
See the [userAuthentication.js](webapp/lib/userAuthentication.js) file for details. 

Another avenue for extension is to use cookies to retain login status or etc. And Maybe extend to use BaaS or some other store to retain the consent decision. In a real app, the consent would need to be revokable, as well. 



## Further Notes

* Apigee Edge can integrate with a login-and-consent app for OpenID Connect can be implemented in any language.
We used nodejs here just because it's easy.

* This login-and-consent app is a demonstration, and should not be used in production. It exhibits insecure behavior. For example, it logs inbound POST payloads, which themselves contain passwords. It also allows the form postback to specify userinfo and other data, rather than relying on server-side cookies. DO NOT use this app for production.




## Appendix: Requests handled Here

You ought to be able to use this webapp as-is, with just the configuration described above. 
In most circumstances, there ought be no reason to have to dig into the code.  Even so, for clarity and completeness, I've written up a quick description of the inbound requests handled by this web app.  For all inbound requests not described below here, this webapp issues a 404. 


### Request for Login Form

```
GET /login?sessionid=rrt328ea-9654-2669911-1&scope=openid%20profile 
```

The sessionid is set by the OAuth token dispensary (in this case Apigee Edge).  It really is a pointer to a cache entry held in Edge containing the originating (and previously validated) client_id, and scope, etc. 

The logic for the login page first inquires with Edge about the session id at a well-known endpoint : /info. If that is valid, then the page renders a login form to the user. One could imagine setting a cookie in the user browser containing settings from "remember me" and "keep me logged in" checkboxes, so that the user need not login *every time*, and if he is logging in, then he gets prompted with his username or even a profile photo (a la Google signin).  But I didn't implement that in this sample.  (PRs accepted!)

The login form is simplistic - just asks for a username and password. It's currently unskinned.  You could skin it pretty easily. 


### Login Form Postback

```
POST /validateLoginAndConsent
```

This is the postback from the login form. If credentials have been provided, then the app validates the user credentials against some user authentication service. This service is pluggable (more on that later in the "Configuring" section).  If the user is valid, then the app renders a second page, the consent form, which requests consent from the authenticated user to allow release of some information to the app, which is identified by the client_id. The consent form tries to show a logo for the app, a logo which is associated to the client_id. 

This consent decision also ought to be stored somewhere (for example, BaaS), but for illustration purposes, the app asks for consent each time it requests authentication. 

The form payload for this form includes:

* username
* password
* sessionid
* client_id
* response_type (code, id_token, token)
* requestedScopes (eg "openid profile")
* redirect_uri
* clientState
* appName
* appLogoUrl

Most of these are hidden fields that are posted back transparently.


### Consent Form Postback

```
POST /grantConsent
```

This is the postback for the consent form.
The form contents include:

* sessionid
* client_id
* response_type
* requestedScopes
* redirect_uri
* clientState
* appName
* userProfile - a base64-encoded string containing user info from the authentication service. (This is insecure, but it's just a demo. Normally you'd want this in a cookie. 


If the user has granted consent, then the login-and-consent app posts to the auth endpoint (on Edge) to get the redirect URL for this OpenID Connect session. The login-and-consent app then responds to the user-agent with a 302, using that redirect URL as the Location header.

