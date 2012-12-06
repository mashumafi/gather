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
                if($('#geoencode').val().length >= 1) {
                    var gc = new google.maps.Geocoder(),
                    opts = { 'address' : $('#geoencode').val() };
                    gc.geocode(opts, function (results, status) {
                        if (status == google.maps.GeocoderStatus.OK) {
                            var res = results[0];
                            var loc = results[0].geometry.location,
                            lat = Math.round(loc.$a*1000000)/1000000,
                            lon = Math.round(loc.ab*1000000)/1000000;
                            $('input#geoencode').val(res.formatted_address);
                            $('input[name=pos]').val(lon + ',' + lat);
                            $('input#geoencode').attr('placeholder', '');
                        } else {
                        }
                    });
                } else {
                    var gps = getCurrentPosition();
                    $('input[name=pos]').val(gps.lon + ',' + gps.lat);
                    $('input#geoencode').attr('placeholder', '[Current location]');
                }
                $('#btnUseCurrentGPS').val('Clear');
                $('#btnUseCurrentGPS').buttonMarkup({ theme: 'c' }).button('refresh');
                return false;
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