/*global demeter, Backbone, JST*/

demeter.Views = demeter.Views || {};

(function () {
    'use strict';

    demeter.Views.AppView = Backbone.View.extend({

        template: JST['app/scripts/templates/app.ejs'],

        initialize : function(){
            this.establishments = new demeter.Collections.EstablishmentCollection()

            this.initializeRouter()
            this.initializeBeforeRenderEvents()
            this.render()
            this.initializeAfterRenderEvents()


        },
        initializeBeforeRenderEvents : function(){
            demeter.Vent.on('establishment_click', function(model){ this.establishmentview(model) }, this)
            demeter.Vent.on('establishment_click_sname', function(sname){ this.establishmentview_by_sname(sname) }, this)
            demeter.Vent.on('establishments_list', function(collection){ this.establishmentsview(collection) }, this)

            demeter.Vent.on('hashtag_list', function(hashtag){ this.make_reviewList_view(hashtag) }, this)
            demeter.Vent.on('nav', function(link){ this.model.get('router').navigate(link, {trigger: true}) }, this)
            demeter.Vent.on('writereview', function(establishment){ this.writereviewview(establishment) }, this)
            demeter.Vent.on('mapPoint', function(centrePoint){ this.initializeCollection(centrePoint) }, this)

            demeter.Vent.on('establishments_fetch_failed', function(collection){ this.establishmentsFetchFailed() }, this)
        },

        initializeCollection : function(centrePoint){
            var query = new Parse.Query(demeter.Models.EstablishmentModel)
            this.establishments.query = query
            this.establishments.query.withinKilometers('geo_location', centrePoint, 3)
            this.establishments.fetch({
                success : function(response){
                    if(response.length < 10) demeter.Vent.trigger('establishments_fetch_failed')
                    else demeter.Vent.trigger('establishments_fetch')
                }
            })
        },

        initializeAfterRenderEvents : function(){
            var self = this
            $('.nav').click(function(e){ self.navigate(e) })
        },

        render : function(){

            this.placesView = new demeter.Views.PlacesView({
                el : $('.places')
            })

            this.userView = new demeter.Views.UserView({
                el : $('.user'),
                model : this.model.get('user')
            })

            this.reviewView = new demeter.Views.ReviewView({
                el : $('.review'),
                model : new demeter.Models.ReviewModel(),
                establishments : this.establishments
            })

            this.reviewListView = new demeter.Views.ReviewlistView({
                el : $('.reviewList'),
                // model : new demeter.Models.ReviewModel(),
                establishments : this.establishments
            })

            this.searchView = new demeter.Views.SearchView({
                el : $('.search'),
                model : new demeter.Models.SearchModel(),
                establishments : this.establishments
            })

            this.establishmentView = new demeter.Views.EstablishmentView({
                el : $('.establishment'),
                model : new demeter.Models.EstablishmentModel()
            })

            this.establishmentListView = new demeter.Views.EstablishmentListView({
                el : $('.establishmentList')
            })

            this.mapView = new demeter.Views.MapView({
                el : $('.map'),
                model : new demeter.Models.MapModel(),
                establishments : this.establishments
            })



            this.currentView = this.searchView
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

        navigate : function(e){
            if(!_.isUndefined(e)) e.preventDefault()
            var link = e.target.hash.slice(1)
            this.model.get('router').navigate(link, {trigger: true})
        },

        writereviewview : function(establishment){

            if(!_.isUndefined(establishment)) this.reviewView.populate(establishment)

            $(this.currentView.el).addClass('hidden')
            $(this.reviewView.el).removeClass('hidden')
            this.currentView = this.reviewView
        },

        searchview : function(){
            demeter.Vent.trigger('reset_markers')
            $(this.currentView.el).addClass('hidden')
            $(this.searchView.el).removeClass('hidden')
            this.currentView = this.searchView
        },

        make_reviewList_view : function(hashtag){
            demeter.Vent.trigger('reset_markers')
            $(this.currentView.el).addClass('hidden')
            $(this.reviewListView.el).removeClass('hidden')
            this.currentView = this.reviewListView
            this.reviewListView.setHashtag(hashtag)
        },

        establishmentview_by_sname : function(sname){
            var model = this.establishments.filter(function(establishment){ return establishment.get('sname')===sname })[0]
            this.establishmentview(model)
        },

        establishmentview : function(model){
            $(this.currentView.el).addClass('hidden')
            this.establishmentView.setPlace(model)
            $(this.establishmentView.el).removeClass('hidden')
            this.currentView = this.establishmentView
        },

        establishmentsview : function(collection){
            $(this.currentView.el).addClass('hidden')
            this.establishmentListView.setCollection(collection)
            $(this.establishmentListView.el).removeClass('hidden')
            this.currentView = this.establishmentListView
        },

        establishmentsFetchFailed : function(){
            $(this.placesView.el).removeClass('hidden')
            this.placesView.performSearch()
        },

    });

})();
