/*global demeter, Backbone, JST*/

demeter.Views = demeter.Views || {};

(function () {
    'use strict';

    demeter.Views.MapView = Backbone.View.extend({

        template: JST['app/scripts/templates/map.ejs'],

        initialize : function(){
            this.radius = 3;

            this.scaleMap()
            this.initializeEvents()
            this.initializeMap()
        },

        initializeMap : function(){
            $('#over_map').removeClass('hidden')

            this.markers = []

            this.map = new google.maps.Map(document.getElementById('map_canvas'), {
                center: new google.maps.LatLng(51.8972, -8.47),
                zoom: 13,
            });


            var input = (document.getElementById('pac-input'));
            this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

            var bounds = new google.maps.LatLngBounds();
            var c = bounds.getCenter()
            this.center = new google.maps.LatLng(c.b, c.d)

            this.infoWindow = new google.maps.InfoWindow();
            this.service = new google.maps.places.PlacesService(this.map);
            // this.searchBox = new google.maps.places.SearchBox((input));

            this.centerPoint = new Parse.GeoPoint({latitude: 51.8972, longitude: -8.47});
            demeter.Vent.trigger('mapPoint', this.centerPoint)

            this.initializeMapEvents()
        },

        initializeEvents : function(){
            var self = this
            $( window ).resize(function() { self.scaleMap() })
        },

        initializeMapEvents : function(){
            var self = this

            google.maps.event.addListenerOnce(this.map, 'idle', function(){
                self.performSearch()
                // $('#pac-input').removeClass('hidden')
            });

            // google.maps.event.addListener(this.searchBox, 'places_changed', function() {
            //     self.afterLocationChange()
            //     self.performSearch()

            //     var point = new Parse.GeoPoint({latitude: self.map.getBounds().getCenter().lat(), longitude: self.map.getBounds().getCenter().lng()});
            //     demeter.Vent.trigger('mapPoint', point)
            // })
        },

        afterLocationChange : function(){
            var places = this.searchBox.getPlaces();

            for (var i = 0, marker; marker = this.markers[i]; i++) {
                marker.setMap(null);
            }

            // For each place, get the icon, place name, and location.
            var bounds = new google.maps.LatLngBounds();
            for (var i = 0, place; place = places[i]; i++) {
                var image = {
                    url: place.icon,
                    size: new google.maps.Size(71, 71),
                    origin: new google.maps.Point(0, 0),
                    anchor: new google.maps.Point(17, 34),
                    scaledSize: new google.maps.Size(25, 25)
                };

                // Create a marker for each place.
                var marker = new google.maps.Marker({
                    map: self.map,
                    icon: image,
                    title: place.name,
                    position: place.geometry.location
                });

                this.markers.push(marker);

                bounds.extend(place.geometry.location);
            }
            var c = bounds.getCenter()
            this.center = new google.maps.LatLng(c.b, c.d)
            this.map.fitBounds(bounds);
        },

        performSearch : function() {
            var self = this;
            var request = {
                location : this.map.getBounds().getCenter(),
                radius : this.radius*1000,
                types : ['food', 'restaurant']
            };

            this.service.radarSearch(request, function(results, status){
                self.placesSearchCallback(results, status)
            });
        },

        placesSearchCallback : function(results, status) {
            if (status != google.maps.places.PlacesServiceStatus.OK)
                return;

            this.savePlacesCondition(results)

            for (var i = 0, result; result = results[i]; i++) {
                this.createMarker(result);
            }
        },

        scaleMap : function(){
            this.mapCanvas = $('#map_canvas');

            if(window.innerWidth < 1200) $(this.el).height('70%')
            else $(this.el).height('100%')

            this.mapCanvas.width(this.mapCanvas.parent().width())
            this.mapCanvas.height('100%')
        },

        createMarker : function(place) {
            var self = this
            var marker = new google.maps.Marker({
                map: self.map,
                position: place.geometry.location,
                icon: 'https://maps.google.com/mapfiles/marker.png'
            });

            google.maps.event.addListener(marker, 'click', function() {
                self.service.getDetails(place, function(result, status) {
                    if (status != google.maps.places.PlacesServiceStatus.OK) {
                        alert(status);
                        return;
                    }
                    self.infoWindow.setContent(result.name);
                    self.infoWindow.open(self.map, marker);
                });
            });
        },

        savePlacesCondition : function(places){
            var self = this
            var point = new Parse.GeoPoint({latitude: this.map.getBounds().getCenter().lat(), longitude: this.map.getBounds().getCenter().lng()});
            var query = new Parse.Query(demeter.Models.EstablishmentModel)
            query.withinKilometers('geo_location', point, this.radius)
            query.count({
                success : function(count){
                    if(count < 10){
                        self.savePlaces(places)
                    }
                }
            })
        },

        savePlaces : function(places){

            var establishments = []

            _.each(places, function(place,i){
                var establishment = new demeter.Models.EstablishmentModel()
                establishment.set('gid', place.id)
                establishment.set('fresh', true)
                establishment.set('reference', place.reference)

                var point = new Parse.GeoPoint({latitude: place.geometry.location.lat(), longitude: place.geometry.location.lng()});
                establishment.set('geo_location', point)
                establishment.save(null, {
                    success : function(response, something){
                        // console.log(response, something)
                    }, error : function(response, something){
                        console.log(something.message)
                    }})
                establishments.push(establishment)
            })
        },

    });

})();
