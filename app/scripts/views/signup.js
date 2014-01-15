/*global sbc2, Backbone, JST*/

sbc2.Views = sbc2.Views || {};

(function () {
    'use strict';

    sbc2.Views.SignupView = Backbone.View.extend({

        template: JST['app/scripts/templates/signup.ejs'],

        initialize : function(){
        	this.render()
        },

        render : function(){
            this.$form = $(this.el).find('form')
        	this.$link = $('.login-link')
        	this.$email = $(this.el).find('#inputEmail')
        	this.$password = $(this.el).find('#inputPassword')
        	this.$rememberMe = $(this.el).find('#rememberMe')
        	this.$flash = $(this.el).find('#flash')
            this.$icon = $(this.el).find('.icon-spinner')

        	var self = this;
        	this.$link.click(function(e){
        		e.preventDefault()
        		self.trigger('changePage')
        	})

        	this.$form.submit(function(e){
        		self.submit(e)
        	})

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

        	var self = this;
        	this.$flash.hide()

        	this.model.signup(function(error){
                self.$icon.addClass('hidden')
        		self.$flash.html(error.code).show()
        	})
        },

        show : function(){
            $(this.el).removeClass('hidden')
        },

        hide : function(){
            $(this.el).addClass('hidden')
        }

    });

})();