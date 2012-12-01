define(['jquery', 'underscore', 'Backbone', 'D8', 'views/create', 'text!/home.tpl', 'views/schedule', 'views/browse'],
    function ($, _, Backbone, D8, Create, HomeTPL, Schedule, Browse) {
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
                var defaults = document.getElementById('browseDefaults');
                var now = new D8();
                var later = now.addHours(defaults.hoursDelay.value);
                $.mobile.jqmNavigator.pushView(new Create({
                    _id: null,
                    name: '',
                    description: '',
                    begindate: now.format('yyyy-mm-dd'),
                    begintime: now.format('HH:MM'),
                    enddate: later.format('yyyy-mm-dd'),
                    endtime: later.format('HH:MM'),
                    location: '',
                    isNew: true
                }));
            },

            btnBrowse_clickHandler:function (event) {
                var defaults = document.getElementById('browseDefaults');
                var latest = new D8().addHours(parseFloat(defaults.hoursDelay.value));
                var data = {
                    latest: latest.date,
                    now: new Date,
                    distance: parseFloat(defaults.maxDistance.value),
                    location: [0,0]
                };
                $.ajax({
                    url: 'browse',
                    data: data,
                    type: 'POST',
                    success: function(res) {
                        data.activities = res;
                        data.date = latest.format('yyyy-mm-dd');
                        data.time = latest.format('HH:MM');
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