/*global sbc2, Backbone, JST*/

sbc2.Views = sbc2.Views || {};

(function () {
    'use strict';

    sbc2.Views.DocumentView = Backbone.View.extend({

    		model : sbc2.Models.DocumentModel,

        template: JST['app/scripts/templates/document.ejs'],

        initialize : function(){

        	this.render()
        	this.initializeEvents()


        },

        render : function(){
        	_.each(this.model.toJSON(), function(i, el){
        		$(this.el).find('#'+el).val(i.value)
        	}, this)

            _.each(this.model.get('superheaders'), function(obj,key){
                if(obj.active === true){
                    $('#' + key).find('.btn-group > .enabler').button('toggle')
                }
                else{
                    $('#' + key).find('.btn-group > .disabler').button('toggle')
                }
            })
        },

        initializeEvents : function(){
        	var self = this

            $(this.el).find('input').on('keyup', function(e){
        		self.handleItemChange(e.target.id, e.target.value)
        	})

        	$(this.el).find('textarea').on('keyup', function(e){
        		self.handleItemChange(e.target.id, e.target.value)
        	})

            $(this.el).find('.enabler').on('click', function(e){
                self.toggleSuperHeader(e, true)
            })

            $(this.el).find('.disabler').on('click', function(e){
                self.toggleSuperHeader(e, false)
            })

        	this.model.on('fetch', function(){ this.render() }, this)
        	this.model.on('reset', function(){ this.render() }, this)
        },

        handleItemChange : function(id, value){
        	this.model.get(id).value = value
        	this.model.save()
        },

        toggleSuperHeader : function(e, toggle){
            var superHeaderId = $(e.target).parent().parent().attr('id')
            this.model.get('superheaders')[superHeaderId].active = toggle
            this.model.save()
        }


    });

})();
