var mongoose = require("mongoose"),
    Schema = mongoose.Schema,
    Types = Schema.Types,
    ObjectId = Types.ObjectId,
    argv = require("optimist").argv;

var db = mongoose.createConnection("mongodb://" + argv.dbuser + ":" + argv.dbpass + "@" + argv.dbserver + ":" + argv.dbport + "/" + argv.dbname + "", {});
var UserSchema = Schema({
    type: String,
    username: String,
    facebook: {
        id: {
            type: Number,
            index: true,
            unique: true
        },
        accessToken: String,
        expires: Date,
        name: String,
        username: String,
        timezone: Number,
        locale: String
    },
    twitter: {
        id: {
            type: Number,
            index: true,
            unique: true
        },
        accessToken: String,
        accessTokenSecret: String,
        name: String,
        username: String,
        timezone: Number,
        locale: String
    },
    user_activities: [{type: ObjectId, ref: 'user_activities'}]
});

var ActivitySchema = Schema({
    name: String,
    description: String,
    begin: Date,
    end: Date,
    location: {type: [Number], index: '2d'},
    user_activities: [{type: ObjectId, ref: 'user_activities'}]
});

var UserActivtiySchema = Schema({
    activity: {type: ObjectId, ref: 'activities'},
    user: {type: ObjectId, ref: 'users'},
    owner: Boolean
});

module.exports.User = db.model('users', UserSchema);
module.exports.Activity = db.model('activities', ActivitySchema);
module.exports.UserActivties = db.model('user_activities', UserActivtiySchema);
