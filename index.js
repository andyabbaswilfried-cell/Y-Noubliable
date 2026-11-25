require("dotenv").config();
const express = require('express');
const passport = require('passport');
const session = require('express-session');
const crypto = require('crypto');
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const bcryot=reqyuire('bcrypt')
const slatRounds=10;
const multer = require('multer')
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })
app.post('/stats', upload.single('uploaded_file'), function (req, res) {
  // req.file is the name of your file in the form above, here 'uploaded_file'
  // req.body will hold the text fields, if there were any
  console.log(req.file, req.body)
});

const PORT = process.env.PORT || 3000;

const sendMail = require("./mailer");
const twenty4hours= 86400000;
const {createClient}  =require("@tursodatabase/serverless/compat");

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});


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
        try {
            await client.execute({
        sql:"INSERT INTO verification_users(token,email,expiration_date) VALUES(?,?,?)",
        args:[token,mail_ynov_user,Date.now()+twenty4hours]
    
    })
            await sendMail(
                mail_ynov_user,
                "Lien de Vérification",
                `<p>Bonjour,</p>
                <p>Nous avons bien reçu votre demande de vérification d'adresse e-mail.</p>
                <p>Pour confirmer votre adresse et accéder à votre espace, veuillez cliquer sur le lien ci-dessous :</p>
                <p><a href="https://y-noubliable.onrender.com/verification_mail?token=${token}">Confirmer mon adresse e-mail</a></p>
                <p>Ce lien est valable pendant 24 heures et ne peut être utilisé qu'une seule fois.</p>
                <p>Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer ce message en toute sécurité.</p>
                <p>Cordialement,<br>L'équipe Y-Noubliable</p>`
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

//cp
app.get("/verification_mail", async (req, res) => {
    const token = req.query.token;

    if (typeof token !== "string") {
        return res.sendStatus(400);
    }

    try {
        const result = await client.execute({
            sql: "SELECT token, email, expiration_date FROM verification_users WHERE token = ?",
            args: [token]
        });

        const row = result.rows?.[0];

        if (!row) {
            return res.sendStatus(400);
        }

        if (Date.now() >= Number(row.expiration_date)) {
            return res.sendStatus(400);
        }

        const user = {
            email: row.email,
            provider: "ynov"
        };
        const delete_user= await client.execute({
        sql:"DELETE FROM verification_users WHERE token = ?",
        args:[token],
            })
            console.log(delete_user)

        req.login(user, (err) => {
            if (err) {
                return res.sendStatus(500);
            }

            return res.redirect("/setup_login.html");
        });
    } catch (error) {
        console.error(error);
        return res.sendStatus(500);
    }
});

app.post("/create_user_account",upload.single('profile_photo'),async(req,res)=>{
    const email= req.body["email"];
    const first_name=req.body["fname"];
    const last_name=req.body["lname"];
    bcrypt.genSalt(saltRounds, (err, salt) => {
    if (err) {
        // Handle error
        return;
    }

    // Salt generation successful, proceed to hash the password
    });
    const userPassword = req.body["pword"]; // Replace with the actual password
    bcrypt.hash(userPassword, salt, (err, hash) => {
        if (err) {
            // Handle error
            return;
        }

    // Hashing successful, 'hash' contains the hashed password
    console.log('Hashed password:', hash);
    });
    const description = req.body["description"]; 
    const user_classe = req.body["user_classe"];
    const date_of_birth = req.body["date_of_birth"]
    const photo_de_profil =req.file.buffer;
     const user_filiere = req.body["classe"];
    const email_acceptation = req.body["filiere"];
        try{
        await client.execute({
            sql:"INSERT INTO ynoubliables_users(email,first_name,last_name,password,description,photo_de_profil,user_classe,user_filiere,email_acceptation,date_od_birth) VALUES(?,?,?,?;?;?;?,?,?,?<)",
            args:[email,first_name,last_name,userPassword,description,photo_de_profil,user_classe,filiere,email_acceptation,date_of_birth]
        })
    }
    catch(e){
        return  res.sendStatus(e)
    }


})
app.use(express.static(__dirname));

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is running at ${PORT}`);
    });
}

module.exports = { app };
 
