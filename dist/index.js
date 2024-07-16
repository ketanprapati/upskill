"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ConnectDB_1 = __importDefault(require("./db/ConnectDB"));
const mongodb_1 = require("mongodb");
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
require('dotenv/config');
// var passport     = require('passport');
const app = (0, express_1.default)();
const PORT = process.env.PORT;
const MONGODB_URI = process.env.MONGODB_URI || '';
const DBName = 'nodejs';
const CollectionName = 'registerUser';
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));
// Set view engine to EJS
app.set('view engine', 'ejs');
// Serve static assets from the "public" directory
app.use(express_1.default.static("public"));
const client = new mongodb_1.MongoClient(MONGODB_URI);
//session middleware
app.use(session({
    secret: "thisismysecrctekey",
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 2 }, // 2 hours
    resave: false
}));
app.use(cookieParser());
app.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.render('index');
}));
// Authenticate in Database to user exists or not
function authenticate(email, password, fn) {
    return __awaiter(this, void 0, void 0, function* () {
        const collection = yield (0, ConnectDB_1.default)(client, DBName, CollectionName);
        console.log('Collection find..');
        const data = yield collection.findOne({ email: email, password: password });
        console.log('data', data);
        if (data) {
            fn(null, data);
            return { data: 'ok', error: '' };
        }
        if (!data) {
            fn('error', null);
            return { data: '', error: 'login error' };
        }
        fn(null, null);
    });
}
app.post('/login', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body || {};
    yield authenticate(email, password, function (err, user) {
        console.log({ user });
        if (err)
            return next(err);
        if (user) {
            req.session.user = {
                email: user === null || user === void 0 ? void 0 : user.email,
                password: user === null || user === void 0 ? void 0 : user.password
            };
            res.redirect('/welcome');
        }
        else {
            req.session.error = 'Authentication failed, please check your '
                + ' username and password.';
            res.redirect('/failLogin');
        }
    });
    yield client.close();
}));
app.post('/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { firstName, lastName, email, password, confirmpassword } = req.body || {};
    try {
        if (email !== '' && password !== '' && confirmpassword === password) {
            const collection = yield (0, ConnectDB_1.default)(client, DBName, CollectionName);
            const data = yield collection.findOne({ email: email, password: password });
            if (data !== null) {
                console.log('User already register');
            }
            else {
                yield collection.insertOne({ firstName: firstName, lastName: lastName, email: email, password: password, time: new Date().getTime() });
                console.log('Registration successfully completed');
                res.render("home");
            }
        }
        else {
            console.log("require fields value is empty..");
        }
    }
    catch (error) {
        console.error('Failed to fetch data from DB:', error);
        throw error;
    }
    yield client.close();
}));
app.get("/login", (req, res) => {
    res.render("login");
});
app.get("/welcome", (req, res) => {
    res.render("welcome");
});
app.get("/signup", (req, res) => {
    res.render("signup");
});
app.get("/home", (req, res) => {
    res.render("home");
});
// Start server
app.listen(PORT, function () {
    console.log(`Server running on port ${PORT} -> http://localhost:${PORT}`);
});
