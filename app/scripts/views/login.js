/*global demeter, Backbone, JST*/

demeter.Views = demeter.Views || {};

(function () {
    'use strict';

    demeter.Views.LoginView = Backbone.View.extend({

        template: JST['app/scripts/templates/login.ejs'],

        events : {
        	'click .login-button' : 'loginButtonClick',
            'click .transfer-modal-login' : 'transferModal'
        },

        initialize : function(){
        	$(this.el).append(this.template())

            $(this.el).find('.login-button').removeClass('hidden')
        	this.$modal = $(this.el).find('#loginModal')
            this.$facebookLoginButton = this.$modal.find('a[href$=#facebook-login]')
            this.$loginSubmitButton = this.$modal.find('.login-submit-button')
            this.$emailInput = this.$modal.find('.email-input')
            this.$passwordInput = this.$modal.find('.password-input')
            this.$flash = this.$modal.find('.flash')
            this.initializeEvents()
        },

        initializeEvents : function(){
            var self = this;
            this.$facebookLoginButton.click(function(e){ self.facebookLogin(e) })
            this.$loginSubmitButton.click(function(e){ self.emailLogin(e) })

            // this allows us to show the login screen from anywhere in the app.
            demeter.Vent.on('loginRequest', function(msg){
                this.setTitle(msg)
                this.loginButtonClick()
            }, this)
        },

        loginButtonClick : function(e){
        	if(!_.isUndefined(e)) e.preventDefault()
        	this.$modal.modal()
        },

        killModal : function(){
            this.$modal.modal('toggle')
            $('.modal-backdrop').remove();
        },

        transferModal : function(e){
            e.preventDefault()
            this.killModal()
            demeter.Vent.trigger('signupRequest', 'Sign up')
        },

        setTitle : function(msg){
            this.$modal.find('.modal-title').text(msg)
        },

        emailLogin : function(e){
            e.preventDefault()

            var self = this
            var previousHTML = this.$loginSubmitButton.html()
            this.$loginSubmitButton.html('<i class="fa fa-spin fa-spinner"></i> Login')

            var email = this.$emailInput.val()
            var password = this.$passwordInput.val()
            Parse.User.logIn(email, password, {
                success: function(user) {
                    self.$loginSubmitButton.html(previousHTML)
                    self.loginSuccess()
                },
                error: function(user, error) {
                    self.$loginSubmitButton.html(previousHTML)
                    self.$flash.text(error.message)
                }
            });
        },

        facebookLogin : function(e){
            var self = this;
            e.preventDefault()

            this.$facebookLoginButton.find('i').removeClass('fa-facebook-square').addClass('fa-spinner fa-spin')

            Parse.FacebookUtils.logIn(null, {
                success: function(user) {
                    if(!user.existed()){
                        self.facebookPopulateDetails()
                    }
                    self.loginSuccess()
                },
                error: function(user, error) {
                    this.$facebookLoginButton.find('i').addClass('fa-facebook-square').removeClass('fa-spinner fa-spin')
                    self.loginFailure()

                }
            });
        },

        loginSuccess : function(){
            this.killModal()
            this.modal = Parse.User.current()
            demeter.Vent.trigger('login')
        },

        loginFailure : function(){

        },

        facebookPopulateDetails : function(){
            var user = Parse.User.current()
            FB.api('/' + user.toJSON().authData.facebook.id, function(res){
                user.set('fid', res.id)
                user.set('name', res.name)
                user.set('fusername', res.username)
                user.set('location', res.location)
                user.set('link', res.link)
                user.save()
            })
        }

    });

})();
