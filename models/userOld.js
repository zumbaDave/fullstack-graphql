const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    createdEvents: [ //user can create many events, so we put them into an array
        {
            type: Schema.Types.ObjectId,
            ref: 'Event' //connect to Event event we made
        }
    ]
});

module.exports = mongoose.model('User', userSchema);
