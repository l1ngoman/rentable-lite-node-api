// HIDDEN SERVER SETTINGS

// ONLY LOAD ENV FILES FOR DEVELOPMENT
(process.env.NODE_ENV !== 'production') && require('dotenv').config(); // https://www.npmjs.com/package/dotenv

const { DB_USER, DB_HOST, DB_NAME, DB_PASSWORD, DB_INSECURE_AUTH, DB_DIALECT } = process.env;

const mysqlConfig = {
    user:           DB_USER             ||  'atg',
    password:       DB_PASSWORD         ||  'password',
    host:           DB_HOST             ||  'localhost',
    database:       DB_NAME             ||  'rentable-lite-api',
    insecureAuth:   DB_INSECURE_AUTH    ||  true
};

const sequelizeConfig = {
    database:        DB_NAME           || 'test',
    user:            DB_USER           || 'root',
    password:        DB_PASSWORD       || '',
    host:            DB_HOST           || '127.0.0.1',
    dialect:         DB_DIALECT        || 'mysql',
};

module.exports = {
    mysqlConfig,
    sequelizeConfig
};