/*global demeter, Backbone, JST*/

demeter.Views = demeter.Views || {};

(function () {
    'use strict';

    demeter.Views.EstablishmentListView = Backbone.View.extend({

        template: JST['app/scripts/templates/establishmentList.ejs'],
        itemTemplate: JST['app/scripts/templates/establishmentListItem.ejs'],

        initialize : function(){
            this.render()
        },

        render : function(){
            $(this.el).html(this.template())
            this.$listEl = $(this.el).find('.list')
        },

        renderList : function(){
            var self = this
            this.$listEl.empty()
            var els = []

            this.collection.each(function(model, i){
                model.set('pos', i + 1)
                var el = self.itemTemplate({model : model.toJSON()})
                els.push(el)
            })

            this.$listEl.append(els)
            this.initializeListEvents()
        },

        setCollection : function(collection){
            demeter.Vent.trigger('fadeOut_markers', collection)
            this.collection = collection
            this.renderList()
        },

        initializeListEvents : function(){
            var self = this
            this.$listEl.find('a').click(function(e){ self.onItemClick(e) })
        },

        onItemClick : function(e){
            if(!_.isUndefined(e)) e.preventDefault()
            var link = e.target.hash.slice(1)

            var model = this.collection.filter(function(model){ return model.get('sname') === link })[0]

            demeter.Vent.trigger('establishment_click', model)
        }

    });

})();
