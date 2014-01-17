/*global demeter, Backbone, JST*/

demeter.Views = demeter.Views || {};

(function () {
    'use strict';

    demeter.Views.EstablishmentView = Backbone.View.extend({

        template: JST['app/scripts/templates/establishment.ejs'],
        reviewTemplate: JST['app/scripts/templates/review.ejs'],

        initialize : function(){},

        setPlace :function(model){

        	this.preRender()
            this.model = model
            this.render()
            demeter.Vent.trigger('unhighlight_markers', model)
            demeter.Vent.trigger('highlight_marker', model)
        },

        render : function(){

            if(_.isUndefined(this.model.get('name'))){
                this.renderError()
                return;
            }

        	$(this.el).html(this.template({model : this.model.toJSON()}))
            this.$writereview = $('.writereview')

            this.initializeReviews()

            this.initializeEvents()
        },

        preRender : function(){
        	$(this.el).html('<br><br><br><h4><i class="fa fa-spinner fa-spin"></i> Fetching restaraunt.</h4>')
        },

        renderError : function(){
            $(this.el).html('<br><br><br><h4><i class="fa fa-ban"></i> We have no data for this restaraunt.</h4>')
        },

        renderReviews : function(reviews){
            var self = this
            $(this.$reviews).empty()
            var els = []
            _.each(reviews, function(review, i){
                var el = self.reviewTemplate({model : review.toJSON()})
                els.push(el)
            })

            $(this.$reviews).append(els)

            var hashtag_regexp = /#([a-zA-Z0-9]+)/g;
            var mention_regexp = /@([a-zA-Z0-9]+)/g;

            $(this.$reviews.find('.areview')).each(function(){
                $(this).html(self.linkHashtags($(this).html(), hashtag_regexp, '#', 'hashtag'));
            })
            $(this.$reviews.find('.areview')).each(function(){
                $(this).html(self.linkHashtags($(this).html(), mention_regexp, '@', 'mention'));
            })
            this.initializeReviewEvents()
        },

        renderNoReviews : function(){
            $(this.$reviews).find('.noReviews').removeClass('hidden')
        },

        renderReviewsError : function(){},

        onHashtagClick : function(e){
            if(!_.isUndefined(e)) e.preventDefault()
            var hashtag = e.target.hash.slice(1)
            demeter.Vent.trigger('hashtag_list', hashtag)
        },

        onMentionClick : function(e){
            if(!_.isUndefined(e)) e.preventDefault()
            var sname = e.target.hash.slice(1)
            demeter.Vent.trigger('establishment_click_sname', sname)
        },

        linkHashtags : function(text, rgexp, dlmtr, clss) {
            return text.replace(rgexp, '<a class="'+clss+'" href="#$1" ">'+dlmtr+'$1</a>');
        },

        initializeEvents : function(){
            var self = this

            $(this.el).find('.nav').click(function(e){
                e.preventDefault()
                var link = e.target.hash.slice(1)
                demeter.Vent.trigger('nav', link)
            })

            this.$writereview.click(function(e){ self.writereview(e) })
        },

        initializeReviewEvents : function(){
            var self = this;
            $(this.$reviews).find('.hashtag').click(function(e){self.onHashtagClick(e)})
            $(this.$reviews).find('.mention').click(function(e){self.onMentionClick(e)})
        },

        initializeReviews : function(){
            var self = this
            this.$preReviewSearch = $(this.el).find('.preReviewSearch')
            this.$reviews = $(this.el).find('.reviews')

            var query = new Parse.Query('Review')
            query.equalTo('eid', this.model.id)
            query.find({
                success : function(reviews){
                    self.$preReviewSearch.addClass('hidden')
                    if(reviews.length > 0) self.renderReviews(reviews)
                    else self.renderNoReviews()
                },
                error : function(error){
                    self.renderReviewsError()
                },
            })

        },

        writereview : function(e){
            if(!_.isUndefined(e)) e.preventDefault()
            demeter.Vent.trigger('writereview', this.model)
        }

    });

})();
