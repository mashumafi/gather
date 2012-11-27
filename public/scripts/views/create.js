define(['underscore', 'Backbone', 'text!/create.tpl'],
    function (_, Backbone, NextTPL) {

        var NextJS = Backbone.View.extend({

            events:{
                'click #btnBack':'btnBack_clickHandler'
            },

            render:function () {
                this.$el.html(_.template(NextTPL, {list:[{name: 'test', description: 'test', begin: new Date, distance: 10}]}));
                var istime = /^((([0-1][0-9])|(2[0-3]))(:([0-5][0-9])))$/;
                // /^(((0[1-9])|(1[0-2]))(:([0-5][0-9])){2} (AM|PM))$/i
                jQuery.validator.addMethod("time", function(value, element) { 
                    return this.optional(element) || istime.test(value); 
                }, "Please use the following format: 'hh:mm' where hh is 00-23 and mm is 00-59");
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
                            date: true
            			},
            			begintime: {
            				required: true,
                            time: true
            			},
            			enddate: {
            				required: true,
                            date: true
            			},
            			endtime: {
            				required: true,
                            time: true
            			},
            			location: {
            				required: true
            			},
            			category: {
            				required: true
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
            						$.mobile.changePage('schedule.php', {
            							type: "post",
            							transition: "pop",
            							reverse: false,
            							changeHash: true
            						});
            					} else {
            						// display error
            					}
            				}
            			});
            		}
            	});
                return this;
            },

            btnBack_clickHandler:function (event) {
                $.mobile.jqmNavigator.popView();
            },
        });

        return NextJS;
    });