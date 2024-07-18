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
const authMiddleware_1 = __importDefault(require("./middleware/authMiddleware"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_session_1 = __importDefault(require("express-session"));
const body_parser_1 = __importDefault(require("body-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const crypto_1 = __importDefault(require("crypto"));
const User_1 = require("./models/User");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT;
// const MONGODB_URI:string = process.env.MONGODB_URI || ''; 
// const DB_NAME: string = process.env.DB_NAME || ''
// const USER_COLLECTION: string = process.env.USER_COLLECTION || ''
app.use(body_parser_1.default.json()); // get information from html forms
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
// Generate a secure random secret key
const generateSecretKey = () => {
    return crypto_1.default.randomBytes(32).toString('base64'); // 32 bytes = 256 bits
};
app.use((0, express_session_1.default)({
    secret: generateSecretKey(), // Change this to a secure random string
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set secure: true if using HTTPS
}));
// Set view engine to EJS
app.set('view engine', 'ejs');
// Serve static assets from the "public" directory
app.use(express_1.default.static("public"));
// const client = new MongoClient(MONGODB_URI)
app.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.render('index');
}));
app.post('/login', authMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.session.user) {
        return res.status(401).send('Unauthorized. Please login.');
    }
    res.redirect("welcome");
}));
// New Registartion data save in DB.
app.post('/registration', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { firstName, lastName, email, password, confirmpassword } = req.body || {};
    try {
        if (email !== '' && password !== '' && confirmpassword === password) {
            const existingUser = yield (0, User_1.findUser)(email);
            if (existingUser) {
                return res.status(400).json({ message: 'Username already exists' });
            }
            const result = yield (0, User_1.createUser)(firstName, lastName, email, password);
            console.log('Registration successfully completed', result);
            res.redirect("home");
        }
        else {
            console.log("require fields value is empty..");
            return res.status(401).json({ message: 'Please fill the empty fields' });
        }
    }
    catch (error) {
        console.error('Failed to fetch data from DB:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));
// Login route
app.get("/login", (req, res) => {
    res.render("login");
});
// Login registration route
app.get("/registration", (req, res) => {
    res.render("registration");
});
app.get("/welcome", (req, res) => {
    if (!req.session.user) {
        return res.status(401).send('Unauthorized. Please login.');
    }
    res.render("welcome");
});
// Home page route
app.get("/home", (req, res) => {
    res.render("home");
});
// Logout route
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Error logging out');
        }
        res.redirect('/');
    });
});
// Start server
app.listen(PORT, function () {
    console.log(`Server running on port ${PORT} -> http://localhost:${PORT}`);
});
