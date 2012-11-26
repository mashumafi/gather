define(['underscore', 'Backbone', 'jqv', 'text!/create.tpl'],
    function (_, Backbone, jqv, NextTPL) {

        var NextJS = Backbone.View.extend({

            events:{
                'click #btnBack':'btnBack_clickHandler'
            },

            render:function () {
                this.$el.html(_.template(NextTPL, {list:[{name: 'test', description: 'test', begin: new Date, distance: 10}]}));
                return this;
            },

            btnBack_clickHandler:function (event) {
                $.mobile.jqmNavigator.popView();
            }

        });

        return NextJS;
    });