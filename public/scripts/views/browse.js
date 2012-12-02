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
                    var activity = activities[i];
                    activity.begin = new Date(activity.begin).timespan(now);
                    activity.distance = Math.round(Math.sqrt(Math.pow(activity.location[0],2)+Math.pow(activity.location[1],2))*10)/10;
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
                    var latest = new D8.create(filter.latestDate.value + ' ' + filter.latestTime.value);
                    var data = {
                        latest: latest.date,
                        now: new Date,
                        distance: parseFloat(filter.maxDistance.value),
                        location: [0,0]
                    };
                    $.ajax({
                        url: 'browse',
                        data: data,
                        type: 'POST',
                        success: function(res) {
                            data.activities = res;
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
                                var activity = activities[i];
                                activity.begin = new Date(activity.begin).timespan(now);
                                activity.distance = Math.round(Math.sqrt(Math.pow(activity.location[0],2)+Math.pow(activity.location[1],2))*10)/10;
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