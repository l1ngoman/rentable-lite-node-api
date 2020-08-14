const config = require('../../config');
const mysql  = require('mysql'); // https://www.npmjs.com/package/mysql
const connection = mysql.createConnection(config);

const getAllItems = (req, res) => {
    const sql = 'SELECT * FROM items ORDER BY author_last_name';
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

const getItem = (req, res) => {
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

const createNewItem = (req, res) => {
    const { name, author_first_name, author_last_name, serial_number } = req.body;
    const sql = `INSERT INTO items (name, author_first_name, author_last_name, serial_number) VALUES('${name}', '${author_first_name}', '${author_last_name}', '${serial_number}')`;
    connection.query(sql, (error, result) => {
        if(error) {
            throw error;
        }
        res.status(200).json({
            message: `Item successfully created.`,
            responseObject: {
                id: result.insertId,
                ...req.body
            }
        });
    });
};

const updateItem = (req, res) => {
    const item_id = parseInt(req.params.id)
    const { name, author_first_name, author_last_name, serial_number } = req.body;
    const sql = `UPDATE items SET name = '${name}', author_first_name = '${author_first_name}', author_last_name = '${author_last_name}', serial_number = '${serial_number}' WHERE item_id = ${item_id}`;
    
    connection.query(sql, (error, result) => {
        if (error) {
            throw error
        }
        res.status(200).json({
            message: `Item with ID: ${item_id} updated successfully.`,
            responseObject: {
                user_id,
                ...req.body
            }
        });
        }
    )
};

const deleteItem = (req, res) => {
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

module.exports = {
    getAllItems,
    getItem,
    createNewItem,
    updateItem,
    deleteItem
};