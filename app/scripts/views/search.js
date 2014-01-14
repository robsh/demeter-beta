/*global demeter, Backbone, JST*/

demeter.Views = demeter.Views || {};

(function () {
    'use strict';

    demeter.Views.SearchView = Backbone.View.extend({

        template: JST['app/scripts/templates/search.ejs']

    });

})();
