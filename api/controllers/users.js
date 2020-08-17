const bcrypt = require('bcrypt');       // https://www.npmjs.com/package/bcrypt
const jwt = require('jsonwebtoken');    // https://www.npmjs.com/package/jsonwebtoken
const mysql  = require('mysql2');       // https://www.npmjs.com/package/mysql2
const { mysqlConfig } = require('../../config');
const { errorMonitor } = require('mysql2/lib/pool');
const connection = mysql.createConnection(mysqlConfig);
// const User = require('../models/user');

// /user/signup
exports.createNewUser = (req, res) => {
    const { first_name, last_name, email, password } = req.body;

    // ATG:: IF MATCH FUNCTION RETURNS NULL, THEN THE EMAIL IS INVALID
    if(email.match(/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/) == null){
        console.log('Invalid email');
        return res.status(409).json({
            message: 'Invalid email address. Please try again.'
        });
    }

    // ATG:: CHECK TO SEE IF USER ALREADY EXISTS, IE. EMAIL EXISTS
    connection.query(`SELECT user_id FROM users WHERE email='${email}'`, (error, result) => {
        if(error){
            throw error;
        } else {
            if(result.length == 0) {
                // ATG:: RUN BCRYPT TO HASH THE PASSWORD BEFORE STORING IT IN THE DB
                bcrypt.hash(password, 10, (error, hash) => {
                    if(error){
                        return res.status(500).json({error});
                    } else {
                        // const user = User.build(first_name, last_name, email);
                        // async () => await user.save();
                        // res.status(200).json({
                        //     message: `User successfully created.`,
                        //     responseObject: {
                        //         // id: result.insertId,
                        //         // ...req.body
                        //     }
                        // });
                    
                        const sql = `INSERT INTO users (first_name, last_name, email, password) VALUES('${first_name}', '${last_name}', '${email}', '${hash}')`;
                        connection.query(sql, (error, result) => {
                            if(error) {
                                throw error;
                            }
                            res.status(201).json({
                                message: `User successfully created.`,
                                responseObject: {
                                    id: result.insertId,
                                    first_name,
                                    last_name,
                                    email
                                }
                            });
                        });
                    } // END OF NO ERRORS DURING HASH
                });
            } else {
                console.log(`User with email ${email} already exists.`);
                console.log({
                    first_name,
                    last_name,
                    email
                });
                res.status(409).json({
                    message: `User with email ${email} already exists.`
                });
            }
        } // END OF NO ERROR
    });
};

// USER LOGIN '/user/login'
exports.logInUser = (req, res) => {
    if(req.body.email && req.body.password) {

        const { email, password } = req.body;
        const sql = `SELECT password FROM users WHERE email='${email}'`;
    
        connection.query(sql, (error, result) => {
            if (error){
                return res.status(401).json({
                    message: 'Authentication failed'
                });
                console.log(error);
            }
            bcrypt.compare(password, result[0].password, (err, compareSuccess) => {
                // ATG:: IF ERROR EXISTS OR compareSuccess IS FALSE, THROW ERROR MESSAGE
                if (err || !compareSuccess) {
                    return res.status(401).json({
                        message: 'Authentication failed.'
                    });
                    err && console.log(err);
                } else {
                    const token = jwt.sign(
                        {
                            email: result[0].email,
                            user_id: result[0].user_id
                        }, 
                        process.env.JWT_KEY, 
                        {
                            expiresIn: '1h'
                        }
                    );
                    return res.status(200).json({
                        message: 'Authentication successful.',
                        token
                    });
                }
            });
        });
    } else {
        res.status(401).json({
            message: "Invalid email or password."
        });
    }
};

exports.getUser = (req, res) => {
    const user_id = req.params.id;
    const sql = `SELECT * FROM users WHERE user_id = ${user_id}`;

    connection.query(sql, (error, result) => {
        if(error) {
            throw error;
        }
        res.status(200).json({
            message: `User with ID: ${user_id} successfully retrieved.`,
            responseObject: {
                user_id,
                first_name: result[0].first_name,
                last_name: result[0].last_name,
                email: result[0].email,
            }
        })
    });
};
    
exports.updateUser = (req, res) => {
    const user_id = parseInt(req.params.id)
    const { first_name, last_name, email } = req.body;
    const sql = `UPDATE users SET first_name = '${first_name}', last_name = '${last_name}', email = '${email}' WHERE user_id = ${user_id}`;
    
    connection.query(sql, (error, result) => {
        if (error) {
            throw error
        }
        res.status(200).json({
            message: `User with ID: ${user_id} updated successfully.`,
            responseObject: {
                user_id,
                first_name,
                last_name,
                email
            }
        });
    });
};

exports.changePassword = (req, res) => {
    const user_id = req.params.id;
    if( req.body.oldPassword && req.body.newPassword) {

        const { oldPassword, newPassword } = req.body;
        const sql = `SELECT password FROM users WHERE user_id='${user_id}'`;
    
        connection.query(sql, (error, result) => {
            console.log(result);
            if (error){
                console.log(error);
                return res.status(401).json({
                    message: 'Error updating password. Please try again'
                });
            }
            bcrypt.compare(oldPassword, result[0].password, (err, compareSuccess) => {
                // ATG:: IF ERROR EXISTS OR compareSuccess IS FALSE, THROW ERROR MESSAGE
                if (err || !compareSuccess) {
                    err && console.log(err);
                    return res.status(401).json({
                        message: 'Error updating password. Please try again.'
                    });
                } else {
                    bcrypt.hash(newPassword, 10, (error, hash) => {
                        if(error){
                            return res.status(500).json({error});
                        } else {
                            const sql2 = `UPDATE users SET password = '${hash}' WHERE user_id = ${user_id}`;
                            connection.query(sql, (error, result) => {
                                if(error) {
                                    throw error;
                                }
                                console.log(result);
                                res.status(200).json({
                                    message: `Password successfully updated.`
                                });
                            });
                        } // END OF NO ERRORS DURING HASH
                    });
                }
            });
        });
    } else {
        res.status(401).json({
            message: "Error updating password. Please try again."
        });
    }
};
    
exports.deleteUser = (req, res) => {
    const user_id = parseInt(req.params.id);
    const sql = `DELETE FROM users WHERE user_id = ${user_id}`;

    connection.query(sql, (error, result) => {
        if (error) {
            throw error;
        }
        res.status(200).json({
            message: `User with ID: ${user_id} deleted successfully.`
        });
    });
};
