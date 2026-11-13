require("dotenv").config();
const express = require('express');
const passport = require('passport');
const session = require('express-session');
const crypto = require('crypto');
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const PORT = process.env.PORT || 3000;

const sendMail = require("./mailer");
const { create } = require("domain");

const twenty4hours= 86400000 
const sqlite3 = require("sqlite3")

const db = new sqlite3.Database("./users.db",(err)=>{
    if (err){
        return console.log(err)
    }
    console.log("Connection established")
})
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
    callbackURL: "https://y-noubliable.onrender.com/auth/google/callback"

}, (accessToken, refreshToken, profile, done) => {
    return done(null, profile)
})
);

passport.serializeUser((user, done) => done(null,user ));
passport.deserializeUser((user,done)=> done(null, user));

app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

function requireAuth(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    return res.redirect("/");
}

app.get("/", (req, res) => {
    res.sendFile("sign_up.html", { root: __dirname });
});

app.get("/index.html", requireAuth, (req, res) => {
    res.sendFile("index.html", { root: __dirname });
});

app.get(
    "/auth/google",
    passport.authenticate('google', {scope: ["profile","email"]})
);

app.get("/auth/google/callback", passport.authenticate('google',{failureRedirect: "/"}), (req, res) =>{
    res.redirect('/index.html')
});

app.get("/logout",(req,res)=>{
        req.logout();
        res.redirect("/sign_up.html");
});

app.post("/mail_ynov_token",async (req,res,) => {


    let mail_ynov_user=req.body["email_ynov_bdx"];
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (typeof(mail_ynov_user) === "string" && emailRegex.test(mail_ynov_user) && mail_ynov_user.endsWith("@ynov.com")) {
        mail_ynov_user=mail_ynov_user.toLowerCase();
        const token = crypto.randomBytes(32).toString("hex");
            db.run(`CREATE TABLE IF NOT EXISTS verification_users(
    id integer  PRIMARY KEY AUTOINCREMENT,
    token text NOT NULL,
    email text NOT NULL,
    expiration INTEGER NOT NULL
)`,(insert)=>{
     query= "INSERT INTO verification_users(token,email,expiration) VALUES(?,?,?)"
     values=[token,mail_ynov_user,Date.now()],
     db.run(query,values)

    })
        
    
       
        try {
            await sendMail(
                mail_ynov_user,
                "Lien de Vérification",
                `Tiens ton lien, tu n'as que 24 heures avant qu'il n'expire: <a href="https://y-noubliable.onrender.com/verification_mail?token=${token}">Vérifier ton email</a>`
            );
            res.redirect("/wait_confirmation.html");
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
    const time=  Date.now() -req.session.token_date_of_creation
    if (time > twenty4hours){
         res.sendStatus(400);
         return
    }
    token =db.get("SELECT token FROM verification_users",(error,rows)=>{
        if (!error){
            console.log(rows)
        }
        
    })
    if (typeof token === "string" && token === req.session.emailVerificationToken) {
        delete req.session.emailVerificationToken;

        const user = {
            email: req.session.emailVerificationEmail,
            provider: "ynov"
        };
        req.login(user, (err) => {
            if (err) {
                return res.sendStatus(500);
            }

            return res.redirect("/index.html");
        });
    } else {
        return res.sendStatus(400);
    }
});

app.use(express.static(__dirname));

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is running at ${PORT}`);
    });
}

module.exports = { app };
 
