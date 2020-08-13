// HIDDEN SERVER SETTINGS

// ONLY LOAD ENV FILES FOR DEVELOPMENT
(process.env.NODE_ENV !== 'production') && require('dotenv').config();

const { DB_USER, DB_HOST, DB_DATABASE, DB_PASSWORD } = process.env;

const config = {
    host: "localhost",
    user: "atg",
    database: 'rentable-lite-api',
    password: "password",
    insecureAuth: true
};

module.exports = config;