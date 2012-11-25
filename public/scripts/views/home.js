define(['jquery', 'underscore', 'Backbone', 'views/create', 'text!/home.tpl'],
    function ($, _, Backbone, Create, HomeTPL) {
        var HomeView = Backbone.View.extend({

            events:{
                'click #btnCreate':'btnCreate_clickHandler',
                'click #btnNearBy':'btnNearBy_clickHandler',
                'click #btnBrowse':'btnBrowse_clickHandler',
                'click #btnInstant':'btnInstant_clickHandler'
            },

            render:function () {
                this.$el.html(_.template(HomeTPL, {title: 'Home View'}));
                return this;
            },

            btnCreate_clickHandler:function (event) {
                $.mobile.jqmNavigator.pushView(new Create);
            },

            btnNearBy_clickHandler:function (event) {
                $.mobile.jqmNavigator.pushView(new NearBy);
            },

            btnBrowse_clickHandler:function (event) {
                $.mobile.jqmNavigator.pushView(new Browse);
            },

            btnInstant_clickHandler:function (event) {
                $.mobile.jqmNavigator.pushView(new Instant);
            }

        });
        return HomeView;
    });