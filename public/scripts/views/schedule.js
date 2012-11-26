define(['underscore', 'Backbone', 'text!/schedule.tpl'],
    function (_, Backbone, ScheduleTPL) {

        var NextJS = Backbone.View.extend({

            events:{
                'click #btnBack':'btnBack_clickHandler'
            },

            render:function () {
                this.$el.html(_.template(ScheduleTPL, {list:[{name: 'test', description: 'test', begin: new Date, distance: 10}]}));
                return this;
            },

            btnBack_clickHandler:function (event) {
                $.mobile.jqmNavigator.popView();
            }

        });

        return NextJS;
    });