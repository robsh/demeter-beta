/*global demeter, Backbone*/

demeter.Collections = demeter.Collections || {};

(function () {
    'use strict';

    demeter.Collections.ReviewsCollection = Parse.Collection.extend({

        model: demeter.Models.ReviewsModel

    });

})();
