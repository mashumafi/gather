define(['jquery', 'underscore', 'Backbone', 'views/create', 'text!/home.tpl', 'views/schedule', 'views/browse'],
    function ($, _, Backbone, Create, HomeTPL, Schedule, Browse) {
        var HomeView = Backbone.View.extend({

            events:{
                'click #btnSchedule':'btnSchedule_clickHandler',
                'click #btnCreate':'btnCreate_clickHandler',
                'click #btnBrowse':'btnBrowse_clickHandler',
                'click #btnToggleSettings':'btnToggleSettings_clickHandler',
                'click #btnAuthFacebook':'btnAuthFacebook_clickHandler',
                'click #btnAuthTwitter':'btnAuthTwitter_clickHandler',
                'click #btnLogout':'btnLogout_clickHandler'
            },

            render:function () {
                this.$el.html(_.template(HomeTPL, {}));
                $('#settings').hide();
                return this;
            },

            btnSchedule_clickHandler:function (event) {
                var data = {
                    now: new Date
                };
                $.ajax({
                    url: 'schedule',
                    data: data,
                    type: 'POST',
                    success: function(res) {
                        data.activities = res;
                        $.mobile.jqmNavigator.pushView(new Schedule(data));
                    }
                });
            },

            btnCreate_clickHandler:function (event) {
                $.mobile.jqmNavigator.pushView(new Create);
            },

            btnBrowse_clickHandler:function (event) {
                // TODO: make this a setting
                var latest = new Date(new Date().getTime() + 1000*60*60); // 1 hour
                var data = {
                    latest: latest,
                    now: new Date
                };
                $.ajax({
                    url: 'browse',
                    data: data,
                    type: 'POST',
                    success: function(res) {
                        data.activities = res;
                        data.date = latest.getFullYear() + '-' + latest.getMonth() + '-' + latest.getDate();
                        data.time = latest.getHours() + ':' + ((latest.getMinutes()+'').length == 2 ? latest.getMinutes():'0'+latest.getMinutes());
                        $.mobile.jqmNavigator.pushView(new Browse(data));
                    }
                });
            },
            
            btnToggleSettings_clickHandler: function(event) {
                $('#settings').toggle('slow');
            },
            
            btnAuthFacebook_clickHandler: function() {
                window.location = "auth/facebook";
            },
            
            btnAuthTwitter_clickHandler: function() {
                window.location = "auth/twitter";
            },
            
            btnLogout_clickHandler: function() {
                window.location = "logout";
            }

        });
        return HomeView;
    });