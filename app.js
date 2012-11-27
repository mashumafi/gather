var express = require('express'),
    routes = require('./routes'),
    user = require('./routes/user'),
    api = require('./routes/api'),
    http = require('http'),
    path = require('path'),
    argv = require("optimist").argv,
    models = require('./models'),
    User = models.User;

var everyauth = require('everyauth');

everyauth.debug = false;

console.log(argv);
//

everyauth.everymodule.findUserById(function(userId, callback) {
    User.findOne()
        .where('_id')
        .equals(userId)
        .select('type,username')
        .exec(function(err, user) {
            callback(err, user)
        });
});

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
            facebook: {
                id: fbUserMetadata.id,
                accessToken: accessToken,
                expires: new Date((new Date()).valueOf() + parseInt(accessTokExtra.expires)*1000),
                timezone: fbUserMetadata.timezone,
                locale: fbUserMetadata.locale,
                username: fbUserMetadata.username,
                name: fbUserMetadata.name
            }
        }}, {upsert: true}, function() {
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
app.get('/login.tpl', function(req, res) {
    res.render('login');
});
app.get('/schedule.tpl', function(req, res) {
    res.render('schedule');
});
app.get('/browse.tpl', function(req, res) {
    res.render('browse');
});

http.createServer(app).listen(app.get('port'), function() {
    console.log("Express server listening on port " + app.get('port'));
});
