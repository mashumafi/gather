var express = require('express'),
    routes = require('./routes'),
    user = require('./routes/user'),
    api = require('./routes/api'),
    http = require('http'),
    path = require('path'),
    argv = require("optimist").argv,
    async = require('async'),
    models = require('./models'),
    User = models.User,
    Activity = models.Activity,
    UserActivity = models.UserActivity;

var everyauth = require('everyauth');

everyauth.debug = false;

everyauth.everymodule.findUserById(function(userId, callback) {
    User.findOne()
        .where('_id')
        .equals(userId)
        .select('type username')
        .exec(function(err, user) {
            callback(err, user)
        });
});
everyauth.everymodule.logoutPath('/logout');
everyauth.everymodule.logoutRedirectPath('/');


everyauth.facebook
    .appId(argv.fbid)
    .appSecret(argv.fbsecret)
    .myHostname(argv.hostname)
    .mobile(true)
    .handleAuthCallbackError(function (req, res) {
    })
    .findOrCreateUser(function (session, accessToken, accessTokExtra, fbUserMetadata, server) {
        var promise = this.Promise();
        User.update(server.req.loggedIn ? {'_id':server.req.user._id} : {'facebook.id':fbUserMetadata.id}, {$set: {
            type: 'facebook',
            username: fbUserMetadata.username || fbUserMetadata.name,
            lastLogin: new Date,
            facebook: {
                id: fbUserMetadata.id,
                accessToken: accessToken,
                expires: new Date((new Date()).valueOf() + parseInt(accessTokExtra.expires)*1000),
                timezone: fbUserMetadata.timezone,
                locale: fbUserMetadata.locale,
                username: fbUserMetadata.username,
                name: fbUserMetadata.name
            }
        }}, {upsert: true}, function(err, result) {
            User.findOne()
                .where('facebook.id')
                .equals(fbUserMetadata.id)
                .select('_id')
                .exec(function(err, user) {
                    promise.fulfill(user);
                });
        });
        return promise;
    })
    .fields('id,timezone,locale,name,username')
    .redirectPath('/');

everyauth.twitter
    .myHostname(argv.hostname)
    .callbackPath('/auth/twitter/callback')
    .consumerKey(argv.twitkey)
    .consumerSecret(argv.twitsecret)
    .findOrCreateUser(function (session, accessToken, accessTokenSecret, twitterUserMetadata, server) {
        var promise = this.Promise();
        User.update(server.req.loggedIn ? {'_id':server.req.user._id} : {'twitter.id':twitterUserMetadata.id}, {$set: {
            username: twitterUserMetadata.screen_name || twitterUserMetadata.name,
            type: 'twitter',
            lastLogin: new Date,
            twitter: {
                id: twitterUserMetadata.id,
                accessToken: accessToken,
                accessTokenSecret: accessTokenSecret,
                timezone: twitterUserMetadata.utc_offset / 60 / 60,
                locale: twitterUserMetadata.lang,
                name: twitterUserMetadata.name,
                username: twitterUserMetadata.screen_name
            }
        }}, {upsert: true}, function() {
            User.findOne()
                .where('twitter.id')
                .equals(twitterUserMetadata.id)
                .select('_id')
                .exec(function(err, user) {
                    promise.fulfill(user);
                });
        });
        return promise;
    })
    .redirectPath('/');

var app = express();

app.configure(function() {
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.favicon());
    //app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser('some secret'));
    // app.use(express.cookieSession({ secret: 'esoognom'}));
    app.use(express.session({ secret: 'esoognom'}));
    app.use(everyauth.middleware());
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(app.router);
});

app.configure('development', function() {
    app.use(express.errorHandler());
});

app.get('/', function(req, res) {
    res.render('index', {
        loggedIn: req.loggedIn
    });
});
app.get('/api/join/:id', api);
app.get('/home.tpl', function(req, res) {
    res.render('home');
});
app.get('/create.tpl', function(req, res) {
    res.render('create');
});
// yyyy/mm/dd
var isdate = /^(([0-9]{4})-((0[1-9])|(1[0-2]))-((0[1-9])|([1-2][0-9])|(3[0-1])))$/;
// hh:mm
var istime = /^((([0-1][0-9])|(2[0-3]))(:([0-5][0-9])))$/;
// lat, long -90:90,-180:180
var isgps = /^(-?(?:1[0-7]|[1-9])?\d(?:\.\d{1,6})?|180(?:\.0{1,6})?),(-?[1-8]?\d(?:\.\d{1,6})?|90(?:\.0{1,6})?)$/;
app.post('/create', function(req, res) {
    if(req.loggedIn) {
        if(isgps.test(req.body.location)) {
            var location = req.body.location.split(',');
            var doc = {
                name: req.body.name,
                description: req.body.description,
                location: location,
                begin: req.body.begin,
                end: req.body.end
            };
            Activity.create(doc, function(err, activity) {
                if(err) {
                    // creation error
                } else {
                    UserActivity.create({user:req.user._id, activity: activity._id, owner: true, rating: 0}, function(err, user_activity) {
                        if(err) {
                            // creation error
                        } else {
                            res.send(activity);
                        }
                    });
                }
            });
        } else {
            // validation error
        }
    } else {
        res.send(null);
    }
});
app.post('/update', function(req, res) {
    UserActivity.findOne()
        .where('activity')
        .equals(req.body.id)
        .populate('activity')
        .where('user')
        .equals(req.user._id)
        .exec(function(err, result) {
            if(result.owner) {
                var activity = result.activity;
                activity.name = req.body.name;
                activity.description = req.body.description;
                activity.begin = req.body.begin;
                activity.end = req.body.end;
                activity.location = req.body.location.split(',');;
                activity.save(function(err, result) {
                    res.send(null);
                });
            }
        });
    
});
app.post('/delete', function(req, res) {
    UserActivity.findOne()
        .where('activity')
        .equals(req.body.id)
        .populate('activity')
        .where('user')
        .equals(req.user._id)
        .exec(function(err, result) {
            if(result.owner) {
                UserActivity.find()
                    .where('activity')
                    .equals(req.body.id)
                    .remove(function(err, count) {
                        result.activity.remove(function(err, result) {
                            res.send(null);
                        });
                    });
            }
        });
});
app.get('/login.tpl', function(req, res) {
    res.render('login');
});
app.get('/schedule.tpl', function(req, res) {
    res.render('schedule');
});
app.post('/schedule', function(req, res) {
    if(req.loggedIn) {
        async.waterfall([
            function(callback) {
                UserActivity.find()
                    .select('-_id -user -__v')
                    .populate('activity', 'name description begin location end', { end: { $gt: new Date(new Date(req.body.now)-1000*60*60*24*7) } })
                    .where('user')
                    .equals(req.user._id)
                    .exec(callback);
            }, function(activities, callback) {
                async.filter(activities, function(item, callback) {
                    callback(item.activity)
                }, function(results) {
                    callback(null, results);
                });
            }, function(activities, callback) {
                async.map(activities, function(item, callback) {
                    callback(null, {
                        name: item.activity.name,
                        description: item.activity.description,
                        begin: item.activity.begin,
                        end: item.activity.end,
                        _id: item.activity._id,
                        location: item.activity.location,
                        owner: item.owner,
                        rating: item.rating
                    });
                }, callback);
            }
        ], function (err, result) {
            res.send(result);
        });
        
    } else {
        res.send(null);
    }
});
app.get('/browse.tpl', function(req, res) {
    res.render('browse');
});
app.get('/browse_list.tpl', function(req, res) {
    res.render('browse_list');
});
app.post('/browse', function(req, res) {
    if(req.loggedIn) {
        async.waterfall([
            function(callback) {
                UserActivity.find()
                    .select('-_id -user -__v')
                    .populate('activity', '_id', { end: { $gt: new Date(req.body.now) }})
                    .where('user')
                    .equals(req.user._id)
                    .exec(callback);
            }, function(activities, callback) {
                async.filter(activities, function(item, callback) {
                    callback(item.activity)
                }, function(results) {
                    callback(null, results);
                });
            }, function(activities, callback) {
                async.map(activities, function(item, callback) {
                    callback(null, item.activity._id);
                }, callback);
            }, function(activities, callback) {
                Activity.find({_id: {$nin: activities}, location: { $near: req.body.location, $maxDistance: req.body.distance }})
                    .select('-__v -user_activities')
                    .where('end')
                    .gte(new Date(req.body.now))
                    .lte(new Date(req.body.latest))
                    .exec(callback);
            }
        ], function (err, result) {
            if(err) {
                // something went wrong
            } else {
                res.send(result);
            }
        });
    } else {
        res.send('Error');
    }
});
app.get('/details.tpl', function(req, res) {
    res.render('details');
});
app.post('/details', function(req, res) {
    if(req.loggedIn) {
        async.parallel({
            activity: function(callback) {
                Activity.findOne()
                    .select('-__v -user_activities')
                    .where('_id')
                    .equals(req.body.id)
                    .exec(callback);
            }, user_activity: function(callback) {
                UserActivity.findOne()
                    .where('activity')
                    .equals(req.body.id)
                    .where('user')
                    .equals(req.user._id)
                    .exec(callback);
            }, members: function(callback) {
                UserActivity.find()
                    .select('user -_id')
                    .where('activity')
                    .equals(req.body.id)
                    .populate('user', 'username')
                    .exec(callback);
            }
        }, function(err, item) {
            if(err) {
                res.send(null);
            }else {
                res.send({
                    name: item.activity.name,
                    description: item.activity.description,
                    begin: item.activity.begin,
                    end: item.activity.end,
                    _id: item.activity._id,
                    location: item.activity.location,
                    owner: item.user_activity ? item.user_activity.owner : null,
                    members: item.members
                });
            }
        });
    } else {
        res.send(null);
    }
});
app.post('/join', function(req, res) {
    if(req.loggedIn) {
        UserActivity.create({user:req.user._id, activity: req.body.id, owner: false, rating: 0}, function(err, user_activity) {
            if(err) {
                // creation error
            } else {
                res.send(user_activity);
            }
        });
    } else {
        res.send(null);
    }
});
app.post('/unjoin', function(req, res) {
    if(req.loggedIn) {
        UserActivity.remove({user:req.user._id, activity: req.body.id, owner: false}, function(err, user_activity) {
            if(err) {
                // remove error
            } else {
                res.send(null);
            }
        });
    } else {
        res.send(null);
    }
});
app.post('/rate', function(req, res) {
    if(req.loggedIn) {
        UserActivity.findOne({user:req.user._id, activity: req.body.id}, function(err, user_activity) {
            if(err) {
                // remove error
            } else {
                user_activity.rating = req.body.rating;
                user_activity.save(function(err, result) {
                    if(!err) {
                        
                    } else {
                        res.send(null);
                    }
                });
            }
        });
    } else {
        res.send(null);
    }
});
http.createServer(app).listen(app.get('port'), function() {
    console.log("Express server listening on port " + app.get('port'));
});
