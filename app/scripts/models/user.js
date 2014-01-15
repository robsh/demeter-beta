/*global sbc2, Backbone*/

sbc2.Models = sbc2.Models || {};

(function () {
    'use strict';

    sbc2.Models.UserModel = Backbone.Model.extend({

    	initializer: function(){

            var self = this;
    		this.firebase = new Firebase('https://sbc.firebaseio.com/');
            this.auth = new FirebaseSimpleLogin(this.firebase, function(error, user) {
                self.handleAuth(error, user)
            });

            window.user = this;

    	},

        handleAuth : function(error, user){
            if (error) this.trigger('loginFailed', error)

            else if (user) {
                this.set({'id' : user.id})
                this.set({'provider' : user.provider})
                this.set({'firebaseAuthToken' : user.firebaseAuthToken})
                this.set({'md5_hash' : user.md5_hash})
                this.set({'uid' : user.uid})
                this.set({'email' : user.email})
                this.trigger('login')
            }

            else this.trigger('needLogin')
        },

    	login : function(callback){
    		this.auth.login('password', {
                email: this.get('email'),
                password: this.get('password'),
                rememberMe: this.get('rememberMe')
            });
    	},

    	logout : function(){
    		this.auth.logout()
    		window.location.reload()
    	},

    	signup : function(callback){
    		var self = this
    		this.auth.createUser(this.get('email'), this.get('password'), function(error, user) {

    			console.log(error, user)
    			if(error) callback(error)
  				if (!error) self.login()
			});
    	}



    });

})();