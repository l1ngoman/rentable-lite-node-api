const config = require('../../config');
const mysql  = require('mysql'); // https://www.npmjs.com/package/mysql
const connection = mysql.createConnection(config);

class Item {
    name;
    author_first_name;
    author_last_name;
    serial_number;

    constructor(name, author_first_name, author_last_name, serial_number) {
        this.name               = name;
        this.author_first_name  = author_first_name;
        this.author_last_name   = author_last_name;
        this.serial_number      = serial_number;
    }

    getAllItems(req, res) {
        const sql = 'SELECT * FROM items ORDER BY author_first_name';
        connection.query(sql, (error, result) => {
            if(error) {
                throw error;
            }
            res.status(200).json({
                message: `All items successfully retrieved.`,
                responseObject: result
            });
        })
    };

    getItem(req, res) {
        const item_id = parseInt(req.params.id);
        const sql = `SELECT * FROM items WHERE item_id = ${item_id}`;
        connection.query(sql, (error, result) => {
            if (error) {
                throw error;
            }
            res.status(200).json({
                message: `Item with ID: ${item_id} successfully retrieved.`,
                responseObject: result
            });   
        });
    };
    
    createNewItem(req, res) {
        const { name, author_first_name, author_last_name, serial_number } = req.body;
        const sql = `INSERT INTO items (name, author_first_name, author_last_name, serial_number) VALUES('${name}', '${author_first_name}', '${author_last_name}', '${serial_number}')`;
        connection.query(sql, (error, result) => {
            if(error) {
                throw error;
            }
            res.status(200).json({
                message: `All items successfully retrieved.`,
                responseObject: result
            });
        });
    };
    
    updateItem(req, res) {
        const item_id = parseInt(req.params.id)
        const { name, author_first_name, author_last_name, serial_number } = req.body;
        const sql = `UPDATE items SET name = '${name}', author_first_name = '${author_first_name}', author_last_name = '${author_last_name}', serial_number = '${serial_number}' WHERE item_id = ${item_id}`;
      
        connection.query(sql, (error, result) => {
            if (error) {
              throw error
            }
            res.status(200).json({
                message: `Item with ID: ${item_id} updated successfully.`,
                responseObject: result
            });
          }
        )
    };
    
    deleteItem (req, res) {
        const item_id = parseInt(req.params.id);
        const sql = `DELETE FROM items WHERE item_id = ${item_id}`;
    
        connection.query(sql, (error, result) => {
          if (error) {
            throw error;
          }
          res.status(200).json({
                message: `Item with ID: ${item_id} deleted successfully.`
          });
        });
    };
}

module.exports = Item;