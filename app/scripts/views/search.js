  /*global demeter, Backbone, JST*/

demeter.Views = demeter.Views || {};

(function () {
    'use strict';

    demeter.Views.SearchView = Backbone.View.extend({

        template: JST['app/scripts/templates/search.ejs'],

        initialize : function(opts){
        	var self = this

        	this.$textInput = $(this.el).find('input[type=search]')
          this.$numberInput = $(this.el).find('input[type=number]')
        	this.$form = $(this.el).find('form')
        	this.$btn = $(this.el).find('button[type=submit]')
          this.$flash = $(this.el).find('.flash')
          this.$hashcloud = $(this.el).find('.hashcloud')
          this.$recentreivews = $(this.el).find('.recentreivews')

        	this.establishments = opts.establishments

          this.render()

          this.reviewListView = new demeter.Views.ReviewlistView({
              el : $(this.$recentreivews),
              establishments : this.establishments
          })

          this.reviewListView.setHashtag()


        	this.initializeEvents()


        },

        initializeEvents : function(){
        	var self = this
        	demeter.Vent.on('mapPoint', function(cp){ this.centerPoint = cp }, this)
          demeter.Vent.on('establishments_fetch', function(){ this.setupMentions() }, this)

          this.$form.submit(function(e){ self.submitForm(e) })
        },

        render : function(){
          var self = this
          var query = new Parse.Query("Hashtag");
          this.collection = query.collection();
          this.collection.fetch({
            success: function(collection) {

              self.$hashcloud.empty().html('<h3>Popular meals</h3>')

              var els = []

              collection.each(function(hash){
                var el = '<a class="hashclouditem lead" href="#'+hash.get('hashtag')+'">#'+hash.get('hashtag')+'</a>  '
                els.push(el)
              })

              self.$hashcloud.append(els)

            $('.hashclouditem').click(function(e){
              e.preventDefault()
              var h =e.target.hash.slice(1)
              demeter.Vent.trigger('hashtag_list', h)
            })

            },
            error: function(collection, error) {
              // The collection could not be retrieved.
            }
          });

        },

        resetForm : function(msg){
          this.$flash.html('')
          if(!_.isUndefined(msg)) this.$flash.html(msg)
          this.$textInput.val('')
          this.$btn.html('Search')
        },

        submitForm : function(e){
          var self = this;

        	if(!_.isUndefined(e)) e.preventDefault()
      		if(_.isUndefined(this.centerPoint)) return

          this.$flash.html('')
    			this.$btn.html('<i class="fa fa-spinner fa-spin"></i> Search')

          var reviewStr = this.$textInput.val()
          var price = parseInt(this.$numberInput.val())
          var mentions = twttr.txt.extractMentions(reviewStr)
          var hashtags = twttr.txt.extractHashtags(reviewStr)

          if(reviewStr === '') return this.resetForm('You must enter a search')
          if(mentions.length > 1) return this.resetForm('Please only mention one restaurant.')

          var clientQuery = {
          	radius : demeter.Parameters.radius,
          	centerPoint : this.centerPoint,
          	sname : mentions[0],
            hashtags : hashtags,
            price : price
          }

					Parse.Cloud.run('EstablishmentSearch', clientQuery, {
						success: function(result) {
							console.log(result)
              if(result.length === 1){
								demeter.Vent.trigger('establishment_click', result[0])
                self.resetForm()
							}else if(result.length > 1){
								var collection = new Parse.Collection(result)
								demeter.Vent.trigger('establishments_list', collection)
                self.resetForm()
							}
							else {
                self.noResults()
              }
						},
						error: function(error) {
              self.resetForm('An error occured.')
						}
					});
        },

        noResults : function(){
          this.resetForm('No results were found.')
        },

        setupMentions : function(){
        		$(this.$textInput).focus()
            var establishmentArray = []

            this.establishments.each(function(obj,i){
                var arrayEl = {}
                arrayEl.name = obj.get('name')
                arrayEl.username = obj.get('sname')
                arrayEl.id = obj.id
                establishmentArray.push(arrayEl)
            })

            this.$textInput.mention({
                delimiter : "@",
                users : establishmentArray
            })
        },



    });

})();
