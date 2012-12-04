define(['underscore', 'Backbone', 'text!/browse.tpl', 'text!/browse_list.tpl', 'views/details'],
    function (_, Backbone, BrowseTPL, BrowseListTPL, Details) {

        var NextJS = Backbone.View.extend({

            events: {
                'click #btnBack':'btnBack_clickHandler',
                'click #btnToggleFilter': 'btnToggleFilter_clickHandler',
                'click .activity': 'activityDetail_handler'
            },

            render: function () {
                var now = this.options.now;
                var activities = this.options.activities;
                activities.sort(function(a, b) {
                    return new Date(a.begin) - new Date(b.begin);
                });
                for(var i = 0; i < activities.length; i++) {
                    var activity = activities[i].obj;
                    var begin = new Date(activity.begin);
                    var end = new Date(activity.end);
                    if(now > begin) {
                        activity.began = true;
                        activity.begin = 'Ends: ' + end.timespan(begin);
                    } else {
                        activity.began = false;
                        activity.begin = 'Begins: ' + begin.timespan(now);
                    }
                    activity.dis *= this.options.earthRadius;
                }
                this.$el.html(_.template(BrowseTPL, this.options));
                $('#filter').hide();
                return this;
            },

            btnBack_clickHandler: function (event) {
                $.mobile.jqmNavigator.popView();
            },
            
            btnToggleFilter_clickHandler: function(event) {
                if($('#filter').is(":visible")) {
                    var filter = document.getElementById('filter');
                    var latest = new D8.create(filter.latestDate.value.replace(/\-/g, '.'));
                    var time = filter.latestTime.value.split(':');
                    latest = latest.addHours(parseInt(time[0]));
                    latest = latest.addMinutes(parseInt(time[1]));
                    var gps = getCurrentPosition();
                    var data = {
                        latest: latest.date,
                        now: new Date,
                        distance: parseFloat(filter.maxDistance.value),
                        lon: gps.lon,
                        lat: gps.lat
                    };
                    $.ajax({
                        url: 'browse',
                        data: data,
                        type: 'POST',
                        success: function(res) {
                            data.activities = res.activities;
                            var now = data.now;
                            var activities = data.activities;
                            switch($('input[name=sort]:checked').val()) {
                                case 'distance':
                                    activities.sort(function(a, b) {
                                        return a.location.distance();
                                    });
                                    break;
                                default: // time
                                    activities.sort(function(a, b) {
                                        return new Date(a.begin) - new Date(b.begin);
                                    });
                                    break;
                            }
                            for(var i = 0; i < activities.length; i++) {
                                var activity = activities[i].obj;
                                var begin = new Date(activity.begin);
                                var end = new Date(activity.end);
                                if(now > begin) {
                                    activity.began = true;
                                    activity.begin = 'Ends: ' + end.timespan(begin);
                                } else {
                                    activity.began = false;
                                    activity.begin = 'Begins: ' + begin.timespan(now);
                                }
                                activity.dis *= data.earthRadius;
                            }
                            $('#listBrowse').replaceWith(_.template(BrowseListTPL, data));
                            $('#listBrowse').listview();
                            $('#filter').toggle('slow');
                        }
                    });
                } else {
                    $('#filter').toggle('slow');
                }
            },

            activityDetail_handler: function (event) {
                $.ajax({
                    url: 'details',
                    data: {
                        id: $(event.target).parent().find('input').val()
                    },
                    type: 'POST',
                    success: function(res) {
                        $.mobile.jqmNavigator.pushView(new Details(res));
                    }
                })
            }

        });

        return NextJS;
    });