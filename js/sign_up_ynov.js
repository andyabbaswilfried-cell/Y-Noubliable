const sendMail = require("../mailer");
email_ynov= document.getElementById('email')
button_mail_ynov = document.getElementById('new');
button_mail_ynov.addEventListener('click',sendMail(email_ynov,Verification))
