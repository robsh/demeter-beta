/*global sbc2, Backbone*/


sbc2.Models = sbc2.Models || {};

(function () {
    'use strict';

    sbc2.Models.AppModel = Backbone.Model.extend({

    	initialize : function(){
        this.set({'user': new sbc2.Models.UserModel()})
          this.get('user').on('login', function(){
          this.initializeRouter()
          this.initializeModels()
        }, this)
    	},

    	initializeRouter : function(){
    		var self = this
            var router = Backbone.Router.extend({
                navigate: function(path) {
                    switch (path){
                        case "logout":
                            self.logout()
                            break
                        case "pdf":
                            self.pdf()
                            break
                        case "word":
                            self.word()
                            break
                        case "clear":
                            self.clearDocument()
                            break
                        default:
                            self.navigate(path)
                            break
                    }
                },
            });
            this.set({'router' : new router()})
            Backbone.history.start({})
    	},

    	initializeModels : function(){
    		this.set({
    			'document' : new sbc2.Models.DocumentModel({}, {
    				firebase: new Firebase("https://sbc.firebaseio.com/" + this.get('user').toJSON().id)
    			})
    		})
    	},

    	navigate : function(path){
    		this.trigger('navigate', path)
    	},

        logout : function(){
            this.get('user').logout()
            window.location.reload()
        },

        clearDocument : function(){
            // this.trigger('clear')
        },

        pdf : function(){
            this.trigger('download', 'pdf')
        },

        word : function(){
            this.trigger('download', 'word')
        },


    });

})();
