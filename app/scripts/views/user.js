/*global demeter, Backbone, JST*/

demeter.Views = demeter.Views || {};

(function () {
    'use strict';

    demeter.Views.UserView = Backbone.View.extend({

        template: JST['app/scripts/templates/user.ejs'],

        initialize : function(){
            this.render()
            demeter.Vent.on('login', function(){
                this.render()
            }, this)
        },

        render : function(){
            if (Parse.User.current()) {
                $(this.el).empty().append(this.template({model : Parse.User}))
            } else {
                this.needsLogin()
            }
        },

        needsLogin : function(){

        	new demeter.Views.LoginView({
        		el : this.el,
        		model : this.model
        	})

        	new demeter.Views.SignupView({
        		el : this.el,
        		model : this.model
        	})
        }

    });

})();
