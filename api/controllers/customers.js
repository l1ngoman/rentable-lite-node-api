const { mysqlConfig } = require('../../config');
const moment = require('moment'); // https://momentjs.com/
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

    // ATG:: GET CUSTOMER INFO AND ACTIVE RENTAL ITEMS TO SHOW
    const sql = `   SELECT c.*, r.rental_id, r.rental_number, GROUP_CONCAT(i.item_id SEPARATOR'???') as rental_item_ids, GROUP_CONCAT(i.item_name SEPARATOR'???') as rental_item_names
                    FROM customers c
                        LEFT JOIN rentals r
                            ON r.customer_id = c.customer_id
                        LEFT JOIN rental_line_items rli
                            ON rli.rental_id = r.rental_id
                        LEFT JOIN items i
                            ON rli.item_id = i.item_id
                    WHERE c.customer_id=${customer_id}
                        AND (r.rental_status='OPEN' OR r.rental_status IS NULL)
                        AND (rli.active_rental=1 OR rli.active_rental IS NULL)
                    GROUP BY r.rental_id`;

    connection.query(sql, (error, result) => {
        if(error) {
            throw error;
        }

        // ATG:: CALL PRIVATE FUNCTION TO FORMAT THE QUERIED CUSTOMER DATA
        let formattedCustomer = _formatCustomer(result);
        res.status(200).json({
            message: `Customer with ID: ${customer_id} successfully retrieved.`,
            responseObject: formattedCustomer
        });  
    });
};

exports.getCustomerRentals = (req, res) => {
    const customer_id = parseInt(req.params.id);
    const sql = `   SELECT rental_id, rental_number, delivery_date, rental_status
                    FROM rentals
                    WHERE customer_id=${customer_id}`;

    connection.query(sql, (error, result) => {
        if(error) {
            throw error;
        }

        res.status(200).json({
            message: `Rentals for customer with ID: ${customer_id} successfully retrieved.`,
            responseObject: result
        });  
    });
};

exports.getCustomerPickups = (req, res) => {
    const customer_id = parseInt(req.params.id);
    const sql = `   SELECT p.pickup_id, p.pickup_number, p.pickup_actual_date, p.pickup_status, 
                        r.rental_id, r.rental_number
                    FROM pickups p
                        LEFT JOIN rentals r
                            ON p.rental_id = r.rental_id
                    WHERE customer_id=${customer_id}`;

    connection.query(sql, (error, result) => {
        if(error) {
            throw error;
        }

        res.status(200).json({
            message: `Pickups for customer with ID: ${customer_id} successfully retrieved.`,
            responseObject: result
        });  
    });
};

exports.createNewCustomer = (req, res) => {
    let { first_name, last_name, address_1, address_2, city, state, zip, phone, email } = req.body;
    // ATG:: USE JS ESCAPE LIBRARY TO ESCAPE SPECIAL CHARS BEFORE INSERTING THEM INTO THE DB
    first_name = jsesc(first_name);
    last_name  = jsesc(last_name);
    address_1  = jsesc(address_1);
    address_2  = jsesc(address_2);
    city       = jsesc(city);
    email      = jsesc(email);
    const sql = (`  
            INSERT INTO customers (first_name, last_name, address_1, address_2, city, state, zip, phone, email, insert_timestamp) 
            VALUES('${first_name}', '${last_name}', '${address_1}', '${address_2}', '${city}', '${state}', '${zip}', '${phone}', '${email}', '${moment().format('YYYY-MM-DD')}')
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
    let { first_name, last_name, address_1, address_2, city, state, zip, phone, email } = req.body;
    // ATG:: USE JS ESCAPE LIBRARY TO ESCAPE SPECIAL CHARS BEFORE INSERTING THEM INTO THE DB
    first_name = jsesc(first_name);
    last_name  = jsesc(last_name);
    address_1  = jsesc(address_1);
    address_2  = jsesc(address_2);
    city       = jsesc(city);
    email      = jsesc(email);
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
            email       = '${email}'
        WHERE customer_id = '${customer_id}'`);
    
    connection.query(sql, (error, result) => {
        if (error) {
            throw error
        }
        res.status(200).json({
            message: `Customer with ID: ${customer_id} updated successfully.`,
            responseObject: {
                customer_id,
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

// ATG:: FUNCTION TO FORMAT A SINGLE CUSTOMER'S RETURNED QUERY
const _formatCustomer = function(queryResult) {
    let formattedResult, itemIDArray;
    let formattedRentalItems = [];

    if(queryResult.length > 0) {
        // ATG:: CREATE THE FORMATTED RESULT OBJECT
        formattedResult = {
            customer_id:    queryResult[0].customer_id,
            first_name:     queryResult[0].first_name,
            last_name:      queryResult[0].last_name,
            address_1:      queryResult[0].address_1,
            address_2:      queryResult[0].address_2,
            city:           queryResult[0].city,
            state:          queryResult[0].state,
            zip:            queryResult[0].zip,
            phone:          queryResult[0].phone,
            email:          queryResult[0].email,
            hasRecords:     false,
            active_items:   {}
        };

        // ATG:: NOW LOOP THROUGH THE RESULTS TO FORMAT THE CUSTOMER'S ACTIVE RENTAL INFO
        for (let i = 0; i < queryResult.length; i++) {
            // ATG:: ADDED CHECK TO SEE IF ANY RENTAL IDs ARE PRESENT
            // NOTE:: THIS IS TO DISALLOW CUSTOMER DELETION IF IT'S TIED TO OTHER SYSTEM RECORDS
            if(formattedResult['hasRecords'] === false && queryResult[i].rental_id > 0) {
                formattedResult['hasRecords'] = true;
            }
            // ATG:: GET THE RENTAL ITEM IDs AND NAMES BY SPLITTING THE STRING ON '???' TO CREATE PARALLEL ARRAYS
            itemIDArray     = (queryResult[i].rental_item_ids != null) ? queryResult[i].rental_item_ids.split('???') : [];
            itemNameArray   = (queryResult[i].rental_item_names != null) ? queryResult[i].rental_item_names.split('???') : [];

            if(itemIDArray.length > 0) {
                // ATG:: LOOP THROUGH THE ID ARRAY TO FORMAT EACH LINE ITEM OBJECT AND PUSH IT INTO THE RENTAL ARRAY
                for (let j = 0; j < itemIDArray.length; j++) {
                    formattedRentalItems.push({
                        rental_id:          queryResult[i].rental_id,
                        rental_number:      queryResult[i].rental_number,
                        delivery_date:      queryResult[i].delivery_date,    
                        item_id:            itemIDArray[j],
                        item_name:          itemNameArray[j]
                    });
                };
            }
        };

        // ATG:: ADD THE RENTAL ARRAY INTO THE FORMATTED RESULT TO RETURN
        formattedResult['active_items'] = formattedRentalItems;

        return formattedResult;

    } else {
        // ATG:: IF THE RESULT IS EMPTY, JUST RETURN IN
        return queryResult;
    }
}

// ATG:: OLD HELPER FUNCTIONS TO FORMAT OLD QUERIES - DELETE
// // ATG:: INTERNAL FUNCTION FOR FORMATTING THE RENTAL JSON WITH LINE ITEMS
// const _formatRentalJSON = function(queryResult) {
//     let formattedCustomer;
//     let formattedRentals = {};
//     let formattedRentalLineItems = {};
//     if(queryResult.length > 0) {
//         for(let el in queryResult) {
//             // ATG:: EXTRACT THE RENTAL ID FROM THE QUERY RESULT
//             let rental_id = queryResult[el].rental_id;

//             if(formattedCustomer === undefined) {
//                 formattedCustomer = {
//                     customer_id:    queryResult[el].customer_id,
//                     first_name:     queryResult[el].first_name,
//                     last_name:      queryResult[el].last_name,
//                     address_1:      queryResult[el].address_1,
//                     address_2:      queryResult[el].address_2,
//                     city:           queryResult[el].city,
//                     state:          queryResult[el].state,
//                     zip:            queryResult[el].zip,
//                     phone:          queryResult[el].phone,
//                     email:          queryResult[el].email,
//                     rentals:        null,
//                     pickups:        null
//                 };
//             }

//             // ATG:: IF THE FORMATTED RENTAL OBJECT AT THE RENTAL ID IS UNDEFINED, CREATE THE OBJECT WITH THE PROPERTIES OF THE QUERY RESULTS FROM THIS ITERATION
//             if(formattedRentals[rental_id] === undefined) {
//                 formattedRentals[rental_id] = {
//                     rental_id:              queryResult[el].rental_id,
//                     rental_number:          queryResult[el].rental_number,
//                     rental_date:            queryResult[el].rental_date,
//                     delivery_date:          queryResult[el].delivery_date,
//                     rental_status:          queryResult[el].rental_status,
//                     delivery_fee:           queryResult[el].delivery_fee,
//                     items:                  null
//                 };
//             }

//             // ATG:: IF THE FORMATTED RENTAL LINE ITEMS OBJECT AT THE RENTAL ID IS UNDEFINED AND THE QUERY RESULT FROM THIS ITERATION IS NOT NULL, CREATE ITS FIRST OBJECT WITH THE QUERY RESULTS FROM THIS ITERATION
//             if( (formattedRentalLineItems[rental_id] === undefined) && (queryResult[el].rental_item_id !== null) ) {
//                 formattedRentalLineItems[rental_id] = [{
//                     rental_item_id:     queryResult[el].rental_item_id,
//                     rental_item_status: queryResult[el].rental_item_status,
//                     unit_cost:          queryResult[el].unit_cost,
//                     unit_tax_amount:    queryResult[el].unit_tax_amount,
//                     item_id:            queryResult[el].item_id,
//                     item_name:          queryResult[el].item_name,
//                     item_description:   queryResult[el].item_description,
//                     tracking_number:    queryResult[el].tracking_number,
//                     serial_number:      queryResult[el].serial_number,
//                 }];
//             // ATG:: ELSE, STILL CHECKING IF THE QUERY RESULT FROM THIS ITERATION IS NOT NULL, PUSH IN ANOTHER OBJECT USING THE QUERY RESULTS FROM THIS INTERATION
//             } else if(queryResult[el].rental_item_id !== null) {
//                 formattedRentalLineItems[rental_id].push({
//                     rental_item_id:     queryResult[el].rental_item_id,
//                     rental_item_status: queryResult[el].rental_item_status,
//                     unit_cost:          queryResult[el].unit_cost,
//                     unit_tax_amount:    queryResult[el].unit_tax_amount,
//                     item_id:            queryResult[el].item_id,
//                     item_name:          queryResult[el].item_name,
//                     item_description:   queryResult[el].item_description,
//                     tracking_number:    queryResult[el].tracking_number,
//                     serial_number:      queryResult[el].serial_number,
//                     item_status:        'ACTIVE'
//                 });
//             }
//         } // END OF FOR LOOP
//     } // END OF LENGTH > 0

//     // ATG:: NOW LOOP THROUGH THE LINE ITEMS TO PUSH THEM INTO THE CORRESPONDING ITEMS ARRAY FOR THEIR RENTAL ID
//     for(let el in formattedRentalLineItems) {
//         formattedRentals[el]['items'] = formattedRentalLineItems[el];
//     }

//     // ATG:: NOW LOOP THROUGH THE RENTAL OBJECT OF RENTAL OBJECTS AND PUSH ALL THE INNER OBJECTS INTO AN ARRAY TO BE MORE ACCESSIBLE TO THE USER
//     rentalArray = [];
//     rentalArrayKeys = Object.keys(formattedRentals)

//     for (let i = 0; i < rentalArrayKeys.length; i++) {
//         rentalArray.push(formattedRentals[rentalArrayKeys[i]]);
//     }

//     // ATG:: ADD THE RENTALS TO THE FORMATTED CUSTOMER OBJECT
//     formattedCustomer['rentals'] = rentalArray;

//     return formattedCustomer;
// }

// // ATG:: INTERNAL FUNCTION FOR FORMATTING THE PICKUP JSON WITH LINE ITEMS
// const _formatPickupJSON = function(formattedCustomer, queryResult) {
//     let formattedPickups = {};
//     let formattedPickupLineItems = {};
//     if(queryResult.length > 0) {
//         for(let el in queryResult) {
//             // ATG:: EXTRACT THE RENTAL ID FROM THE QUERY RESULT
//             let pickup_id = queryResult[el].pickup_id;

//             // ATG:: IF THE FORMATTED RENTAL OBJECT AT THE RENTAL ID IS UNDEFINED, CREATE THE OBJECT WITH THE PROPERTIES OF THE QUERY RESULTS FROM THIS ITERATION
//             if(formattedPickups[pickup_id] === undefined) {
//                 formattedPickups[pickup_id] = {
//                     pickup_id:                  queryResult[el].pickup_id,
//                     pickup_number:              queryResult[el].pickup_number,
//                     pickup_date:                queryResult[el].pickup_date,
//                     pickup_actual_date:         queryResult[el].pickup_actual_date,
//                     pickup_status:              queryResult[el].pickup_status,
//                     associated_rental_id:       queryResult[el].rental_id,
//                     associated_rental_number:   queryResult[el].rental_number,
//                     items:                      null
//                 };
//             }

//             // ATG:: IF THE FORMATTED RENTAL LINE ITEMS OBJECT AT THE RENTAL ID IS UNDEFINED AND THE QUERY RESULT FROM THIS ITERATION IS NOT NULL, CREATE ITS FIRST OBJECT WITH THE QUERY RESULTS FROM THIS ITERATION
//             if( (formattedPickupLineItems[pickup_id] === undefined) && (queryResult[el].pickup_item_id !== null) ) {
//                 formattedPickupLineItems[pickup_id] = [{
//                     pickup_item_id:             queryResult[el].pickup_item_id,
//                     associated_rental_item_id:  queryResult[el].rental_item_id,
//                     item_id:                    queryResult[el].item_id,
//                     item_name:                  queryResult[el].item_name,
//                     item_description:           queryResult[el].item_description,
//                     tracking_number:            queryResult[el].tracking_number,
//                     serial_number:                  queryResult[el].serial_number,    
//                 }];
//             // ATG:: ELSE, STILL CHECKING IF THE QUERY RESULT FROM THIS ITERATION IS NOT NULL, PUSH IN ANOTHER OBJECT USING THE QUERY RESULTS FROM THIS INTERATION
//             } else if(queryResult[el].pickup_item_id !== null) {
//                 formattedPickupLineItems[pickup_id].push({
//                     pickup_item_id:     queryResult[el].pickup_item_id,
//                     item_id:            queryResult[el].item_id,
//                     item_name:          queryResult[el].item_name,
//                     item_description:   queryResult[el].item_description,
//                     tracking_number:    queryResult[el].tracking_number,
//                     serial_number:      queryResult[el].serial_number,
//                 });
//             }
//         } // END OF FOR LOOP
//     } // END OF LENGTH > 0

//     // ATG:: NOW LOOP THROUGH THE LINE ITEMS TO PUSH THEM INTO THE CORRESPONDING ITEMS ARRAY FOR THEIR RENTAL ID
//     for(let el in formattedPickupLineItems) {
//         formattedPickups[el]['items'] = formattedPickupLineItems[el];
//     }

//     // ATG:: NOW LOOP THROUGH THE PICKUP OBJECT OF PICKUP OBJECTS AND PUSH ALL THE INNER OBJECTS INTO AN ARRAY TO BE MORE ACCESSIBLE TO THE USER
//     pickupArray = [];
//     pickupArrayKeys = Object.keys(formattedPickups)

//     for (let i = 0; i < pickupArrayKeys.length; i++) {
//         pickupArray.push(formattedPickups[pickupArrayKeys[i]]);
//     }    

//     // ATG:: ADD THE PICKUPS TO THE FORMATTED CUSTOMER OBJECT
//     formattedCustomer['pickups'] = pickupArray;

//     return formattedCustomer;
// }


// ATG:: OLD CUSTOMER QUERIES - CAN DELETE
// // ATG:: BASIC
// const sql = `   SELECT * FROM customers WHERE customer_id=${customer_id}`;
// // ATG:: GROUP_CONCAT RENTALS
// const sql = `   SELECT c.*, GROUP_CONCAT(r.rental_id) as rental_ids, GROUP_CONCAT(rli.rental_item_id) as rental_item_ids
//                 FROM rental_line_items rli
//                     JOIN rentals r
//                         ON rli.rental_id = r.rental_id
//                     JOIN customers c
//                         ON r.customer_id = c.customer_id
//                 WHERE c.customer_id=${customer_id}`;
// exports.getCustomer = (req, res) => {
//     const customer_id = parseInt(req.params.id);

//     // ATG:: NOW QUERY FOR ALL RELATED RENTALS FOR THIS CUSTOMER
//     const sql1 = `  SELECT c.customer_id, c.first_name, c.last_name, c.address_1, c.address_2, c.city, c.state, c.zip, c.phone, c.email,
//                         r.rental_id, r.rental_number, r.rental_date, r.delivery_date, r.rental_status, r.delivery_fee,
//                         rli.rental_item_id, rli.unit_cost, rli.unit_tax_amount, IF(pli.pickup_item_id IS NULL || p.pickup_actual_date IS NULL, 'ACTIVE', 'RETURNED') as rental_item_status,
//                         i.item_id, i.item_name, i.item_description, i.tracking_number, i.serial_number
//                     FROM rentals r
//                     LEFT JOIN customers c
//                         ON r.customer_id = c.customer_id
//                     LEFT JOIN rental_line_items rli
//                         ON r.rental_id = rli.rental_id
//                     LEFT JOIN items i
//                         ON rli.item_id = i.item_id
//                     LEFT JOIN pickup_line_items pli
//                         ON rli.rental_item_id = pli.rental_item_id
//                     LEFT JOIN pickups p
//                         ON r.rental_id = p.pickup_id
//                     WHERE r.customer_id = ${customer_id}`;
//     connection.query(sql1, (error1, result1) => {
//         if(error1) {
//             throw error1;
//         }
//         // ATG:: NOW QUERY FOR ALL RELATED PICKUPS FOR THIS CUSTOMER
//         const sql2 = `  SELECT p.pickup_id, p.pickup_number, p.pickup_date, p.pickup_actual_date, p.pickup_status,
//                             r.rental_id, r.rental_number,
//                             pli.pickup_item_id,
//                             i.item_id, i.item_name, i.item_description, i.tracking_number, i.serial_number
//                         FROM pickups p
//                         LEFT JOIN rentals r
//                             ON p.rental_id = r.rental_id
//                         LEFT JOIN pickup_line_items pli
//                             ON p.pickup_id = pli.pickup_id
//                         LEFT JOIN rental_line_items rli
//                             ON pli.rental_item_id = rli.rental_item_id
//                         LEFT JOIN items i
//                             ON rli.item_id = i.item_id
//                         WHERE r.customer_id = ${customer_id}`;
//         connection.query(sql2, (error2, result2) => {
//             if(error2) {
//                 throw error2;
//             }

//             // ATG:: CALL PRIVATE FUNCTION TO FORMAT THE RENTAL PORTION OF THE CUSTOMER OBJECT
//             // TAKES THE FIRST QUERY RESULT
//             // RETURNS A CUSTOMER OBJECT WITH FORMATTED RENTAL HISTORY
//             formattedCustomer = _formatRentalJSON(result1);
//             // ATG:: NOW CALL ANOTHER PRIVATE FUNCTION TO FORMAT THE PICKUP PORTION OF THE CUSTOM OBJECT
//             // TAKES THE NEW CUSTOMER OBJECT AND THE SECOND QUERY RESULT
//             // RETURNS THE FINAL CUSTOMER OBJECT WITH FORMATTED RENTAL & PICKUP HISTORY
//             formattedCustomer = _formatPickupJSON(formattedCustomer, result2);

//             res.status(200).json({
//                 message: `Customer with ID: ${customer_id} successfully retrieved.`,
//                 responseObject: formattedCustomer
//             });  
//         });
//     }); 
// };