const authResolver = require('./auth');
const eventsResolver = require('./events');
const bookingResolver = require('./booking');

//merge all our resolvers into a rootResolver
const rootResolver = {
  ...authResolver,
  ...eventsResolver,
  ...bookingResolver
};

module.exports = rootResolver;
