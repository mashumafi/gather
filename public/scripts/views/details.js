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
                this.options.begin = D8.create(this.options.begin).format('mmmm dd, yyyy hh:MM TT');
                this.options.end = D8.create(this.options.end);
                this.options.expired = this.options.end.date < new Date();
                this.options.end = this.options.end.format('mmmm dd, yyyy hh:MM TT');
                var members = this.options.members,  count = 0, rating = 0;
                for(var i = 0; i < members.length; i++) {
                    if(members[i].rating > 0) {
                        count++;
                        rating += members[i].rating;
                    }
                }
                this.options.rating = count > 0 ? Math.round(rating / count) : 0;
                this.$el.html(_.template(DetailsTPL, this.options));
                if(!this.options.expired) {var lat = $("#lat").val ();
                    var gps = getCurrentPosition();
                    var latlng = new google.maps.LatLng(gps.lat, gps.lon);
                    var options = {
                        zoom : 15,
                        center : latlng,
                        mapTypeId : google.maps.MapTypeId.ROADMAP
                    };
                    var $content = $("#gmap");
                    $content.height ($(window).width() - 50);
                    var map = new google.maps.Map ($content[0], options);
                    new google.maps.Marker ({
                        map : map,
                        animation : google.maps.Animation.DROP,
                        position : new google.maps.LatLng(parseFloat(this.options.location.lat), parseFloat(this.options.location.lon))
                    });
                    new google.maps.Marker ({
                        map : map,
                        animation : google.maps.Animation.DROP,
                        position : latlng
                    });
                }
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