const config = require('../../config');
const mysql  = require('mysql'); // https://www.npmjs.com/package/mysql
const connection = mysql.createConnection(config);

class User {
    first_name;
    last_name;
    email;

    constructor(first_name, last_name, email) {
        this.first_name = first_name;
        this.last_name  = last_name;
        this.email      = email;
    }

    getAllUsers(req, res) {
        const sql = 'SELECT * FROM users ORDER BY last_name';
        connection.query(sql, (error, result) => {
            if(error) {
                throw error;
            }
            res.status(200).json({
                message: `All users successfully retrieved.`,
                responseObject: result
            });
        })
    };

    getUser(req, res) {
        const user_id = parseInt(req.params.id);
        const sql = `SELECT * FROM users WHERE user_id = ${user_id}`;
        connection.query(sql, (error, result) => {
            if (error) {
                throw error;
            }
            res.status(200).json({
                message: `User with ID: ${user_id} successfully retrieved.`,
                responseObject: result
            });   
        });
    };
    
    createNewUser(req, res) {
        const { first_name, last_name, email } = req.body;
        const sql = `INSERT INTO users (first_name, last_name, email) VALUES('${first_name}', '${last_name}', '${email}')`;
        connection.query(sql, (error, result) => {
            if(error) {
                throw error;
            }
            res.status(200).json({
                message: `All users successfully retrieved.`,
                responseObject: {
                    id: result.insertId,
                    ...req.body
                }
            });
        });
    };
    
    updateUser(req, res) {
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
                    ...req.body
                }
            });
          }
        )
    };
    
    deleteUser (req, res) {
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
}

module.exports = User;