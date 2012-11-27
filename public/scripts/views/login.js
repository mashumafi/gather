define(['underscore', 'Backbone', 'text!/login.tpl', 'views/home'],
    function (_, Backbone, LoginTPL, Home) {

        var LoginJS = Backbone.View.extend({

            events:{
                'click #btnLoginFacebook':'btnLoginFacebook_clickHandler',
                'click #btnLoginTwitter':'btnLoginTwitter_clickHandler'
            },

            render:function () {
                this.$el.html(_.template(LoginTPL, {}));
                return this;
            },
            
            btnLoginFacebook_clickHandler: function() {
                window.location = "auth/facebook";
            },
            
            btnLoginTwitter_clickHandler: function() {
                window.location = "auth/twitter";
            }

        });

        return LoginJS;
    });