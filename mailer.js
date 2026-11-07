
require("dotenv").config();

async function sendMail(to,sub,msg){
    try{
      let res = await fetch("https://api.brevo.com/v3/smtp/email" ,{
            'method': 'POST',
                headers:{'accept': 'application/json',
                    'api-key':process.env.CLE_API,
                    'content-type': 'application/json'},body:JSON.stringify({"sender":{"email":process.env.ADRESSEMAILYNOUBLIABLE},subject:sub,htmlContent:msg,to:[{"email":to}]})
       });
       if (res.ok  === false){
         
                 throw new Error("Failed to send email")
             }
             console.log("success")
        } catch (error) {
            console.error(error)
            throw error
        }
}

module.exports=sendMail