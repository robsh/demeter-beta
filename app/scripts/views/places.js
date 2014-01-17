/*global demeter, Backbone, JST*/

demeter.Views = demeter.Views || {};

(function () {
    'use strict';

    demeter.Views.PlacesView = Backbone.View.extend({

        template: JST['app/scripts/templates/places.ejs'],

        initialize : function(){

        	this.$number = $(this.el).find('#number')
        	this.$inner_el = $(this.el).find('.places-inner')
        	this.$flash = $(this.el).find('.flash')
        	demeter.Vent.on('mapPoint', function(centerPoint){
        		this.centerPoint = centerPoint
        	}, this)

        	demeter.Vent.on('serviceInitialized', function(service){
        		this.service = service
        	}, this)

        	this.j = 0
        },

        performSearch : function(){
        	var self = this

        	var point = new google.maps.LatLng(this.centerPoint.latitude, this.centerPoint.longitude)
					var request = {
						location : point,
						radius : demeter.Parameters.radius*1000,
						types : ['food', 'restaurant']
					};

					this.service.radarSearch(request, function(results, status){
					    self.placesSearchCallback(results, status)
					});

        },

        placesSearchCallback : function(results, status) {
            if (status != google.maps.places.PlacesServiceStatus.OK)
                return;
            this.savePlaces(results)
        },

				savePlaces : function(places){
						var self = this
				    _.each(places, function(place,i){
				        var establishment = new demeter.Models.EstablishmentModel()
				        establishment.set('gid', place.id)
				        establishment.set('fresh', true)
				        establishment.set('reference', place.reference)

				        var point = new Parse.GeoPoint({latitude: place.geometry.location.lat(), longitude: place.geometry.location.lng()});
				        establishment.set('geo_location', point)

				        establishment.save(null, {
			            success : function(response, something){
			            	var json = response.toJSON()
			            	var point = new google.maps.LatLng(json.geo_location.latitude, json.geo_location.longitude)

			            	self.j = self.j + 1

			            	self.$number.html(self.j)
			            	demeter.Vent.trigger('makeMarkerGoogPoint', point)
			            },
			            error : function(response, something){}
				        })
				    })

				    this.$flash.removeClass('hidden')

				    setTimeout(function(){
				    	location.reload()
				    }, 1000*60*4)


				},




    });

})();
