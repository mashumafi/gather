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
    }
}), User;

User = db.model('users', UserSchema);

module.exports.User = User;
