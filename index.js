require("dotenv").config();
const express = require('express');
const passport = require('passport');
const session = require('express-session');
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

app.post("/mail_ynov_token",async (req,res,)=> {
  const util = require("util");

const randomBytes = util.promisify(crypto.randomBytes);

const buff = await randomBytes(32);

const token = buff.toString("hex");
    
  
    let mail_ynov_user=req.body["email_ynov_bdx"];
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
   if (typeof(mail_ynov_user) === "string"&& emailRegex.test(mail_ynov_user) && mail_ynov_user.endsWith("@ynov.com")){
         mail_ynov_user=mail_ynov_user.toLowerCase()

        try{
            await sendMail(mail_ynov_user,"Vérification lien","Tiens ton lien:"+token)
            res.status(200).send(200)
            
            
        }catch(error){
            console.error(error)
         
            res.sendStatus(500)
    }
}else{
    res.status(400)
    console.log("erreur ton email n'est pas approprié")
     res.sendStatus(400)   
} 

});

app.listen(PORT,()=>{
    console.log("Server is running at 3000")
});
