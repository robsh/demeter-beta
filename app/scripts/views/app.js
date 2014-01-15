/*global sbc2, Backbone, JST*/

sbc2.Views = sbc2.Views || {};

(function () {
    'use strict';

    sbc2.Views.AppView = Backbone.View.extend({

        template: JST['app/scripts/templates/app.ejs'],

        initialize : function(){

      	 	this.authorize()

            this.$pdfDownloadButton = $('a[href$=pdf]')
            this.$wordDownloadButton = $('a[href$=word]')
            this.$clearButton = $('#resetDocument')

            $('[data-toggle="tooltip"]').tooltip({'placement': 'right', 'trigger':'click'});
        	this.$sidebar = $('.sidebar')
        	this.hashFragment = ''
        },

        authorize : function(){
            this.userView = new sbc2.Views.UserView({
                el : $('.user'),
                model : this.model.get('user')
            })

            this.model.get('user').on('login', function(){
                this.userView.remove()
                this.initializeEvents()
                this.initializeViews()
                this.checkConvertServer()
                this.render()
            }, this)
        },

        checkConvertServer : function(){
            var self = this
            $.get( sbc2.convert_server, function( data ) {
                if(data.ping === true){
                    self.$pdfDownloadButton.html('Pdf download')
                    self.$wordDownloadButton.html('Word download')
                }
                else{
                    self.$pdfDownloadButton.html('Convert server error')
                    self.$wordDownloadButton.html('Convert server error')
                }
            });
        },


        render : function(){
        	this.$sidebar.removeClass('hidden')
        },

      	navigate : function(path){
    		$('#'+this.hashFragment).addClass('hidden')
    		this.hashFragment = path
    		$('#'+this.hashFragment).removeClass('hidden')
	   },

        initializeEvents: function(){
        	var self = this

            this.$sidebar.find('a').on('click', function(e){ self.sidebarLinkClick(e) })
            this.$clearButton.click(function(e){ self.sidebarClearClick() })
            this.model.on('navigate', function(path){ this.navigate(path) }, this)
            this.model.on('download', function(type){ this.fileConvertRequest(type) }, this)
            this.model.on('clear', function(){ this.sidebarClearClick() }, this)
        },

        initializeViews : function(){
        	this.model.set({'documentView': new sbc2.Views.DocumentView({
        		model : this.model.get('document'),
        		el : $('.main')
        	})})
            if(window.location.hash === ""){
                this.model.get('router').navigate('companydetails')
            }

        },

        sidebarLinkClick : function(e){
    		e.preventDefault()
			var link = e.target.hash.slice(1)
			this.model.get('router').navigate(link, {trigger: true})
        },

        sidebarClearClick : function(){
            this.model.get('document').reset()

        },

        fileConvertRequest : function(type){
            this.beforeRequest(type)
            var self = this
            $.ajax({
                type: "POST",
                url: sbc2.convert_server + type + '_convert',
                data: {id : self.model.get('user').toJSON().id},
                success: function(success, response){
                    console.log(success.success)
                    if(success.success === true) self.convertSuccess(type)
                    else self.convertError(type)
                },
                error : function(){self.convertError(type)}
            });
        },

        beforeRequest : function(type){
            var button = $('a[href$='+type+']');
            this.$pdfDownloadButton.html('Pdf download')
            this.$wordDownloadButton.html('Word download')
            this.originalHtml = button.html()
            button.html('<i class="fa fa-spin fa-spinner"></i>')

        },

        convertSuccess : function(type){
            var button = $('a[href$='+type+']');
            button.html(this.originalHtml)
            window.location = sbc2.convert_server + type + '/' + this.model.get('user').toJSON().id
        },

        convertError : function(type){
            var button = $('a[href$='+type+']');
            button.html('Server error, try again.')
        },


    });

})();
