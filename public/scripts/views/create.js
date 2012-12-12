define(['underscore', 'Backbone', 'text!/create.tpl'],
    function (_, Backbone, CreateTPL) {

        var NextJS = Backbone.View.extend({

            events:{
                'click #btnBack':'btnBack_clickHandler',
                'click #btnDelete':'btnDelete_clickHandler',
                'click #btnUseCurrentGPS': 'btnUseCurrentGPS_clickHandler',
                'keyup #geoencode': 'geoencode_keyupHandler'
            },

            render:function () {
                var id = this.options._id;
                if(!this.options.isNew) {
                    this.options.pos = this.options.lon + ',' + this.options.lat;
                } else {
                    this.options.pos = '';
                }
                this.$el.html(_.template(CreateTPL, this.options));
                if(!this.options.isNew) {
                    this.showMap(this.options);
                }
                $("#frmActivityCreate").validate({
            		rules: {
            			name: {
            				required: true,
            				minlength: 3
            			},
            			desc: {
            				required: true,
            				minlength: 3
            			},
            			begindate: {
            				required: true,
                            day: true
            			},
            			begintime: {
            				required: true,
                            time: true
            			},
            			enddate: {
            				required: true,
                            day: true
            			},
            			endtime: {
            				required: true,
                            time: true
            			},
                    	pos: {
            				required: true,
                            gps: true
            			}
            		},
            		submitHandler: function(form) {
                        var begin = D8.create(form.begindate.value.replace(/\-/g, '.'));
                        var btime = form.begintime.value.split(':');
                        begin = begin.addHours(parseInt(btime[0]));
                        begin = begin.addMinutes(parseInt(btime[1]));
                        var end = D8.create(form.enddate.value.replace(/\-/g, '.'));
                        var etime = form.endtime.value.split(':');
                        end = end.addHours(parseInt(etime[0]));
                        end = end.addMinutes(parseInt(etime[1]));
                        var gps = parseGPS($('input[name=pos]').val());
                        var data = {
                            id: id,
                            name: form.name.value,
                            desc: form.desc.value,
                            lon: gps.lon,
                            lat: gps.lat,
                            begin: begin.date,
                            end: end.date
                        };
            			$.ajax({
            				url: id ? 'update' : 'create',
            				data: data,
            				type: 'POST',
            				success: function(result) {
            					console.log(result);
            					if(!result.error) {
            						$.mobile.jqmNavigator.popToFirst();
            					} else {
            						// display error
            					}
            				}
            			});
                        return false;
            		}
            	});
                return this;
            },

            btnBack_clickHandler: function (event) {
                $.mobile.jqmNavigator.popView();
            },
            
            btnDelete_clickHandler: function(event) {
        		$.ajax({
    				url: 'delete',
    				data: {
                        id: this.options._id
                    },
    				type: 'POST',
    				success: function(result) {
    					if(!result.error) {
    						$.mobile.jqmNavigator.popToFirst();
    					} else {
    						// display error
    					}
    				}
    			});
            },
            
            btnUseCurrentGPS_clickHandler: function(event) {
                if($('#btnUseCurrentGPS').val() === 'Clear') {
                    $('input[name=pos]').val('')
                    $('input#geoencode').val('');
                    $('input#geoencode').attr('placeholder', '');
                    $('#btnUseCurrentGPS').val('Current Position');
                    $('#btnUseCurrentGPS').buttonMarkup({ theme: 'c' }).button('refresh');
                } else if($('#geoencode').val().length >= 1) {
                    var gc = new google.maps.Geocoder(),
                    opts = { 'address' : $('#geoencode').val() },
                    self = this;
                    gc.geocode(opts, function (results, status) {
                        if (status == google.maps.GeocoderStatus.OK) {
                            var res = results[0];
                            var loc = results[0].geometry.location,
                            lat = Math.round(loc.lat()*1000000)/1000000,
                            lon = Math.round(loc.lng()*1000000)/1000000;
                            $('input#geoencode').val(res.formatted_address);
                            $('input[name=pos]').val(lon + ',' + lat);
                            self.showMap({lat: lat, lon: lon});
                            $('input#geoencode').attr('placeholder', '');
                            $('#btnUseCurrentGPS').val('Clear');
                            $('#btnUseCurrentGPS').buttonMarkup({ theme: 'c' }).button('refresh');
                        } else {
                        }
                    });
                } else {
                    var gps = getCurrentPosition();
                    $('input[name=pos]').val(gps.lon + ',' + gps.lat);
                    $('input#geoencode').attr('placeholder', '[Current location]');
                    this.showMap(gps);
                }
                return false;
            },
            
            showMap: function(pos) {
                var gps = getCurrentPosition();
                var latlng = new google.maps.LatLng(gps.lat, gps.lon);
                var options = {
                    zoom : 15,
                    center : latlng,
                    mapTypeId : google.maps.MapTypeId.ROADMAP
                };
                var $content = $("#gmap");
                $content.height ($(window).width() - 50);
                var map = new google.maps.Map($content[0], options);
                var dest = new google.maps.Marker ({
                    map : map,
                    animation : google.maps.Animation.DROP,
                    position : new google.maps.LatLng(parseFloat(pos.lat), parseFloat(pos.lon))
                });
                var curr = new google.maps.Marker ({
                    map : map,
                    icon: new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + 'FF0000'),
                    animation : google.maps.Animation.DROP,
                    position : latlng
                });
                map.fitBounds(map.getBounds().extend(dest.getPosition()));
            },
            
            geoencode_keyupHandler: function(event) {
                if($(event.target).val().length >= 1) {
                    $('#btnUseCurrentGPS').val('Search');
                    $('#btnUseCurrentGPS').buttonMarkup({ theme: 'e' }).button('refresh');
                } else {
                    $('#btnUseCurrentGPS').val('Current Position');
                    $('#btnUseCurrentGPS').buttonMarkup({ theme: 'c' }).button('refresh');
                }
            }
        });

        return NextJS;
    });