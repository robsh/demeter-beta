/*global demeter, Backbone, JST*/

demeter.Views = demeter.Views || {};

(function () {
    'use strict';

    demeter.Views.AppView = Backbone.View.extend({

        template: JST['app/scripts/templates/app.ejs'],

        initialize : function(){
            this.render()
            this.initializeRouter()

            var self = this
            $('.nav').click(function(e){
                e.preventDefault()
                var link = e.target.hash.slice(1)
                self.model.get('router').navigate(link, {trigger: true})
            })

        },

        render : function(){

            this.userView = new demeter.Views.UserView({
                el : $('.user'),
                model : this.model.get('user')
            })

            this.reviewView = new demeter.Views.ReviewView({
                el : $('.review'),
                model : new demeter.Models.ReviewModel()
            })

            this.mapView = new demeter.Views.MapView({
                el : $('.map'),
                model : new demeter.Models.MapModel()
            })

            // this.searchView = new demeter.Views.SearchView({
            //     el : $('.search'),
            //     model : new demeter.Models.SearchModel()
            // })

            this.currentView = this.reviewView
            this.writereviewview()

        },

        initializeRouter : function(){
            var self = this;
            var Router = Backbone.Router.extend({
                routes: {
                      "logout" : "logout",
                      // "*path" : "navigate"
                },

                navigate: function(path) {
                    switch(path){
                        case "writereview":
                            self.writereviewview()
                            break;
                        case "search":
                            self.searchview()
                            break;
                        default:
                            break;
                    }
                },

                logout : function(){ self.logout() },
                writereview : function(){ self.writereview() },

            });

            this.model.set({'router' : new Router()})
            Backbone.history.start();

        },

        logout : function(){
            Parse.User.logOut();
            window.location = ''
        },

        writereviewview : function(){
            $(this.currentView.el).addClass('hidden')
            $(this.reviewView.el).removeClass('hidden')
            this.currentView = this.reviewView
        },

        searchview : function(){
            $(this.currentView.el).addClass('hidden')
            $(this.searchView.el).removeClass('hidden')
            this.currentView = this.searchView
        }

    });

})();
