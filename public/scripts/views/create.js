define(['underscore', 'Backbone', 'text!/create.tpl'],
    function (_, Backbone, NextTPL) {

        var NextJS = Backbone.View.extend({

            events:{
                'click #btnBack':'btnBack_clickHandler'
            },

            render:function () {
                this.$el.html(_.template(NextTPL));
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
                        var data = {
                            name: form.name.value,
                            description: form.description.value,
                            location: form.location.value,
                            begin: new Date(form.begindate.value + ' ' + form.begintime.value),
                            end: new Date(form.enddate.value + ' ' + form.endtime.value)
                            
                        };
            			$.ajax({
            				url: 'create',
            				data: data,
            				type: 'POST',
            				success: function(result) {
            					console.log(result);
            					if(!result.error) {
            						$.mobile.jqmNavigator.popView();
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