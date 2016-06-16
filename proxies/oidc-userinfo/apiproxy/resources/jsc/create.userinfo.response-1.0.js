var scope= context.getVariable("accesstoken.scope");
var scopes;
var userInfo={};

var given_name = context.getVariable("given_name");
var family_name = context.getVariable("family_name");
var name = context.getVariable("name");
var gender = context.getVariable("gender");
var picture = context.getVariable("picture");
var sub = context.getVariable("accesstoken.sub");
var preferred_username = context.getVariable("username");
var email = context.getVariable("email");

if (scope != null){
	scopes=scope.split(" ");

  for (var i in scopes){
      if (scopes[i] == "profile"){
          
          buildUserInfoObject("sub", sub);
          buildUserInfoObject("name", name);
          buildUserInfoObject("family_name", family_name);
          buildUserInfoObject("given_name", given_name);
          buildUserInfoObject("picture", picture);
          buildUserInfoObject("gender", gender);
          buildUserInfoObject("preferred_username", preferred_username);
        	
      }
      if (scopes[i] == "email"){
          buildUserInfoObject("email", email);
          userInfo["email_verified"]="true";
  
      }
  }
  
}

context.setVariable("userInfoResponse", JSON.stringify(userInfo));

function buildUserInfoObject(attribute, claim){
	if (claim!=null && claim!=""){
		userInfo[attribute]=claim;
	}

} 
