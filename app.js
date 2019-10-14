const express = require('express');
const app = express();
const router = express.Router();
const middleware=require('./controller/middleware');
const mySqlController = require('./controller/mySqlController');
const envConfig=require('./config/envConfig.json');
const PORT=envConfig[process.env.NODE_ENV || 'development'].node_port;
router.route('/search').get(middleware.validateJwt,mySqlController.searchUsers);
router.route('/add').post(middleware.validateJwt,mySqlController.addUser);
router.route('/delete').post(middleware.validateJwt,mySqlController.deleteUser);
router.route('/login').post(middleware.validateJwt,mySqlController.login);
app.use(function (req, res, next) {
    //Body Parser Middleware
    app.use(express.json());

    //To handle url encoded data (for forms)
    app.use(express.urlencoded({ extended: true }));

    app.use("/", router);
    next();
});

//host app
app.listen(PORT, () => console.log(`Server is running on Port ${PORT}`));