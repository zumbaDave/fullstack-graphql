const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const bcrypt = require('bcryptjs');

//buildSchema makes it so we can use a string to create a graphql schema
//which means it takes care of converting our string schema into a javascript schema
const { buildSchema } = require('graphql');  //using es6 destructuring

const mongoose = require('mongoose');

//import our model we made with mongoose
const Event = require('./models/event');
const User = require('./models/user');

const app = express();

//array to store data before we started to use mongodb
//const events = [];

app.use(bodyParser.json());

//[String!]! will always only return a list of strings. not... a list of null events, and not null
//(name: String): String means parameter is a String and will return a String
//Every Event must have an id so ID! means it cannot be null
app.use('/graphql', graphqlHttp({
    schema: buildSchema(`
        type Event {
            _id: ID!
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        type User {
            _id: ID!
            email: String!
            password: String
        }

        input EventInput {
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        input UserInput {
            email: String!
            password: String!
        }

        type RootQuery {
            events: [Event!]!
        }

        type RootMutation {
            createEvent(eventInput: EventInput): Event
            createUser(userInput: UserInput): User
        }

        schema {
            query:  RootQuery
            mutation: RootMutation
        }
    `),
    rootValue: {
        events: () => { //needs to match name above in RootQuery
            //no longer storing dummy data in events array
            //return events;
            return Event.find()
                .then(events => {
                    //won't return events as is because there is a lot of metadata we don't need
                    return events.map(event => {
                        //following will cause an error because the id created by mongodbatlas is not a normal string, which graphql does not understand
                        //return { ...event._doc,};
                        //so we will overide the id to be a normal string
                        //following works, but because we are using mongoose, we can make this shorter
                        //return { ...event._doc, _id: event._doc._id.toString() };
                        return { ...event._doc, _id: event.id }; //using a virtual getter provided by mongoose
                    });
                })
                .catch(err => {
                    throw err;
                });
        },
        createEvent: (args) => {  //needs to be called createEvent because it is names createEvent above in RootMutation
            //const event = {
            //    _id: Math.random().toString(),
            //    title: args.eventInput.title,
            //    description: args.eventInput.description,
            //    price: +args.eventInput.price,  //+ sign converts it into a float fro a string
            //    date: args.eventInput.date
            //}
            //Mongoose Event
            const event = new Event({
                title: args.eventInput.title,
                description: args.eventInput.description,
                price: +args.eventInput.price,  //+ sign converts it into a float fro a string
                date: new Date(args.eventInput.date), //can use the Date object here
                creator: '5c1908c897e3d82118150161' //mongoose will convert this to an objectId for us
            });
            let createdEvent;
            //no longer need to store dummy data in array, since we are now using mongodb
            //events.push(event);
            //need to return this event
            return event
            .save()
            .then(result => {
                createdEent = { ...result._doc, _id: result._doc._id.toString() };
                return User.findById('5c1908c897e3d82118150161')
                //console.log(result);
                //resutl is an event so we can return it, but there is a lot of meta data in it
                //return result;
                //so we will return the document part of the result, which will leave out the metadata
                //following will cause an error because id given to us by mongodb atlas is not a normal string and thus graphql cannot understand it
                //return { ...result._doc};  //using the spread operator
                //return { ...result._doc, _id: result._doc._id.toString() };
            })
            .then(user => {
                if (!user) {
                  throw new Error('User not found.');
                }
                user.createdEvents.push(event);
                return user.save();  //will update exisiting user
            })
            .then(result => {
                return createdEvent;
            })
            .catch(err => {
                console.log(err);
                throw err;  //still need to return an event if there is an error, so we will throw the error
            });
            //return event;
            //can return result in then block since the result is an event
        },
        createUser: args => {
            return User.findOne({ email: args.userInput.email })
              .then(user => {
                if (user) {
                  throw new Error('User exists already.');
                }
                return bcrypt.hash(args.userInput.password, 12);
              })
              .then(hashedPassword => {
                const user = new User({
                  email: args.userInput.email,
                  password: hashedPassword
                });
                return user.save();
              })
              .then(result => {
                return { ...result._doc, password: null, _id: result.id };
              })
              .catch(err => {
                throw err;
              });
        }
    },
    graphiql: true
}));

mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@academind-cluster-owzpu.mongodb.net/${process.env.MONGO_DB}?retryWrites=true`)
    .then(() => {
        app.listen(3000);
    })
    .catch(err => {
        console.log(err);
    });



