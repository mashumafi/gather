define(['underscore', 'Backbone', 'text!/schedule.tpl', 'views/details'],
    function (_, Backbone, ScheduleTPL, Details) {

        var NextJS = Backbone.View.extend({

            events:{
                'click #btnBack':'btnBack_clickHandler',
                'click .activity': 'activityDetail_handler',
                'mousemove .rating': 'rating_moveHandler',
                'mouseout .rating': 'rating_outHandler',
                'click .rating': 'rating_clickHandler'
            },

            render:function () {
                var now = this.options.now, owner = [], member=[], old=[];
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
                    if(end > now) {
                        (activity.owner ? owner : member).push(activity);
                    } else {
                        old.push(activity);
                    }
                }
                this.options.activities = {owner: owner, member: member, old: old};
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
                });
            },
            
            rating_moveHandler: function(event) {
                $(event.target).parent().parent().find('.rating').each(function() {
                    if(parseInt($(this).attr('data-rating')) <= parseInt($(event.target).attr('data-rating'))) {
                        $(this).attr('src', 'image/star-on.png');
                    } else {
                        $(this).attr('src', 'image/star-off.png');
                    }
                })
            },
            
            rating_outHandler: function(event) {
                var desc = $(event.target).parent().parent();
                desc.find('.rating').each(function() {
                    if(parseInt($(this).attr('data-rating')) <= parseInt(desc.attr('data-rating'))) {
                        $(this).attr('src', 'image/star-on.png');
                    } else {
                        $(this).attr('src', 'image/star-off.png');
                    }
                });
            },
            
            rating_clickHandler: function(event) {
                var desc = $(event.target).parent().parent();
                desc.attr('data-rating', $(event.target).attr('data-rating'));
                desc.find('.rating').each(function() {
                    if(parseInt($(this).attr('data-rating')) <= parseInt(desc.attr('data-rating'))) {
                        $(this).attr('src', 'image/star-on.png');
                    } else {
                        $(this).attr('src', 'image/star-off.png');
                    }
                });
                var id = desc.parent().find('input').val();
                $.ajax({
                    url: 'rate',
                    data: {
                        id: id,
                        rating: desc.attr('data-rating')
                    },
                    type: 'POST',
                    success: function(res) {
                        $.mobile.jqmNavigator.pushView(new Details(res));
                    }
                });
                event.stopPropagation();
                return false;
            }
        });

        return NextJS;
    });