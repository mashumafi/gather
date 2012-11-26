define(['jquery', 'underscore', 'Backbone', 'views/create', 'text!/home.tpl', 'views/schedule', 'views/browse'],
    function ($, _, Backbone, Create, HomeTPL, Schedule, Browse) {
        var HomeView = Backbone.View.extend({

            events:{
                'click #btnSchedule':'btnSchedule_clickHandler',
                'click #btnCreate':'btnCreate_clickHandler',
                'click #btnBrowse':'btnBrowse_clickHandler',
            },

            render:function () {
                this.$el.html(_.template(HomeTPL, {}));
                return this;
            },

            btnSchedule_clickHandler:function (event) {
                $.mobile.jqmNavigator.pushView(new Schedule);
            },

            btnCreate_clickHandler:function (event) {
                $.mobile.jqmNavigator.pushView(new Create);
            },

            btnBrowse_clickHandler:function (event) {
                $.mobile.jqmNavigator.pushView(new Browse);
            }

        });
        return HomeView;
    });