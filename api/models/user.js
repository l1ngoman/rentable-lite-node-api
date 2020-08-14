const { Sequelize }         = require('sequelize'); // https://sequelize.org/master/manual/getting-started.html
const { sequelizeConfig }   = require('../../config');
const sequelize             = new Sequelize(sequelizeConfig);

// ATG:: MAKE SURE THE CONNECTION IS WORKING
try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
} catch (error) {
    console.error('Unable to connect to the database:', error);
}

const UserModel = (sequelize, Sequelize) => {
    const { INTEGER, STRING, FLOAT, BOOLEAN, DATE } = Sequelize
    const User = sequelize.define('User', {
        user_id:    {type: INTEGER, primaryKey: true, autoIncrement: true, allowNull: false},
        first_name: {type: STRING, allowNull: false},
        last_name:  {type: STRING, allowNull: false},
        email:      {type: STRING, allowNull: false}
    });
    return User;
}

module.exports = UserModel;