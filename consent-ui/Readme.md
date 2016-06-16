# OpenID Connect sample login-and-consent app

This is a login-and-consent app that participates in the OpenID Connect flow.

## Requests handled Here

### Request for Login Form

```
GET /login?sessionid=rrt328ea-9654-2669911-1&scope=openid%20profile 
```

The sessionid is set by the OAuth token dispensary (in this case Apigee Edge).  It really is a pointed to a cache entry containing the originating (and previously validated) client_id, and scope, etc. 

The logic for the login page first inquires with Edge about the session id at a well-known endpoint : /info. If that is valid, then the page renders a login form to the user. One could imagine setting a cookie in the user browser on a "remember me?" checkbox, but I didn't implement that in this sample.

The login form is simplistic - just asks for a username and password.  It's unskinned.


### Login Form Postback

```
POST /validateLoginAndConsent
```

This is the postback from the login form. If credentials have been provided, then the app validates the user credentials. If the login succeeds, then the app renders a second page, the consent form, which requests consent from the user to release information to the app (identified by the client_id). This also ought to be stored somewhere (BaaS), but for illustration purposes, the app asks for consent each time it requests authentication. 

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


## Configuring

Check the [config](webapp/config) directory for the [config.json](webapp/config/config.json) file.  This will let you set various things:

* the endpoints for connecting into the Apigee Edge OAuth token dispensary.
* info for the user authentication system

As regards the latter, there are 3 possible user Authentication mechanisms: fake, local, usergrid.

Specify which one you want in the "authSystem" property. 
if you use usergrid, then also specify a "usergrid" property that provides the org, app, and client_id and client_secret for that org+app.  You can also optionally specify the usergrid base URI, to allow hitting commercial BaaS endpoints. By default it will use https://api.usergrid.com . 

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
    "id" : "BAADBEEF",
    "secret" : "YXSeeeeCREToHQSbA"
  },
  "authSystem" : "usergrid"
}
```

If you would like to use the local authentication, then specify authSystem = local. 
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

The third option for "authSystem", "fake", always returns success, and a static user object. 

Only one of {usergrid, local, fake} can be used.  To change, you must modify the config.json file and restart the login-and-consent server. You can include "usergrid" and "localUserDb" properties in the config at the same time - the irrelevant one will be ignored. It is the "authSystem" property that tells the app which one to use. 


## Extending

A possibly interesting axis for extension is adding authentication services. 
One could imagine including an LDAP user authentication function.
See the [userAuthentication.js](webapp/lib/userAuthentication.js) file for details. 



## Further Notes

* Apigee Edge can integrate with a login-and-consent app for OpenID Connect can be implemented in any language.
We used nodejs here just because it's easy.

* This login-and-consent app is a demonstration, and should not be used in production. It exhibits insecure behavior. For example, it logs inbound POST payloads, which themselves contain passwords. It also allows the form postback to specify userinfo and other data, rather than relying on server-side cookies. DO NOT use this app for production.

