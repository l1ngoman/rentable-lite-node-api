const Pool   = require('pg').Pool; // https://www.npmjs.com/package/pg
const config = require('../../config');
const pool   = new Pool(config);

const getAllCustomers = (req, res) => {
    const sql = 'SELECT * FROM customers ORDER BY last_name';
    pool.query(sql, (error, result) => {
        if(error) {
            throw error;
        }
        res.status(200).json({
            message: 'All customers successfully retrieved.',
            responseObject: result.rows
        });
    });
};

const getCustomer = (req, res) => {
    const customer_id = parseInt(req.params.id);
    const sql = "SELECT * FROM customers WHERE customer_id = $1";
    pool.query(sql, [customer_id], (error, result) => {
        if (error) {
            throw error;
        }
        res.status(200).json({
            message: `Customer with ID: ${customer_id} successfully retrieved.`,
            responseObject: result.rows
        });   
    });
};

const createNewCustomer = (req, res) => {
    const { first_name, last_name, address_1, address_2, city, state, zip, phone, email } = req.body;
    const sql = "INSERT INTO customers (first_name, last_name, address_1, address_2, city, state, zip, phone, email) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *";
    const values = [first_name, last_name, address_1, address_2, city, state, zip, phone, email];
    pool.query(sql, values, (error, result) => {
        if(error) {
            throw error;
        }
        res.status(201).json({
            message: `Customer created successfully.`,
            responseObject: result.rows
        });
    });
};

const updateCustomer = (req, res) => {
    const customer_id = parseInt(req.params.id)
    const { first_name, last_name, address_1, address_2, city, state, zip, phone, email } = req.body;
    const sql = "UPDATE customers SET first_name = $1, last_Name = $2, address_1 = $3, address_2 = $4, city = $5, state = $6, zip = $7, phone = $8, email = $9 WHERE customer_id = $10 RETURNING *";
    const values = [first_name, last_name, address_1, address_2, city, state, zip, phone, email, customer_id];
  
    pool.query(sql, values, (error, result) => {
        if (error) {
          throw error
        }
        console.log(result.rows);
        res.status(200).json({
            message: `Customer with ID: ${customer_id} updated successfully.`,
            responseObject: result.rows
        });
      }
    )
};

const deleteCustomer = (req, res) => {
    const customer_ID = parseInt(req.params.id);
    const sql = "DELETE FROM customers WHERE customer_id = $1";

    pool.query(sql, [customer_ID], (error, result) => {
      if (error) {
        throw error;
      }
      res.status(200).json({
            message: `Customer with ID: ${customer_ID} deleted successfully.`
      });
    });
};

module.exports = {
    getAllCustomers,
    getCustomer,
    createNewCustomer,
    updateCustomer,
    deleteCustomer
};