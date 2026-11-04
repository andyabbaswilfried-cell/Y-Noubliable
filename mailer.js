
require("dotenv").config();
const nodemailer =  require("nodemailer");
const transporter = nodemailer.createTransport(
    {
        secure:true,
        host:'smtp.gmail.com',
        port:
465,
        auth:{
            user:process.env.ADRESSEMAILYNOUBLIABLE,
            pass:process.env.MOTDEPASSEYNOUBLIABLE
        }
    }
)


async function sendMail(to,sub,msg){
    try{
    await transporter.sendMail({
        from:process.env.ADRESSEMAILYNOUBLIABLE,
        to:to,
        subject:sub,
        html:msg,
    });
    console.log("success")
    }
    catch (error){
        console.error(error)
        throw new Error("error")
    }
    
}
module.exports = sendMail