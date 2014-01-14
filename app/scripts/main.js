/*global demeter, $*/

var PARSE_MASTER_KEY = "yu7JSONRyPiLdqNnB8CE4FTTRq2cX7XYpqkgXKFG"
var PARSE_JAVASCRIPT_KEY = "teZjsgnov9LixPqIl0IIXU9f3NoYE82wG8Heo8yi"
// var FACEBOOK_APP_ID = '681242878587777'
// var FACEBOOK_CHANNGEL_URL = 'http://eoinmurray.io/demeter'

/*facebook login depends of callbacks to a url, so we need seperate keys for live and dev*/
var FACEBOOK_APP_ID = '186183208245915'
var FACEBOOK_CHANNGEL_URL = 'http://localhost:9000'



/*PARSE INIT*/
Parse.initialize(PARSE_MASTER_KEY, PARSE_JAVASCRIPT_KEY);

/*FACEBOOK INIT*/
(function(){
if (document.getElementById('facebook-jssdk')) {return;}
var firstScriptElement = document.getElementsByTagName('script')[0];
var facebookJS = document.createElement('script');
facebookJS.id = 'facebook-jssdk';
facebookJS.src = '//connect.facebook.net/en_US/all.js';
firstScriptElement.parentNode.insertBefore(facebookJS, firstScriptElement);

window.fbAsyncInit = function() {
  Parse.FacebookUtils.init({
    appId      : FACEBOOK_APP_ID, // Facebook App ID
    channelUrl : FACEBOOK_CHANNGEL_URL + '/channel.html', // Channel File
    status     : false, // check login status
    cookie     : true, // enable cookies to allow Parse to access the session
    xfbml      : true  // parse XFBML
  });
};
}());


window.demeter = {}
demeter.Models = {}
demeter.Collections = {}
demeter.Views = {}
demeter.Routers = {}
demeter.Vent = _.extend({}, Backbone.Events),

demeter.init = function () {
    'use strict';
    new demeter.Views.AppView({
        el : $('.container'),
        model : new demeter.Models.AppModel()
    })
}

$(document).ready(function () {
    'use strict';
    demeter.init();
});

