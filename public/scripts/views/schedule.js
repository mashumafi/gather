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
                    var begin = new Date(activity.begin);
                    var end = new Date(activity.end);
                    if(now > begin) {
                        activity.began = true;
                        activity.begin = 'Ends: ' + end.timespan(begin);
                    } else {
                        activity.began = false;
                        activity.begin = 'Begins: ' + begin.timespan(now);
                    }
                    activity.distance = Math.round(activity.location.distance()*10)/10;
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