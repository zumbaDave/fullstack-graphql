
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.get('Authorization');
    if(!authHeader) {
        //add isAuth field to request
        req.isAuth = false;
        return next();
    }
    //token will look like this in header
    //Authorization: Bearer tokenValue
    const token = authHeader.split(' ')[1]; //get second value
    if(!token || token === '') {
        req.isAuth = false;
        return next();
    }
    let decodedToken;
    try{
        decodedToken = jwt.verify(token, 'somesupersecretkey');
    } catch(err) {
        req.isAuth = false;
        return next();
    }
    if(!decodedToken) {
        req.isAuth = false;
        return next();
    }
    req.isAuth = true;
    //req.userId was set in auth.js file when user logs in
    //so we can retrieve here in middleware
    req.userId = decodedToken.userId;
    next();
};
