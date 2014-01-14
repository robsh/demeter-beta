/*global demeter, Backbone*/

demeter.Collections = demeter.Collections || {};

(function () {
    'use strict';

    demeter.Collections.EstablishmentCollection = Parse.Collection.extend({

        model: demeter.Models.EstablishmentModel

    });

})();
