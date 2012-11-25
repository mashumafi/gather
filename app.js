var express = require('express'),
    routes = require('./routes'),
    user = require('./routes/user'),
    api = require('./routes/api'),
    http = require('http'),
    path = require('path'),
    models = require('./models'),
    User = models.User;

var everyauth = require('everyauth');

everyauth.debug = false;

everyauth.everymodule.findUserById(function(userId, callback) {
    console.log('Finding user: ', userId);
    User.findOne()
        .where('_id')
        .equals(userId)
        .select('type')
        .exec(function(err, user) {
            callback(err, user)
        });
});

everyauth.facebook
    .appId('412557932149131')
    .appSecret('10d819d5f82a3d136727113eec695880')
    .myHostname('http://gather.mashumafi.c9.io')
    .mobile(true)
    .handleAuthCallbackError(function (req, res) {
    })
    .findOrCreateUser(function (session, accessToken, accessTokExtra, fbUserMetadata) {
        var promise = this.Promise();
        User.update({'facebook.id':fbUserMetadata.id}, {$set: {
            type: 'facebook',
            facebook: {
                id: fbUserMetadata.id,
                email: fbUserMetadata.email,
                accessToken: accessToken,
                expires: new Date((new Date()).valueOf() + parseInt(accessTokExtra.expires)*1000),
                gender: fbUserMetadata.gender,
                timezone: fbUserMetadata.timezone,
                locale: fbUserMetadata.locale,
                username: fbUserMetadata.username,
                name: {
                    first: fbUserMetadata.first_name,
                    last: fbUserMetadata.last_name
                }
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
    .fields('id,gender,timezone,locale,first_name,last_name,username,email')
    .scope('email')
    .redirectPath('/');

everyauth.twitter
    .consumerKey('1BWKvr2LaycbWrNRBGQleg')
    .consumerSecret('9k07pTLzvjPG20Oc4t6DN0ptm2qmCL0KVtPXKrrWm0')
    .findOrCreateUser( function (session, accessToken, accessTokenSecret, twitterUserMetadata) {
        var promise = this.Promise();
        User.update({'twitter.id':twitterUserMetadata.id}, {$set: {
            type: 'twitter',
            facebook: {
                id: twitterUserMetadata.id,
                email: fbUserMetadata.email,
                accessToken: accessToken,
                expires: new Date((new Date()).valueOf() + parseInt(accessTokExtra.expires)*1000),
                timezone: fbUserMetadata.timezone,
                locale: fbUserMetadata.locale,
                username: twitterUserMetadata.screen_name,
                name: twitterUserMetadata.name
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
    if(req.loggedIn)
        console.log(req.user);
    res.render('index', {
        title: 'Login'
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

http.createServer(app).listen(app.get('port'), function() {
    console.log("Express server listening on port " + app.get('port'));
});
