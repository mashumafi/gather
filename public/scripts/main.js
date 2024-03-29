require.config({
    paths:{
        // RequireJS plugin
        text:'libs/require/text',
        // RequireJS plugin
        domReady:'libs/require/domReady',
        // underscore library
        underscore:'libs/underscore/underscore',
        // Backbone.js library
        Backbone:'libs/backbone/backbone',
        // jQuery
        jquery:'libs/jquery/jquery-1.8.2',
        // jQuery Mobile framework
        jqm:'libs/jquery.mobile/jquery.mobile-1.2.0',
        // jQuery Mobile plugin for Backbone views navigation
        jqmNavigator:'libs/jquery.mobile/jqmNavigator',
        jqv: 'http://ajax.aspnetcdn.com/ajax/jquery.validate/1.7/jquery.validate.min',
        D8:'libs/d8',
    },
    shim:{
        Backbone:{
            deps:['underscore', 'jquery'],
            exports:'Backbone'
        },
        underscore:{
            exports:'_'
        },
        jqm:{
            deps:['jquery', 'jqmNavigator']
        },
        jqv:{
            deps:['jquery']
        },
        D8:{
            exports:'D8'
        }
    }
});

require(['domReady', 'views/login', 'views/home', 'jqm', 'jqv', 'D8'],
    function (domReady, LoginView, HomeView) {
        // domReady is RequireJS plugin that triggers when DOM is ready
        domReady(function () {
            var gps = {lon:0,lat:0};
            window.getCurrentPosition = function() {
                return gps;
            };
            window.parseGPS = function(str) {
                var res = str.match(isgps);
                return {lon:parseFloat(res[1]),lat:parseFloat(res[2])};
            };
            Math.distance = function(a, b) {
                return Math.sqrt(Math.pow(a.lon - b.lon, 2) + Math.pow(a.lat - b.lat, 2));
            };
            navigator.geolocation.getCurrentPosition(function (pos)
            {
                gps.lat = Math.round(pos.coords.latitude*1000000)/1000000;
                gps.lon = Math.round(pos.coords.longitude*1000000)/1000000;
                console.log(gps);
            });
            var istime = /^((([0-1][0-9])|(2[0-3]))(:([0-5][0-9])))$/;
            var isdate = /^(([0-9]{4})-((0[1-9])|(1[0-2]))-((0[1-9])|([1-2][0-9])|(3[0-1])))$/;
            var isgps = /^(-?(?:1[0-7]|[1-9])?\d(?:\.\d{1,6})?|180(?:\.0{1,6})?),(-?[1-8]?\d(?:\.\d{1,6})?|90(?:\.0{1,6})?)$/;
            jQuery.validator.addMethod("time", function(value, element) { 
                return this.optional(element) || istime.test(value); 
            }, "Please use the following format: 'hh:mm' where hh is 00-23 and mm is 00-59");
            jQuery.validator.addMethod("day", function(value, element) { 
                return this.optional(element) || isdate.test(value); 
            }, "Please use the following format: yyyy-mm-dd where yyyy is 0000-9999, mm is 01-12 and dd 01-31");
            jQuery.validator.addMethod("gps", function(value, element) { 
                return this.optional(element) || isgps.test(value); 
            }, "Please use the following format: ddd.dddddd,dd.dddddd (-90.000000,-180.000000)-(90.000000,180.000000)");
            Date.prototype.timespan = function(now) {
                var i = D8.create(now.getTime());
                var f = D8.create(this.getTime());
                if(i.timeBetween(f, 'days') > 1) {
                    return i.timeBetween(f, 'days') + ' days';
                } else if(i.timeBetween(f, 'hours') > 1) {
                    return i.timeBetween(f, 'hours') + ' hours';
                } else if(i.timeBetween(f, 'minutes') > 1) {
                    return i.timeBetween(f, 'minutes') + ' minutes';
                } else {
                    return i.timeBetween(f, 'seconds') + ' seconds';
                }
            }
            Array.prototype.distance = function() {
                var sum = 0;
                for(var i = 0; i < this.length; i++) {
                    sum += this[i] * this[i];
                }
                return Math.sqrt(sum);
            }
            function onDeviceReady(desktop) {
                // Hiding splash screen when app is loaded
                if (desktop !== true)
                    cordova.exec(null, null, 'SplashScreen', 'hide', []);

                // Setting jQM pageContainer to #container div, this solves some jQM flickers & jumps
                // I covered it here: http://outof.me/fixing-flickers-jumps-of-jquery-mobile-transitions-in-phonegap-apps/
                $.mobile.pageContainer = $('#container');

                // Setting default transition to slide
                $.mobile.defaultPageTransition = 'slide';

                // Pushing MainView
                if(user) {
                    $.mobile.jqmNavigator.pushView(new HomeView());
                } else {
                    $.mobile.jqmNavigator.pushView(new LoginView());
                }
            }

            if (navigator.userAgent.match(/(iPad|iPhone|Android)/) && false) {
                // This is running on a device so waiting for deviceready event
                document.addEventListener('deviceready', onDeviceReady, false);
            } else {
                // On desktop don't have to wait for anything
                onDeviceReady(true);
            }

        });

    });