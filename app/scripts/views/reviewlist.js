/*global demeter, Backbone, JST*/

demeter.Views = demeter.Views || {};

(function () {
    'use strict';

    demeter.Views.ReviewlistView = Backbone.View.extend({

        template: JST['app/scripts/templates/reviewlist.ejs'],
        itemTemplate: JST['app/scripts/templates/reviewListItem.ejs'],

        initialize : function(){},

        setHashtag : function(hashtag, cp){
        	var self = this
        	var query = new Parse.Query('Review')

            if(!_.isUndefined(hashtag)) query.equalTo('hashtags', hashtag)
        	query.limit(25)
            // console.log(cp)
            // if(!_.isUndefined(cp)) query.withinKilometers('geo_location', cp, 3)

            this.collection = query.collection();



            this.collection.comparator=function(model) {
                return -new Date(model.createdAt).getTime();
            }

        	this.collection.fetch({
        		success : function(response){
					self.render()
        		},
        		error : function(response){
        			console.log(response)
        		},
        	})
        },

        render : function(){
        	$(this.el).empty().append(this.template())


        	this.$list = $(this.el).find('.list')
        	this.renderList()

        	this.initializeEvents()
        },

        renderList : function(){
        	var self = this
        	var els = []

            // this.collection.sortBy(function(m) { return m.get('createdAt') })

        	this.collection.each(function(model){
        		var el = self.itemTemplate({model : model.toJSON()})
        		els.push(el)
        	})

        	this.$list.html(els)

        	var hashtag_regexp = /#([a-zA-Z0-9]+)/g;
            var mention_regexp = /@([a-zA-Z0-9]+)/g;

            $($(this.el).find('.areview')).each(function(){
                $(this).html(self.linkHashtags($(this).html(), hashtag_regexp, '#', 'hashtag'));
            })
            $($(this.el).find('.areview')).each(function(){
                $(this).html(self.linkHashtags($(this).html(), mention_regexp, '@', 'mention'));
            })
            this.initializeReviewEvents()
        },

        initializeEvents : function(){
            var self = this

            $(this.el).find('.navLink').click(function(e){
                e.preventDefault()
                var link = e.target.hash.slice(1)
                demeter.Vent.trigger('nav', link)
            })
        },

        initializeReviewEvents : function(){
            var self = this;
            $(this.el).find('.hashtag').click(function(e){self.onHashtagClick(e)})
            $(this.el).find('.mention').click(function(e){self.onMentionClick(e)})
        },

        onHashtagClick : function(e){
            if(!_.isUndefined(e)) e.preventDefault()
            var hashtag = e.target.hash.slice(1)
            demeter.Vent.trigger('hashtag_list', hashtag.toLowerCase())
        },

        onMentionClick : function(e){
            if(!_.isUndefined(e)) e.preventDefault()
            var sname = e.target.hash.slice(1)
            demeter.Vent.trigger('establishment_click_sname', sname)
        },

        linkHashtags : function(text, rgexp, dlmtr, clss) {
            return text.replace(rgexp, '<a class="'+clss+'" href="#$1" ">'+dlmtr+'$1</a>');
        },




    });

})();
