/*global sbc2, Backbone, JST*/

sbc2.Views = sbc2.Views || {};

(function () {
    'use strict';

    sbc2.Views.LoginView = Backbone.View.extend({

        template: JST['app/scripts/templates/login.ejs'],

        initialize : function(){
        	this.render()
        },

        render : function(){
        	this.$form = $(this.el).find('form')
        	this.$link = $('.signup-link')

        	this.$email = $(this.el).find('#inputEmail')
        	this.$password = $(this.el).find('#inputPassword')
        	this.$rememberMe = $(this.el).find('#rememberMe')
        	this.$flash = $(this.el).find('#flash')
            this.$icon = $(this.el).find('i')

        	var self = this;
        	this.$link.click(function(e){
        		e.preventDefault()
        		self.trigger('changePage')
        	})

        	this.$form.submit(function(e){
        		self.submit(e)
        	})

        	this.model.on('loginFailed', function(error){
        		this.submitCallback(error)
        	}, this)

        	this.model.on('login', function(){
        		this.hide()
        	}, this)
        },

        submit : function(e){
        	e.preventDefault()

            this.$icon.removeClass('hidden')

        	this.model.set({'email' : this.$email.val()})
        	this.model.set({'password' : this.$password.val()})
        	this.model.set({'rememberMe' : this.$rememberMe.is(':checked')})

        	this.$flash.hide()
        	this.model.login()
        },

        submitCallback : function(error){
            this.$icon.addClass('hidden')
        	this.$flash.html(error.code).show()
        },

        show : function(){
        	$(this.el).removeClass('hidden')
        },

        hide : function(){
        	$(this.el).addClass('hidden')
        }

    });

})();