define(['underscore', 'Backbone', 'text!/create.tpl'],
    function (_, Backbone, NextTPL) {

        var NextJS = Backbone.View.extend({

            events:{
                'click #btnBack':'btnBack_clickHandler'
            },

            render:function () {
                this.$el.html(_.template(NextTPL));
                var istime = /^((([0-1][0-9])|(2[0-3]))(:([0-5][0-9])))$/;
                var isdate = /^(([0-9]{4})-((0[1-9])|(1[0-2]))-((0[1-9])|([1-2][0-9])|(3[0-1])))$/;
                var isgps = /^(-?[1-8]?\d(?:\.\d{1,6})?|90(?:\.0{1,6})?),(-?(?:1[0-7]|[1-9])?\d(?:\.\d{1,6})?|180(?:\.0{1,6})?)$/;
                jQuery.validator.addMethod("time", function(value, element) { 
                    return this.optional(element) || istime.test(value); 
                }, "Please use the following format: 'hh:mm' where hh is 00-23 and mm is 00-59");
                jQuery.validator.addMethod("day", function(value, element) { 
                    return this.optional(element) || isdate.test(value); 
                }, "Please use the following format: yyyy-mm-dd where yyyy is 0000-9999, mm is 01-12 and dd 01-31");
                jQuery.validator.addMethod("gps", function(value, element) { 
                    return this.optional(element) || isgps.test(value); 
                }, "Please use the following format: ddd.dddddd, dd.dddddd (-180.000000,-90.000000)-(180.000000,90.000000)");
                $("#frmActivityCreate").validate({
            		rules: {
            			name: {
            				required: true,
            				minlength: 3
            			},
            			description: {
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
                    	location: {
            				required: true,
                            gps: true
            			}
            		},
            		submitHandler: function(form) {
            			$.ajax({
            				url: 'create',
            				data: $(form).serialize(),
            				type: 'POST',
            				success: function(result) {
            					console.log(result);
            					if(!result.error) {
            						// $.mobile.jqmNavigator.popView();
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

            btnBack_clickHandler:function (event) {
                $.mobile.jqmNavigator.popView();
            }
        });

        return NextJS;
    });