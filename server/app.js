require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
require("./db/conn")
const PORT = 3000;
const session = require("express-session");
const passport = require("passport");
const OAuth2Strategy = require("passport-google-oauth2").Strategy;
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const userdb = require("./model/userSchema")

const clientid = "15062273816-j11v7uc0e7bg7qjjd5v7magg69eb9ms1.apps.googleusercontent.com"
const clientsecret = "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"


app.use(cors({
    origin: "http://localhost:3001",
    methods: "GET,POST,PUT,DELETE",
    credentials: true
}));
app.use(express.json());

// setup session
app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true
}))

// setuppassport
app.use(passport.initialize());
app.use(passport.session());

passport.use(
    new OAuth2Strategy({
        clientID: clientid,
        clientSecret: clientsecret,
        callbackURL: "http://localhost:3000/auth/google/callback",
        scope: ["profile", "email"]
    },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await userdb.findOne({ googleId: profile.id });

                if (!user) {
                    user = new userdb({
                        googleId: profile.id,
                        displayName: profile.displayName,
                        email: profile.emails[0].value,
                        image: profile.photos[0].value
                    });

                    await user.save();
                }

                return done(null, profile);
            } catch (error) {
                return done(error, null);
            }
        }
    )
)

passport.use(new LinkedInStrategy({
    clientID: '77fb2bz9q0rea9',
    clientSecret: 'bHqXg86THhHVra0y',
    callbackURL: "http://localhost:3000/auth/linkedin/callback",
    scope: ['r_emailaddress', 'r_basicprofile'],
}, function (accessToken, refreshToken, profile, done) {
    return done(null, profile);

}));

// method to load index.ejs file on base path
app.get('/', function (req, res) {
    res.render('index', { user: req.user });
});

passport.serializeUser((user, done) => {
    done(null, user);
})

passport.deserializeUser((user, done) => {
    done(null, user);
});

// initial google ouath login
app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

app.get("/auth/google/callback", passport.authenticate("google", {
    successRedirect: "http://localhost:3001/dashboard",
    failureRedirect: "http://localhost:3001/login"
}))

/* GOOGLE ROUTER */
app.get('/auth/linkedin', passport.authenticate('linkedin', { scope: [ "r_emailaddress", "r_basicprofile" ]}));

app.get('/auth/linkedin/callback', passport.authenticate('linkedin', {
        successRedirect: 'http://localhost:3001/dashboard',
        failureRedirect: 'http://localhost:3001/login',
    })
);

app.get("/login/sucess", async (req, res) => {
    if (req.user) {
        res.status(200).json({ message: "user Login", user: req.user })
    } else {
        res.status(400).json({ message: "Not Authorized" })
    }
})

app.get("/logout", (req, res, next) => {
    req.logout(function (err) {
        if (err) { return next(err) }
        res.redirect("http://localhost:3001");
    })
})

app.listen(PORT, () => {
    console.log(`server start at port no ${PORT}`)
})
