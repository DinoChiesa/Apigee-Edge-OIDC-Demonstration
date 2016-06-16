// maybeFormatFault.js
// ------------------------------------------------------------------
//
// maybe format a fault message if one is not present.
//
// created: Tue Jan 26 14:07:19 2016
// last saved: <2016-January-26 14:17:11>

var handled = context.getVariable('fault_handled');
if ( ! handled ) {
  var error = response.content.asXML.error;
  var t = typeof error;
  print('typeof error: ' + t);
  if (t == 'undefined') {
    response.content = '<error><code>1001</code><message>unknown error</message></error>';
  }
  context.setVariable('fault_handled', true);
}
