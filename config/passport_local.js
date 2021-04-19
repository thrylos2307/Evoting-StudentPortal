const con = require("../privacy.js");
const passport = require('passport');

const LocalStrategy = require('passport-local').Strategy;
console.log('Inside passport_local strategy verify');
// authentication using passport
passport.use(new LocalStrategy(
    {
        usernameField: 'id',
        passReqToCallback: true
    },
    function (req, id, password, done) {
        //console.log(req.body, 'id=', id, 'pass=', password);
        // find a user and establish the identity
        // id = id.trim();


        if (req.body.login == 'student') {
            req.body.login = 'student_login';

            id = parseInt(id);
        }
        else if (req.body.login == 'faculty') {
            req.body.login = "faculty_login";

            id = parseInt(id);

        }
        else if (req.body.login == 'admin') {
            req.body.login = 'Admin';
        }
        var table = req.body.login;
        // table = table.trim();
        try {
            if (!password.match(/("true"|or|-)[^a-zA-Z0-9@_]/g)) {
                con.query(`select * from ${table} where id=? and Password=?`, [id, password], (err, user) => {
                    if (err) {
                        //req.flash('error', err);
                        console.log(err);
                        return done(null,false);
                    }
                    console.log(user[0]);
                    if (!user[0]) {
                        console.log('error', 'Invalid Username/Password');
                        
                        return done(null, false);
                    }
                    
                    console.log(`${user[0].id} signed in!`);
                    user[0].login = req.body.login;
                    req.session.type = req.body.login;
                    return done(null, user[0]);
                });
            }
        }
        catch {
            return done(null, false);
        }

    }
));

// serializing the user to decide which key is to be kept in the cookies
passport.serializeUser(function (user, done) {
    console.log('inside serialize');
    done(null, user);
});

// deserializing the user from the key in the cookies
passport.deserializeUser(function (user, done) {
    console.log('inside deserialize and login=>', user.login, ' id=>', user);
    con.query(`select * from ${user.login} where id='${user.id}'`, (err, users) => {
        //return done(null, user);
        if (err) {
           
            return done(err);
        }
        else if(!users){
                console.log('Error in finding user --> Passport');
                return done(null,false);
            }
        // console.log(users, user);
        return done(null, users[0]);
    });
});

// check if the user is authenticated
passport.checkAuthentication = function (req, res, next) {
    // if the user is signed in, then pass on the request to the next function(controller's action)
    console.log("i''m inside checkauth =>");
    if (req.isAuthenticated()) {
        console.log('user found in checkauth');
        console.log(req.body, req.user);
        return next();
    }
    console.log("user not signed in");
    // if the user is not signed in
    console.log('check type of login=>', req.body ,req.session);
    return res.render('login.ejs');
}

passport.setAuthenticatedUser = function (req, res, next) {
    console.log("inside setauth func");
    if (req.isAuthenticated()) {
        console.log('saving user info in setauth');
        // req.user contains the current signed in user from the session cookie and we are just sending it to the local for the views
        res.locals.user = req.user;
    }
    next();
}

module.exports = passport;