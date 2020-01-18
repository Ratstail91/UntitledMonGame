//environment variables
require('dotenv').config();

//libraries
let mysql = require('mysql2');
let fs = require('fs')
let path = require('path')

async function createTables(){
    let connection = mysql.createConnection({
        host: process.env.DB_HOST,
		user: process.env.DB_USER,
		password: process.env.DB_PASS,
		database: process.env.DB_NAME,
        port: process.env.DB_PORT,
        multipleStatements:true
    })

    // Get the file with sql statements
    let file = fs.readFileSync(path.join(__dirname, "..","sql", "update_database.sql"), {encoding:"utf-8"});
    connection.connect((err)=>{
        if (err) {
            console.log("Unable to connect to database " + err)
            return
        }
        connection.query(file, (err) => {
            if (err) {
                console.log("Mysql query error " + err)
            } else {
                console.log("Database is updated/created")
            }
            connection.end();
        })
    })
}

createTables()