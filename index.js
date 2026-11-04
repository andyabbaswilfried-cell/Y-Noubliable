require("dotenv").config();
const express = require('express');
const passport = require('passport');
const session = require('express-session');
const crypto = require('crypto');
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const PORT= 3000;

const mail = require("./mailer");
const sendMail = require("./mailer");
console.log(mail)
const app= express();
app.use(
    session({
    secret: process.env.SECRET,
    resave:false,
    saveUninitialized:false,
    })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname ));
app.use(
    express.urlencoded({
        extended: true,
  
    })
);
passport.use(
    new GoogleStrategy(
    {
    clientID: process.env.ID_CLIENT,
    clientSecret: process.env.CODE_SECRET_CLIENT,
    callbackURL: "http://localhost:3000/auth/google/callback",

}, (accessToken, refreshToken, profile, done) => {
    return done(null, profile)
})
);

passport.serializeUser((user, done) => done(null,user ));
passport.deserializeUser((user,done)=> done(null, user));

app.get("/",(req,res)=> {
    res.send("<a href='/auth/google'>Login</a>")
})

app.get(
    "/auth/google",
    passport.authenticate('google', {scope: ["profile","email"]})
);

app.get("/auth/google/callback", passport.authenticate('google',{failureRedirect: "/"}), (req, res) =>{
    res.redirect('/index.html')
});

app.get("/logout",(req,res)=>{
        req.logout();
        res.redirect("/");
});

app.post("/mail_ynov_token",async (req,res,) => {
    let mail_ynov_user=req.body["email_ynov_bdx"];
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (typeof(mail_ynov_user) === "string" && emailRegex.test(mail_ynov_user) && mail_ynov_user.endsWith("@ynov.com")) {
        mail_ynov_user=mail_ynov_user.toLowerCase();
        const token = crypto.randomBytes(32).toString("hex");
        req.session.emailVerificationToken = token;

        try {
            await sendMail(
                mail_ynov_user,
                "Vérification lien",
                `Tiens ton lien : <a href="http://localhost:3000/verification_mail?token=${token}">Vérifier ton email</a>`
            );
            res.sendStatus(200);
        } catch(error) {
            console.error(error)
            res.sendStatus(500);
        }
    } else {
        console.log("erreur ton email n'est pas approprié");
        res.sendStatus(400);
    }
});

app.get("/verification_mail", (req,res) => {
    const token = req.query.token;
    if (typeof token === "string" && token === req.session.emailVerificationToken) {
        delete req.session.emailVerificationToken;
        res.redirect("index.html");
    } else {
        res.sendStatus(400);
    }
});

app.listen(PORT,()=>{
    console.log("Server is running at 3000")
});
