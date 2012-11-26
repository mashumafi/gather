define(['underscore', 'Backbone', 'text!/browse.tpl'],
    function (_, Backbone, BrowseTPL) {

        var NextJS = Backbone.View.extend({

            events:{
                'click #btnBack':'btnBack_clickHandler',
                'click #btnToggleFilter': 'btnToggleFilter_clickHandler'
            },

            render:function () {
                this.$el.html(_.template(BrowseTPL, {list:[{name: 'test', description: 'test', begin: new Date, distance: 10}]}));
                $('#filter').hide();
                return this;
            },

            btnBack_clickHandler:function (event) {
                $.mobile.jqmNavigator.popView();
            },
            
            btnToggleFilter_clickHandler: function(event) {
                $('#filter').toggle('slow');
            }

        });

        return NextJS;
    });