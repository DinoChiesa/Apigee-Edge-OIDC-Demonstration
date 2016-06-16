// link-builder-page.js
// ------------------------------------------------------------------
//
// page logic for link-builder.html and link-builder2.html
//
// created: Thu Oct  1 13:37:31 2015
// last saved: <2016-June-15 20:32:54>


var model = model || {
      apihost : '',
      edgeorg : '',
      edgeenv : '',
      clientid : '',
      cburi : '',
      state : '',
      rtype : [],
      scope : []
    };

// for localstorage
var html5AppId = html5AppId || "43C9BB71-3E94-441C-B7F5-7FAE6FCD8458";
var linkTemplate = linkTemplate || "http://${edgeorg}-${edgeenv}.apigee.net/oauth2/v1/authorize?client_id=${clientid}&redirect_uri=${cburi}&response_type=${rtype}&state=${state}&scope=${scope}";


function wrapInSingleQuote(s) {return "'" + s + "'";}

function updateLink() {
  var link = linkTemplate;
  Object.keys(model).forEach(function(key) {
    var pattern = "${" + key + "}", value = '';
    if (model[key]) {
      value = (typeof model[key] != 'string') ? model[key].join('+') : model[key];
      // set into local storage
      if (value) {
        console.log('setting into LS: ' + key + '= ' + value);
        window.localStorage.setItem(html5AppId + '.model.' + key, value);
      }
    }
    link = link.replace(pattern,value);
  });
  $('#authzlink').text(link);
  $('#authzlink').attr('href', link);

  if ($('#redeemCode').length > 0) {
    var re1 = new RegExp('/authorize.+');
    var newUrl = link.replace(re1, '/token');
    var payload = 'grant_type=authorization_code&code=' + model.code;

    $('#redeemCode').text('curl -X POST -H content-type:application/x-www-form-urlencoded -u ' +
                          model.clientid + ':' + model.clientsecret + ' ' +
                          wrapInSingleQuote(newUrl) + ' -d ' + wrapInSingleQuote(payload));
  }
}

function onInputChanged() {
  var $$ = $(this), name = $$.attr('id'), value = $$.val();
  model[name] = value;
  updateLink();
}

function onSelectChanged() {
  var $$ = $(this), name = $$.attr('name'), values = [];
  $$.find("option:selected" ).each(function() {
    values.push($( this ).text());
  });
  model[name] = values;
  updateLink();
}

function updateModel(event) {
  Object.keys(model).forEach(function(key) {
    var $item = $('#' + key), value = $item.val();
    model[key] = value;
  });
  updateLink();

  if (event)
    event.preventDefault();
}

function populateFormFields() {
  // get values from local storage, and place into the form
  Object.keys(model).forEach(function(key) {
    var value = window.localStorage.getItem(html5AppId + '.model.' + key);
    if (value && value !== '') {
      var $item = $('#' + key);
      if (typeof model[key] != 'string') {
        // the value is a set of values concatenated by +
        // and the type of form field is select.
        value.split('+').forEach(function(part){
          $item.find("option[value='"+part+"']").prop("selected", "selected");
        });
      }
      else {
        // value is a simple string, form field type is input.
        $item.val(value);
      }
    }
  });
}


$(document).ready(function() {
  $('.rtype-chosen').chosen({
    no_results_text: "No matching response types...",
    allow_single_deselect: true
  });
  $('.scope-chosen').chosen({
    no_results_text: "No matching scopes...",
    allow_single_deselect: true
  });


  $( "form input[type='text']" ).change(onInputChanged);
  $( "form select" ).change(onSelectChanged);
  $( "form button" ).submit(updateModel);

  populateFormFields();

  if (typeof Clipboard != 'undefined') {
    // attach clipboard things
    new Clipboard('.clipboard-btn');
  }

  updateModel();

});
