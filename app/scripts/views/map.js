/*global demeter, Backbone, JST*/

function getRandomArbitary (min, max) {
    return Math.random() * (max - min) + min;
}

demeter.Views = demeter.Views || {};

(function () {
    'use strict';

    demeter.Views.MapView = Backbone.View.extend({

        template: JST['app/scripts/templates/map.ejs'],

        initialize : function(opts){

            this.centerPoint = new Parse.GeoPoint({latitude: demeter.Parameters.latitude, longitude: demeter.Parameters.longitude});

            demeter.Vent.trigger('mapPoint', this.centerPoint)

            this.establishments = opts.establishments
            this.markers = []
            this.scaleMap()
            this.initializeEvents()
            this.initializeMap()
        },

        initializeMap : function(){
            $('#over_map').removeClass('hidden')

            var gCenterPoint = new google.maps.LatLng(this.centerPoint.latitude, this.centerPoint.longitude)
            this.map = new google.maps.Map(document.getElementById('map_canvas'), {
                center: gCenterPoint,
                zoom: 15,
            });

            this.map.setCenter(gCenterPoint);

            var input = (document.getElementById('pac-input'));
            this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

            this.infoWindow = new google.maps.InfoWindow();
            this.service = new google.maps.places.PlacesService(this.map);

            demeter.Vent.trigger('serviceInitialized', this.service)
            this.searchBox = new google.maps.places.SearchBox((input));

            this.initializeMapEvents()
        },

        centerMap : function(){
            var gCenterPoint = new google.maps.LatLng(this.centerPoint.latitude, this.centerPoint.longitude)
            this.map.setCenter(gCenterPoint);
        },

        initializeEvents : function(){
            var self = this
            $( window ).resize(function() { self.scaleMap() })
            demeter.Vent.on('establishments_fetch', function(){ this.setupMarkers() }, this)
        },

        initializeMapEvents : function(){
            var self = this
            demeter.Vent.on('mapPoint', function(point){ this.centerMap(point) }, this)
            google.maps.event.addListenerOnce(this.map, 'idle', function(){ self.onIdle() });
            google.maps.event.addListener(this.searchBox, 'places_changed', function() { self.onLocationChange() })

            demeter.Vent.on('makeMarkerGoogPoint', function(point){ this.markerFromPoint(point) }, this)
            demeter.Vent.on('reset_markers', function(model){ this.resetMarkers() }, this)
            demeter.Vent.on('unhighlight_markers', function(model){ this.unhighlightMarkers(model) }, this)
            demeter.Vent.on('highlight_marker', function(model){ this.highlightMarkerFromModel(model) }, this)
            demeter.Vent.on('fadeOut_markers', function(collection){ this.fadeOutMarkers(collection) }, this)

        },

        scaleMap : function(){
            this.mapCanvas = $('#map_canvas');

            if(window.innerWidth < 1200) $(this.el).height('70%')
            else $(this.el).height('100%')

            this.mapCanvas.width(this.mapCanvas.parent().width())
            this.mapCanvas.height('100%')
        },

        setupMarkers : function(){
            var self = this

            this.clearMarkers()
            this.establishments.each(function(establishment, i){
                self.addMarker(establishment)
            })
        },

        clearMarkers : function(){
            var self = this

            if(!_.isUndefined(this.markers)) _.each(this.markers, function(marker){
                self.hideMarker(marker)
            })

            this.markers = []
        },

        fadeOutMarkers : function(collection){
            var self = this

            var colIds = _.pluck(collection.toJSON(), 'objectId')
            _.each(this.markers, function(marker){
                if(!_.contains(colIds, marker.objectId)) self.hideMarker(marker)
            })


        },

        resetMarkers : function(){
            var self = this
            _.each(this.markers, function(marker){
                self.showMarker(marker)
                self.resetMarkerColor(marker)
            })
        },

        unhighlightMarkers : function(){
            var self = this
          _.each(this.markers, function(marker){
                self.resetMarkerColor(marker)
            })
        },

        addMarker : function(establishment){
            var self = this
            var establishmentJSON = establishment.toJSON()
            var point = new google.maps.LatLng(establishmentJSON.geo_location.latitude, establishmentJSON.geo_location.longitude)

            var marker = new google.maps.Marker({
                map: this.map,
                position: point,
                icon: 'https://maps.google.com/mapfiles/marker.png'
            });

            marker.objectId = establishment.id
            marker.name = establishment.get('name')
            this.markers.push(marker)

            google.maps.event.addListener(marker, 'click', function() {
                self.onMarkerClick(marker, establishment)
            })
        },

        markerFromPoint : function(point){
            var marker = new google.maps.Marker({
                map: this.map,
                position: point,
                icon: 'https://maps.google.com/mapfiles/marker.png'
            });
        },

        hideMarker : function(marker){
            marker.setMap(null);
        },

        showMarker : function(marker){
            marker.setMap(this.map);
        },

        resetMarkerColor : function(marker){
            this.infoWindow.close(this.map, marker);
            marker.setIcon('https://maps.google.com/mapfiles/marker.png')
        },

        highlightMarker : function(marker){
            this.infoWindow.setContent(marker.name);
            this.infoWindow.open(this.map, marker);
            marker.setIcon('https://maps.google.com/mapfiles/marker_yellow.png')
        },

        highlightMarkerFromModel : function(model){
            var self = this
            _.each(this.markers, function(marker){
                if( model.id === marker.objectId) self.highlightMarker(marker)
            })
        },

        onIdle : function(){
            $('#pac-input').removeClass('hidden')
        },

        onMarkerClick : function(marker, establishment){
            this.infoWindow.setContent(establishment.get('name'));
            this.infoWindow.open(this.map, marker);
            demeter.Vent.trigger('establishment_click', establishment)
        },

        onLocationChange : function(){
            var places = this.searchBox.getPlaces();
            var bounds = new google.maps.LatLngBounds();
            for (var i = 0, place; place = places[i]; i++) {
                bounds.extend(place.geometry.location);
            }

            this.centerPoint = new Parse.GeoPoint({latitude: bounds.getCenter().lat(), longitude: bounds.getCenter().lng()});
            demeter.Vent.trigger('mapPoint', this.centerPoint)
        },

    });

})();
