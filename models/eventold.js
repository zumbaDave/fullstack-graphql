const mongoose = require('mongoose');

const Schema = mongoose.Schema;

//our schema like our plan
//but we still have to make a model to use it
const eventSchema = new Schema({
    //Could make title just a string
    //title:  String
    //But we want to make it of type object
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User' //connect to User model we made
    }
});

//make model to use above Schema
module.exports = mongoose.model('Event', eventSchema);
