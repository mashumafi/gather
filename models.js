var mongoose = require("mongoose"),
    Schema = mongoose.Schema,
    Types = Schema.Types,
    ObjectId = Types.ObjectId,
    argv = require("optimist").argv;

var db = mongoose.createConnection("mongodb://" + argv.dbuser + ":" + argv.dbpass + "@" + argv.dbserver + ":" + argv.dbport + "/" + argv.dbname + "", {});
var UserSchema = new Schema({
    type: String,
    username: String,
    lastLogin: Date,
    facebook: {
        id: {
            type: Number,
            index: true,
            //unique: true
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
            //unique: true
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
module.exports.User = db.model('users', UserSchema);

var ActivitySchema = new Schema({
    name: String,
    desc: String,
    begin: Date,
    end: Date,
    pos: { type: { lon: Number, lat: Number }, index: '2d' },
    user_activities: [{type: ObjectId, ref: 'user_activities'}]
});
module.exports.Activity = db.model('activities', ActivitySchema);

var UserActivitySchema = new Schema({
    activity: {type: ObjectId, ref: 'activities'},
    user: {type: ObjectId, ref: 'users'},
    owner: Boolean,
    rating: Number,
    review: String,
    reviewed: Date
});
module.exports.UserActivity = db.model('user_activities', UserActivitySchema);
