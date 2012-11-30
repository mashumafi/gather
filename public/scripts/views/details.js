define(['underscore', 'Backbone', 'text!/details.tpl'],
    function (_, Backbone, DetailsTPL) {

        var NextJS = Backbone.View.extend({

            events:{
                'click #btnBack':'btnBack_clickHandler'
            },

            render:function () {
                this.options.begin = new Date(this.options.begin);
                this.options.end = new Date(this.options.end);
                this.$el.html(_.template(DetailsTPL, this.options));
                return this;
            },

            btnBack_clickHandler:function (event) {
                $.mobile.jqmNavigator.popView();
            }
        });

        return NextJS;
    });