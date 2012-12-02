define(['underscore', 'Backbone', 'text!/schedule.tpl', 'views/details'],
    function (_, Backbone, ScheduleTPL, Details) {

        var NextJS = Backbone.View.extend({

            events:{
                'click #btnBack':'btnBack_clickHandler',
                'click .activity': 'activityDetail_handler'
            },

            render:function () {
                var now = this.options.now, owner = [], member=[];
                var activities = this.options.activities;
                activities.sort(function(a, b) {
                    return new Date(a.begin) - new Date(b.begin);
                });
                for(var i = 0; i < activities.length; i++) {
                    var activity = activities[i];
                    activity.begin = new Date(activity.begin).timespan(now);
                    activity.distance = Math.round(Math.sqrt(Math.pow(activity.location[0],2)+Math.pow(activity.location[1],2))*10)/10;
                    (activity.owner ? owner : member).push(activity);
                }
                this.options.activities = {owner: owner, member: member};
                this.$el.html(_.template(ScheduleTPL, this.options));
                return this;
            },

            btnBack_clickHandler:function (event) {
                $.mobile.jqmNavigator.popView();
            },

            activityDetail_handler: function (event) {
                var id = $(event.target).parent().find('input').val();
                $.ajax({
                    url: 'details',
                    data: {
                        id: id
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