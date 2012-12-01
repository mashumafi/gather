define(['underscore', 'Backbone', 'text!/details.tpl', 'views/create'],
    function (_, Backbone, DetailsTPL, Create) {

        var NextJS = Backbone.View.extend({

            events:{
                'click #btnBack':'btnBack_clickHandler',
                'click #btnJoin': 'btnJoin_clickHandler',
                'click #btnEdit': 'btnEdit_clickHandler',
                'click #btnUnJoin': 'btnUnJoin_clickHandler'
            },

            render:function () {
                this.options.begin = new Date(this.options.begin);
                this.options.end = new Date(this.options.end);
                this.$el.html(_.template(DetailsTPL, this.options));
                return this;
            },

            btnBack_clickHandler: function (event) {
                $.mobile.jqmNavigator.popView();
            },
            
            btnJoin_clickHandler: function (event) {
                var id = this.options._id;
                $.ajax({
                    url: 'join',
                    type: 'POST',
                    data: {id: id},
                    success: function(res) {
                        $.mobile.jqmNavigator.popToFirst();
                    }
                });
            },
            
            btnEdit_clickHandler: function (event) {
                var data = this.options;
                var now = D8.create(data.begin);
                var later = D8.create(data.end);
                $.mobile.jqmNavigator.pushView(new Create({
                    _id: data._id,
                    name: data.name,
                    description: data.description,
                    begindate: now.format('yyyy-mm-dd'),
                    begintime: now.format('HH:MM'),
                    enddate: later.format('yyyy-mm-dd'),
                    endtime: later.format('HH:MM'),
                    location: data.location,
                    isNew: false
                }));
            },
            
            btnUnJoin_clickHandler: function (event) {
                var id = this.options._id;
                $.ajax({
                    url: 'unjoin',
                    type: 'POST',
                    data: {id: id},
                    success: function(res) {
                        $.mobile.jqmNavigator.popToFirst();
                    }
                });
            }
        });

        return NextJS;
    });