/*global demeter, Backbone*/

demeter.Models = demeter.Models || {};

(function () {
    'use strict';

    demeter.Models.AppModel = Backbone.Model.extend({

    	initialize : function(){
    		this.set({'user' : Parse.User.current()})
    	},

    });

})();
