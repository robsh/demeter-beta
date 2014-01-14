/*global demeter, Backbone, JST*/

demeter.Views = demeter.Views || {};

(function () {
    'use strict';

    demeter.Views.WritereviewView = Backbone.View.extend({

        template: JST['app/scripts/templates/writereview.ejs']

    });

})();
