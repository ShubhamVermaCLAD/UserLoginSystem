const jsonWebToken = require('./jwtValidator');
const validator = require("./validator")
const mySql = require('../models/mysql');
const errConfig = require('../config/errorConfig.json');

module.exports = {
    /**
     * function to search all user 
     * return json 
     */
    searchUsers: async (req,res) => {
        const tableName='login';
        result = await mySql.searchAll(tableName);
        const { err } = result;
        console.log(err)
        //for database server related error
        if (err) return res.status(errConfig.database.connection.status).json({"err":errConfig.database.connection.err});
        return res.json(result);
    },
    /**
     * function to add user 
     * return json  
     */
    addUser: async (req,res) => {
        let err;
        const tableName='login';
        //check prams (userName , password,email)
        if (!(err = validator.validateUserName(req.body.userName)) && !(err = validator.validatePassword(req.body.password)) && !(err = validator.validateEmail(req.body.email))) {
            const value = `"${req.body.userName}","${req.body.password}","${req.body.email}","${req.body.role}"`
            const result = await mySql.insertUser(tableName, value);
            const { err } = result;
            console.log(err)
            //for database server related error
            if (err) return res.status( errConfig.database.connection.status).json({"err":err});
            return res.json({ "msg": "user is added", "data": result });
        }
        return res.status(errConfig.filed_validation.status).json( {"err": err });
    },
    /**
     * function for login
     * @param {string} tableName tableName
     * @param {object} prams user object
     * return json 
     */
    login: async (req,res) => {
        let err;
        const tableName='login';
        //check prams (userName , password)
        if (!(err = validator.validateUserName(req.body.userName)) && !(err = validator.validatePassword(req.body.password))) {
            const sql = `userName="${req.body.userName}" AND password="${req.body.password}"`;
            const record = await mySql.searchRecord(tableName, sql)
            const { err } = record;
            //for database server related error
            if (err) return res.status(errConfig.database.connection.status).json({"err":err});
            const userData = record[0];
            if (record.length > 0) {
                const payload = { "userName": record[0].userName, "password": record[0].password, "role": record[0].role };
                const token =await jsonWebToken.getToken(payload);
                const refToken=await jsonWebToken.getRefToken(payload);
                return res.json({ "Authorization": token, "refToken": refToken, "userData": userData });
            }
            return res.status(errConfig.authorization.user_not_exist.status).json({"err":errConfig.authorization.user_not_exist.err});
        }
        return res.status(errConfig.filed_validation.status).json({"err": err });
    },
    /**
     * function to delete user
     * @param {string} tableName tableName
     * @param {object} prams user object
     * return json 
     */
    deleteUser: async (req,res) => {
        let err;
        if (!(err = validator.validateUserName( req.body.userName))) {

            const result = await mySql.deleteUser(tableName,  req.body);
            const { err } = result;
            //for database server related error
            if (err) return res.status(errConfig.database.connection.status).json({"err":err});
            if (result.affectedRows > 0) {
                return res.json({ "msg": "user is deleted", "data": result });
            }
            return res.status(errConfig.authorization.user_not_exist.status).json({'err':errConfig.authorization.user_not_exist.err});
        }
        else {
            return res.status( errConfig.filed_validation.status).json({ "err": err });
        }
    },
}