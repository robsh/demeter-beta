/*global sbc2, Backbone, JST*/

sbc2.Views = sbc2.Views || {};

(function () {
    'use strict';

    sbc2.Views.UserView = Backbone.View.extend({

        template: JST['app/scripts/templates/user.ejs'],

        initialize : function(){
            this.$login=$('.login')
            this.$blanket=$('.blanket')

            this.model.on('needLogin', function(){
                this.initializeViews()
            }, this)

            this.model.initializer()
        },

        initializeViews : function(){

            this.$blanket.addClass('hidden')
            this.$login.removeClass('hidden')

            this.loginView = new sbc2.Views.LoginView({
        		el : $(".login"),
        		model : this.model
        	})

        	this.signupView = new sbc2.Views.SignupView({
        		el : $(".signup"),
        		model : this.model
        	})

            this.loginView.on('changePage', function(){
                this.loginView.hide()
                this.signupView.show()
            }, this)

            this.signupView.on('changePage', function(){
                this.signupView.hide()
                this.loginView.show()
            }, this)

        },

        remove : function(){
            $(this.el).remove()
        }


    });

})();