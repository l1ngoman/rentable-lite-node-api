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

    // ATG:: NOW QUERY FOR ALL RELATED RENTALS FOR THIS CUSTOMER
    const sql1 = `  SELECT c.customer_id, c.first_name, c.last_name, c.address_1, c.address_2, c.city, c.state, c.zip, c.phone, c.email,
                        r.rental_id, r.rental_number, r.rental_date, r.delivery_date, r.rental_status, r.delivery_fee,
                        rli.rental_item_id, rli.unit_cost, rli.unit_tax_amount,
                        i.item_id, i.item_name, i.item_description, i.tracking_number, i.serial_number
                    FROM rentals r
                    LEFT JOIN customers c
                        ON r.customer_id = c.customer_id
                    LEFT JOIN rental_line_items rli
                        ON r.rental_id = rli.rental_id
                    LEFT JOIN items i
                        ON rli.item_id = i.item_id
                    LEFT JOIN pickups p
                        ON r.rental_id = p.pickup_id
                    WHERE r.customer_id = ${customer_id}`;
    connection.query(sql1, (error1, result1) => {
        if(error1) {
            throw error1;
        }
        // ATG:: NOW QUERY FOR ALL RELATED PICKUPS FOR THIS CUSTOMER
        const sql2 = `  SELECT p.pickup_id, p.pickup_number, p.pickup_date, p.pickup_actual_date, p.pickup_status,
                            r.rental_id, r.rental_number,
                            pli.pickup_item_id,
                            i.item_id, i.item_name, i.item_description, i.tracking_number, i.serial_number
                        FROM pickups p
                        LEFT JOIN rentals r
                            ON p.rental_id = r.rental_id
                        LEFT JOIN pickup_line_items pli
                            ON p.pickup_id = pli.pickup_id
                        LEFT JOIN items i
                            ON pli.item_id = i.item_id
                        WHERE r.customer_id = ${customer_id}`;
        connection.query(sql2, (error2, result2) => {
            if(error2) {
                throw error2;
            }

            // ATG:: CALL PRIVATE FUNCTION TO FORMAT THE RENTAL PORTION OF THE CUSTOMER OBJECT
            // TAKES THE FIRST QUERY RESULT
            // RETURNS A CUSTOMER OBJECT WITH FORMATTED RENTAL HISTORY
            formattedCustomer = _formatRentalJSON(result1);
            // ATG:: NOW CALL ANOTHER PRIVATE FUNCTION TO FORMAT THE PICKUP PORTION OF THE CUSTOM OBJECT
            // TAKES THE NEW CUSTOMER OBJECT AND THE SECOND QUERY RESULT
            // RETURNS THE FINAL CUSTOMER OBJECT WITH FORMATTED RENTAL & PICKUP HISTORY
            formattedCustomer = _formatPickupJSON(formattedCustomer, result2);

            res.status(200).json({
                message: `Customer with ID: ${customer_id} successfully retrieved.`,
                responseObject: formattedCustomer
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

/**********************************************************************************/
/**********************************************************************************/
/****************************** HELPER FUNCTIONS **********************************/
/**********************************************************************************/
/**********************************************************************************/

// ATG:: INTERNAL FUNCTION FOR FORMATTING THE RENTAL JSON WITH LINE ITEMS
const _formatRentalJSON = function(queryResult) {
    let formattedCustomer;
    let formattedRentals = {};
    let formattedRentalLineItems = {};
    if(queryResult.length > 0) {
        for(let el in queryResult) {
            // ATG:: EXTRACT THE RENTAL ID FROM THE QUERY RESULT
            let rental_id = queryResult[el].rental_id;

            if(formattedCustomer === undefined) {
                formattedCustomer = {
                    customer_id:    queryResult[el].customer_id,
                    first_name:     queryResult[el].first_name,
                    last_name:      queryResult[el].last_name,
                    address_1:      queryResult[el].address_1,
                    address_2:      queryResult[el].address_2,
                    city:           queryResult[el].city,
                    state:          queryResult[el].state,
                    zip:            queryResult[el].zip,
                    phone:          queryResult[el].phone,
                    email:          queryResult[el].email,
                    rentals:        null,
                    pickups:        null
                };
            }

            // ATG:: IF THE FORMATTED RENTAL OBJECT AT THE RENTAL ID IS UNDEFINED, CREATE THE OBJECT WITH THE PROPERTIES OF THE QUERY RESULTS FROM THIS ITERATION
            if(formattedRentals[rental_id] === undefined) {
                formattedRentals[rental_id] = {
                    rental_id:              queryResult[el].rental_id,
                    rental_number:          queryResult[el].rental_number,
                    rental_date:            queryResult[el].rental_date,
                    delivery_date:          queryResult[el].delivery_date,
                    rental_status:          queryResult[el].rental_status,
                    delivery_fee:           queryResult[el].delivery_fee,
                    items:                  null
                };
            }

            // ATG:: IF THE FORMATTED RENTAL LINE ITEMS OBJECT AT THE RENTAL ID IS UNDEFINED AND THE QUERY RESULT FROM THIS ITERATION IS NOT NULL, CREATE ITS FIRST OBJECT WITH THE QUERY RESULTS FROM THIS ITERATION
            if( (formattedRentalLineItems[rental_id] === undefined) && (queryResult[el].rental_item_id !== null) ) {
                formattedRentalLineItems[rental_id] = [{
                    rental_item_id:     queryResult[el].rental_item_id,
                    unit_cost:          queryResult[el].unit_cost,
                    unit_tax_amount:    queryResult[el].unit_tax_amount,
                    item_id:            queryResult[el].item_id,
                    item_name:          queryResult[el].item_name,
                    item_description:   queryResult[el].item_description,
                    tracking_number:    queryResult[el].tracking_number,
                    serial_number:      queryResult[el].serial_number,
                    item_status:        'ACTIVE'
                }];
            // ATG:: ELSE, STILL CHECKING IF THE QUERY RESULT FROM THIS ITERATION IS NOT NULL, PUSH IN ANOTHER OBJECT USING THE QUERY RESULTS FROM THIS INTERATION
            } else if(queryResult[el].rental_item_id !== null) {
                formattedRentalLineItems[rental_id].push({
                    rental_item_id:     queryResult[el].rental_item_id,
                    unit_cost:          queryResult[el].unit_cost,
                    unit_tax_amount:    queryResult[el].unit_tax_amount,
                    item_id:            queryResult[el].item_id,
                    item_name:          queryResult[el].item_name,
                    item_description:   queryResult[el].item_description,
                    tracking_number:    queryResult[el].tracking_number,
                    serial_number:      queryResult[el].serial_number,
                    item_status:        'ACTIVE'
                });
            }
        } // END OF FOR LOOP
    } // END OF LENGTH > 0

    // ATG:: NOW LOOP THROUGH THE LINE ITEMS TO PUSH THEM INTO THE CORRESPONDING ITEMS ARRAY FOR THEIR RENTAL ID
    for(let el in formattedRentalLineItems) {
        formattedRentals[el]['items'] = formattedRentalLineItems[el];
    }

    // ATG:: NOW LOOP THROUGH THE RENTAL OBJECT OF RENTAL OBJECTS AND PUSH ALL THE INNER OBJECTS INTO AN ARRAY TO BE MORE ACCESSIBLE TO THE USER
    rentalArray = [];
    rentalArrayKeys = Object.keys(formattedRentals)

    for (let i = 0; i < rentalArrayKeys.length; i++) {
        rentalArray.push(formattedRentals[rentalArrayKeys[i]]);
    }

    // ATG:: ADD THE RENTALS TO THE FORMATTED CUSTOMER OBJECT
    formattedCustomer['rentals'] = rentalArray;

    return formattedCustomer;
}

// ATG:: INTERNAL FUNCTION FOR FORMATTING THE PICKUP JSON WITH LINE ITEMS
const _formatPickupJSON = function(formattedCustomer, queryResult) {
    let formattedPickups = {};
    let formattedPickupLineItems = {};
    if(queryResult.length > 0) {
        for(let el in queryResult) {
            // ATG:: EXTRACT THE RENTAL ID FROM THE QUERY RESULT
            let pickup_id = queryResult[el].pickup_id;

            // ATG:: IF THE FORMATTED RENTAL OBJECT AT THE RENTAL ID IS UNDEFINED, CREATE THE OBJECT WITH THE PROPERTIES OF THE QUERY RESULTS FROM THIS ITERATION
            if(formattedPickups[pickup_id] === undefined) {
                formattedPickups[pickup_id] = {
                    pickup_id:                  queryResult[el].pickup_id,
                    pickup_number:              queryResult[el].pickup_number,
                    pickup_date:                queryResult[el].pickup_date,
                    pickup_actual_date:         queryResult[el].pickup_actual_date,
                    pickup_status:              queryResult[el].pickup_status,
                    associated_rental_id:       queryResult[el].rental_id,
                    associated_rental_number:   queryResult[el].rental_number,
                    items:                      null
                };
            }

            // ATG:: IF THE FORMATTED RENTAL LINE ITEMS OBJECT AT THE RENTAL ID IS UNDEFINED AND THE QUERY RESULT FROM THIS ITERATION IS NOT NULL, CREATE ITS FIRST OBJECT WITH THE QUERY RESULTS FROM THIS ITERATION
            if( (formattedPickupLineItems[pickup_id] === undefined) && (queryResult[el].pickup_item_id !== null) ) {
                formattedPickupLineItems[pickup_id] = [{
                    pickup_item_id:     queryResult[el].pickup_item_id,
                    item_id:            queryResult[el].item_id,
                    item_name:          queryResult[el].item_name,
                    item_description:   queryResult[el].item_description,
                    tracking_number:    queryResult[el].tracking_number,
                    serial_number:      queryResult[el].serial_number,    
                }];
            // ATG:: ELSE, STILL CHECKING IF THE QUERY RESULT FROM THIS ITERATION IS NOT NULL, PUSH IN ANOTHER OBJECT USING THE QUERY RESULTS FROM THIS INTERATION
            } else if(queryResult[el].pickup_item_id !== null) {
                formattedPickupLineItems[pickup_id].push({
                    pickup_item_id:     queryResult[el].pickup_item_id,
                    item_id:            queryResult[el].item_id,
                    item_name:          queryResult[el].item_name,
                    item_description:   queryResult[el].item_description,
                    tracking_number:    queryResult[el].tracking_number,
                    serial_number:      queryResult[el].serial_number,
                });
            }
        } // END OF FOR LOOP
    } // END OF LENGTH > 0

    // ATG:: NOW LOOP THROUGH THE LINE ITEMS TO PUSH THEM INTO THE CORRESPONDING ITEMS ARRAY FOR THEIR RENTAL ID
    for(let el in formattedPickupLineItems) {
        formattedPickups[el]['items'] = formattedPickupLineItems[el];
    }

    // ATG:: NOW LOOP THROUGH THE PICKUP OBJECT OF PICKUP OBJECTS AND PUSH ALL THE INNER OBJECTS INTO AN ARRAY TO BE MORE ACCESSIBLE TO THE USER
    pickupArray = [];
    pickupArrayKeys = Object.keys(formattedPickups)

    for (let i = 0; i < pickupArrayKeys.length; i++) {
        pickupArray.push(formattedPickups[pickupArrayKeys[i]]);
    }    

    // ATG:: ADD THE PICKUPS TO THE FORMATTED CUSTOMER OBJECT
    formattedCustomer['pickups'] = pickupArray;

    // loop through each of the pickups with an pickup_actual_date != null and get their rental_id
    let rentalIDs = {};
    for (let i = 0; i < formattedCustomer.pickups.length; i++) {
        if(formattedCustomer.pickups[i].pickup_actual_date !== null) {
            rentalIDs[formattedCustomer.pickups[i].associated_rental_id] = [];
        }
        // loop through each of the pickup line items to get their item_id
        for(let el in formattedCustomer.pickups[i].items) {
            rentalIDs[formattedCustomer.pickups[i].associated_rental_id].push(formattedCustomer.pickups[i].items[el].item_id);
        }
    }
    // now loop through each of the rental line items array and set item_status of 'returned'
    for (let i = 0; i < formattedCustomers.rentals.length; i++) {
        if(rentalIDs[formattedCustomers.rentals[i].rental_id]) {
            formattedCustomers.rentals[i].items[]
        }
    }

    return formattedCustomer;
}
