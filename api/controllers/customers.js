const { mysqlConfig } = require('../../config');
const mysql  = require('mysql'); // https://www.npmjs.com/package/mysql
const connection = mysql.createConnection(mysqlConfig);

exports.getAllCustomers = (req, res) => {
    const sql = 'SELECT * FROM customers ORDER BY last_name';
    connection.query(sql, (error, result) => {
        if(error) {
            throw error;
        }
        res.status(200).json({
            message: `All customers successfully retrieved.`,
            responseObject: result
        });
    })
};

exports.getCustomer = (req, res) => {
    const customer_id = parseInt(req.params.id);
    const sql = `SELECT * FROM customers WHERE customer_id = ${customer_id}`;
    connection.query(sql, (error, result) => {
        if(error) {
            throw error;
        }
        const sql2 = `  SELECT r.rental_id, r.order_number as rental_order_number, r.order_date, r.status,
                            i.item_id, i.name, i.author_first_name, i.author_last_name, i.serial_number,
                            p.pickup_id, p.order_number as pickup_order_number
                        FROM rentals r
                        LEFT JOIN items i
                            ON r.item_id = i.item_id
                        LEFT JOIN pickups p
                            ON r.rental_id = p.pickup_id
                        WHERE customer_id = ${customer_id}`;

        connection.query(sql2, (error2, result2) => {
            if(error2) {
                throw error2;
            }
            const sql3 = `  SELECT p.pickup_id, p.order_number as pickup_order_number, p.pickup_date, p.status,
                                r.rental_id, r.order_number as rental_order_number, i.*
                            FROM pickups p
                            LEFT JOIN rentals r
                                ON p.rental_id = r.rental_id
                            LEFT JOIN items i
                                ON r.item_id = i.item_id
                            WHERE r.customer_id = ${customer_id}`;

            connection.query(sql3, (error3, result3) => {
                if(error3) {
                    throw error3;
                }

                result[0]['rentals'] = result2;
                result[0]['pickups'] = result3;

                res.status(200).json({
                    message: `Customer with ID: ${customer_id} successfully retrieved.`,
                    responseObject: result
                });  
            });
        }); 
    });
};

exports.createNewCustomer = (req, res) => {
    const { first_name, last_name, address_1, address_2, city, state, zip, phone, email } = req.body;
    const sql = (`  
            INSERT INTO customers (first_name, last_name, address_1, address_2, city, state, zip, phone, email) 
            VALUES('${first_name}', '${last_name}', '${address_1}', '${address_2}', '${city}', '${state}', '${zip}', '${phone}', '${email}')
    `);
    connection.query(sql, (error, result) => {
        if(error) {
            throw error;
        }
        res.status(201).json({
            message: `Customer successfully created.`,
            responseObject: {
                id: result.insertId,
                ...req.body
            }
        });
    });
};

exports.updateCustomer = (req, res) => {
    const customer_id = parseInt(req.params.id)
    const { first_name, last_name, address_1, address_2, city, state, zip, phone, email } = req.body;
    const sql = (`
        UPDATE customers 
        SET first_name  = '${first_name}', 
            last_name   = '${last_name}', 
            address_1   = '${address_1}', 
            address_2   = '${address_2}',
            city        = '${city}',
            state       = '${state}',
            zip         = '${zip}',
            phone       = '${phone}',
            email       = '${email}',
        WHERE customer_id = ${customer_id}
    `);
    
    connection.query(sql, (error, result) => {
        if (error) {
            throw error
        }
        res.status(200).json({
            message: `Customer with ID: ${customer_id} updated successfully.`,
            responseObject: {
                user_id,
                ...req.body
            }
        });
        }
    )
};

exports.deleteCustomer = (req, res) => {
    const customer_id = parseInt(req.params.id);
    const sql = `DELETE FROM customers WHERE customer_id = ${customer_id}`;

    connection.query(sql, (error, result) => {
        if (error) {
        throw error;
        }
        res.status(200).json({
            message: `Customer with ID: ${customer_id} deleted successfully.`
        });
    });
};
