Parse.initialize("yu7JSONRyPiLdqNnB8CE4FTTRq2cX7XYpqkgXKFG", "teZjsgnov9LixPqIl0IIXU9f3NoYE82wG8Heo8yi");

$(document).ready(function () {
    'use strict';
    var $button = $('.submit-email')
    var $emailInput = $('.input-email')
    var $flash = $('#flash')
    var $title = $('.signup-title')

    $emailInput.focus()

    $(".scrolltop").click(function(e) {
        e.preventDefault()
        $emailInput.focus()
    });

    var Landing = Parse.Object.extend("Landing")

    var saveItem = function(){
        var email = $emailInput.val()
        var landing = new Landing()
        landing.set('email', email)
        landing.save(null, {
            success: function(landing) {
                $emailInput.addClass('hidden')
                $button.addClass('hidden')
                $title.text('Thank you. We will email you when we launch.')
            },
            error: function(landing, error) {
                $flash.html('Failed to save email: ' + error.message)
            }
        })
    }

    $button.click(function(e){
        e.preventDefault()

        $flash.addClass('hidden')
        $button.html('<i class="fa fa-spinner fa-spin"></i>  Go!');
        var email = $emailInput.val()

        if(email === "" || email.indexOf(".") === -1 || email.indexOf("@") === -1){

            $button.html('Go!')
            $flash.removeClass('hidden').html('Please fill in a valid email.')

        }else{

            var query = new Parse.Query(Landing);
            query.equalTo("email", email);

            query.count({
                success: function(count) {
                    console.log(count)
                    if(count != 0){
                        $flash.removeClass('hidden').html('Email already taken.')
                        $button.html('Go!')
                    }else{
                        saveItem()
                    }
                },
                error: function(error) {
                    $flash.html('An error has occured.')
                }
            });



        }

    })
})
