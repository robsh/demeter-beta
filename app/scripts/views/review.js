/*global demeter, Backbone, JST*/

demeter.Views = demeter.Views || {};

(function () {
    'use strict';

    demeter.Views.ReviewView = Backbone.View.extend({

        template: JST['app/scripts/templates/review.ejs'],

        initialize : function(){
            var self = this


            this.$flash = $(this.el).find('.flash')
            this.$submitButton = $(this.el).find('.submit-review')
            this.originalHTML = this.$submitButton.html()

            this.$ratingVal = $(this.el).find('#ratingval')
            this.$priceInput = $(this.el).find('.number-input')

            this.$textareaPlaceholder = $('#textareaPlaceholder')

            this.resetTextarea()


            this.establishments = new demeter.Collections.EstablishmentCollection()

            demeter.Vent.on('mapPoint', function(centrePoint){
                var query = new Parse.Query(demeter.Models.EstablishmentModel)
                this.establishments.query = query
                this.establishments.query.withinKilometers('geo_location', centrePoint, 3)
                this.establishments.fetch({
                    success : function(response){
                        self.setupMentions(response)
                    }
                })
            }, this)


            this.initializeEvents()
        },

        resetTextarea : function(){
            this.$textareaPlaceholder.empty()
            this.$textareaPlaceholder.append('<textarea class="form-control" rows="6" placeholder="@Luigis was awesome. 5 euro pizza #pizza"></textarea>')
            this.$textarea = $(this.el).find('textarea')
        },

        initializeEvents : function(){
            var self = this
            this.$submitButton.click(function(e){ self.submitReviewButtonClick(e) })
        },

        submitReviewButtonClick : function(e){
            e.preventDefault()

            if(!Parse.User.current()){
                demeter.Vent.trigger('signupRequest', "You need to sign up to write a review.")
            }else{
                this.submitReview()
            }
        },

        setupMentions : function(response){
            var establishmentArray = []

            this.resetTextarea()

            this.establishments.each(function(obj,i){
                var arrayEl = {}
                arrayEl.name = obj.get('name')
                arrayEl.username = obj.get('sname')
                arrayEl.id = obj.id
                establishmentArray.push(arrayEl)
            })

            this.$textarea.mention({
                delimiter : "@",
                users : establishmentArray
            })
        },

        reviewReset : function(){
            this.$flash.html('Review submitted! Thank you.')
            this.$textarea.val('')
            $('.rating-input').find('span').each(function(i, el){
                $(el).removeClass('fa-star fa-star-o')
                if(i>2){
                    $(el).addClass('fa-star-o')
                }
                else{
                    $(el).addClass('fa-star')
                }
            })
            $('#ratingval').val('2')
        },

        reviewTest : function(review){
            if(review.get('review') === "") {
                this.$flash.html("Please write a review.")
                return false;
            }

            else if(_.isUndefined(review.get('mention'))) {
                this.$flash.html("Please mention one restaurant.")
                return false;
            }

            else if(review.get('hashtags').length === 0) {
                this.$flash.html("Please hashtag the food you had.")
                return false;
            }

            else if(review.get('price') === 0) {
                this.$flash.html("Please enter a price.")
                return false;
            }

            else return true;
        },

        submitReview : function(){
            var self = this
            var rating = this.$ratingVal.val()
            var price = this.$priceInput.val()
            var reviewStr = this.$textarea.val()
            var mentions = twttr.txt.extractMentions(reviewStr)
            var hashtags = twttr.txt.extractHashtags(reviewStr)


            var matchingEstablishment = this.establishments.find(function(establishment){
                // console.log(establishment.get('sname'), mentions[0])
                return establishment.get('sname') === mentions[0];
            });

            console.log(matchingEstablishment)

            var review = new demeter.Models.ReviewModel()
            review.set('rating', rating)
            review.set('price', parseInt(price))
            review.set('review', reviewStr)

            review.set('hashtags', hashtags)
            review.set('uid', Parse.User.current().id)
            review.set('username', Parse.User.current().get('name'))
            review.set('mention', mentions[0])
            review.set('eid', matchingEstablishment.id)



            var pass = this.reviewTest(review)

            if(pass){
                this.$submitButton.html('<i class="fa fa-spinner fa-spin"></i> ' + this.originalHTML)
                review.save(null, {
                    success: function(review) {
                        self.$submitButton.html(self.originalHTML)
                        self.reviewReset()
                    },
                    error: function(review, error) {
                        self.$submitButton.html(self.originalHTML)
                        self.$flash.html("Error: " + error.message)
                    }
                });
            }
        },

    });

})();
