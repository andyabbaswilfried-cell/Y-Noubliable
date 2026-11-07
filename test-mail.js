const { application } = require("express");

require("dotenv").config();
async function sendMail(to,sub,msg){
    try{
    let res = await fetch("https://api.brevo.com/v3/smtp/email",
        {method: "POST",
            headers:{
                "api-key":process.env.CLE_API,
                accept:"application/json",
                "content-type": "application/json"
            }, body: JSON.stringify({
                "sender":{email: process.env.ADRESSEYNOUBLIABLE},
                subject:sub,
                htmlContent:msg,
                to:[{email:to}]
            })
        }

       
    )
    }catch(error){
        console.error(error)
        throw error
    }
}