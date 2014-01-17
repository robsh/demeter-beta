/*global demeter, Backbone, JST*/

demeter.Views = demeter.Views || {};

(function () {
    'use strict';

    demeter.Views.SignupView = Backbone.View.extend({

        template: JST['app/scripts/templates/signup.ejs'],

        events : {
            'click .signup-button' : 'signupButtonClick',
            'click .transfer-modal-signup' : 'transferModal'
        },

        initialize : function(){
            $(this.el).append(this.template())

            $(this.el).find('.signup-button').removeClass('hidden')
            this.$modal = $(this.el).find('#signupModal')
            this.$facebooksignupButton = this.$modal.find('a[href$=#facebook-signup]')
            this.$signupSubmitButton = this.$modal.find('.signup-submit-button')
            this.$emailInput = this.$modal.find('.email-input')
            this.$nameInput = this.$modal.find('.name-input')
            this.$passwordInput = this.$modal.find('.password-input')
            this.$flash = this.$modal.find('.flash')
            this.initializeEvents()
        },

        initializeEvents : function(){
            var self = this;
            this.$facebooksignupButton.click(function(e){ self.facebooksignup(e) })
            this.$signupSubmitButton.click(function(e){ self.emailsignup(e) })

            // this allows us to show the signup screen from anywhere in the app.
            demeter.Vent.on('signupRequest', function(msg){
                this.setTitle(msg)
                this.signupButtonClick()
            }, this)
        },

        signupButtonClick : function(e){
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
            demeter.Vent.trigger('loginRequest', 'Login')
        },

        setTitle : function(msg){
            this.$modal.find('.modal-title').text(msg)
        },

        emailsignup : function(e){
            var self = this
            var previousHTML = this.$signupSubmitButton.html()
            this.$signupSubmitButton.html('<i class="fa fa-spin fa-spinner"></i> Signup')

            var email = this.$emailInput.val()
            var password = this.$passwordInput.val()
            var name = this.$nameInput.val()

            var user = new Parse.User();
            user.set("username", email);
            user.set("password", password);
            user.set("email", email);
            user.set("name", name);

            user.signUp(null, {
                success: function(user) {
                    self.$signupSubmitButton.html(previousHTML)
                    self.signupSuccess()
                },
                error: function(user, error) {
                    self.$signupSubmitButton.html(previousHTML)
                    self.$flash.text(error.message)
                }
            });


        },

        facebooksignup : function(e){
            var self = this;
            e.preventDefault()

            this.$facebooksignupButton.find('i').removeClass('fa-facebook-square').addClass('fa-spinner fa-spin')

            Parse.FacebookUtils.logIn(null, {
                success: function(user) {
                    self.signupSuccess()
                },
                error: function(user, error) {
                    alert("User cancelled the Facebook signup or did not fully authorize.");
                }
            });
        },

        signupSuccess : function(){
            this.killModal()
            this.modal = Parse.User.current()
            demeter.Vent.trigger('login')
        }

    });

})();
