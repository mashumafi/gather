define(['underscore', 'Backbone', 'text!/browse.tpl', 'views/details'],
    function (_, Backbone, BrowseTPL, Details) {

        var NextJS = Backbone.View.extend({

            events: {
                'click #btnBack':'btnBack_clickHandler',
                'click #btnToggleFilter': 'btnToggleFilter_clickHandler',
                'click .activity': 'activityDetail_handler'
            },

            render: function () {
                var now = this.options.now;
                var activities = this.options.activities;
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
                $('#filter').toggle('slow');
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