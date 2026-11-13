const sqlite3 = require("sqlite3")

const db = new sqlite3.Database("./users.db",(err)=>{
    if (err){
        return console.log(err)
    }
    console.log("Connection established")
})

db.run(`CREATE TABLE IF NOT EXISTS users(
    id integer  PRIMARY KEY AUTOINCREMENT,
    name text NOT NULL,
    email text NOT NULL,
    age integer NOT NULL
)`,(error)=>{
    db.get("SELECT * FROM users",(error,rows)=>{
        console.log(rows)
    })
})
//code


db.close((err)=>{
    if (err) {
        return console.log(err)
    }
    console.log("connection closed")
})