define(['underscore', 'Backbone', 'text!/create.tpl'],
    function (_, Backbone, NextTPL) {

        var NextJS = Backbone.View.extend({

            events:{
                'click #btnBack':'btnBack_clickHandler'
            },

            render:function () {
                this.$el.html(_.template(NextTPL));
                return this;
            }
        });

        return NextJS;
    });