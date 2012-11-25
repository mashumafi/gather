var mongoose = require("mongoose"),
    Schema = mongoose.Schema,
    Types = Schema.Types,
    ObjectId = Types.ObjectId,
    argv = require("optimist").argv;

var db = mongoose.createConnection("mongodb://" + argv.dbuser + ":" + argv.dbpass + "@" + argv.dbserver + ":" + argv.dbport + "/" + argv.dbname + "", {});
var UserSchema = Schema({
    type: String,
    facebook: {
        id: {
            type: Number,
            index: true
        },
        email: String,
        accessToken: String,
        expires: Date,
        name: {
            first: String,
            last: String
        },
        username: String,
        gender: String,
        timezone: Number,
        locale: String
    },
    twitter: {
        
    }
}), User;

User = db.model('users', UserSchema);

module.exports.User = User;