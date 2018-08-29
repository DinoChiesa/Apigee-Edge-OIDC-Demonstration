var requestUri = context.getVariable('request.uri');
var clientScheme = context.getVariable('client.scheme');
var host = context.getVariable('request.header.host');
//{client.scheme}://{request.header.host}{request.uri}
requestUri = requestUri.substr(0, requestUri.lastIndexOf('?'));
var uri = encodeURIComponent(clientScheme + '://' + host + requestUri);
context.setVariable('oidc_server', uri);
