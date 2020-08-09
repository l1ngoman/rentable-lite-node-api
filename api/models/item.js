const Pool   = require('pg').Pool; // https://www.npmjs.com/package/pg
const config = require('../../config');
const pool   = new Pool(config);

const getAllItems = (req, res) => {
    const sql = 'SELECT * FROM items ORDER BY name';
    pool.query(sql, (error, result) => {
        if(error) {
            throw error;
        }
        res.status(200).json({
            message: 'All items successfully retrieved.',
            responseObject: result.rows
        });
    });
};

const getItem = (req, res) => {
    const item_id = parseInt(req.params.id);
    const sql = "SELECT * FROM items WHERE item_id = $1";
    pool.query(sql, [item_id], (error, result) => {
        if (error) {
            throw error;
        }
        res.status(200).json({
            message: `Item with ID: ${item_id} successfully retrieved.`,
            responseObject: result.rows
        });   
    });
};

const createNewItem = (req, res) => {
    const { name, author_first_name, author_last_name, serial_number } = req.body;
    const sql = "INSERT INTO items (name, author_first_name, author_last_name, serial_number) VALUES($1, $2, $3, $4) RETURNING *";
    const values = [name, author_first_name, author_last_name, serial_number];
    pool.query(sql, values, (error, result) => {
        if(error) {
            throw error;
        }
        res.status(201).json({
            message: `Item with created successfully.`,
            responseObject: result.rows
        });
    });
};

const updateItem = (req, res) => {
    const item_id = parseInt(req.params.id)
    const { name, author_first_name, author_last_name, serial_number } = req.body;
    const sql = "UPDATE items SET name = $1, author_first_name = $2, author_last_name = $3, serial_number = $4 WHERE item_id = $5 RETURNING *";
    const values = [name, author_first_name, author_last_name, serial_number, item_id];
  
    pool.query(sql, values, (error, result) => {
        if (error) {
          throw error
        }
        res.status(200).json({
            message: `Item with ID: ${item_id} updated successfully.`,
            responseObject: result.rows
        });
      }
    )
};

const deleteItem = (req, res) => {
    const item_ID = parseInt(req.params.id);
    const sql = "DELETE FROM items WHERE item_id = $1";

    pool.query(sql, [item_ID], (error, result) => {
      if (error) {
        throw error;
      }
      res.status(200).json({
            message: `Item with ID: ${item_ID} deleted successfully.`
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