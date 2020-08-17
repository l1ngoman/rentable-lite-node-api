// HIDDEN SERVER SETTINGS

const { DB_USER, DB_HOST, DB_NAME, DB_PASSWORD, DB_INSECURE_AUTH } = process.env;

const mysqlConfig = {
    user:           DB_USER,
    password:       DB_PASSWORD,
    host:           DB_HOST,
    database:       DB_NAME,
    insecureAuth:   DB_INSECURE_AUTH
};

// const sequelizeConfig = {
//     database:        DB_NAME           || 'rentable-lite-api',
//     user:            DB_USER           || 'atg',
//     password:        DB_PASSWORD       || 'password',
//     host:            DB_HOST           || 'localhost',
//     dialect:         DB_DIALECT        || 'mysql',
// };

module.exports = {
    mysqlConfig,
};