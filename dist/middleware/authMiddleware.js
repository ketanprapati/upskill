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
const mongodb_1 = require("mongodb");
const User_1 = require("../models/User");
const dotenv_1 = __importDefault(require("dotenv"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
dotenv_1.default.config();
const MONGODB_URI = process.env.MONGODB_URI || '';
const client = new mongodb_1.MongoClient(MONGODB_URI);
function authenticate(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { email, password } = req.body;
        try {
            if (!email || !password) {
                return res.status(401).send('Authentication failed. Please provide email and password.');
            }
            const user = yield (0, User_1.findUser)(email);
            if (!user) {
                return res.status(401).json({ message: 'Invalid username or password' });
            }
            const isMatch = yield bcryptjs_1.default.compare(password, user.password);
            console.log('user', user);
            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid username or password' });
            }
            req.session.user = user; // Store user object in session
            yield client.close();
            next();
        }
        catch (e) {
            console.error('Error logging in user:', e);
            res.status(500).json({ message: 'Internal server error' });
        }
    });
}
exports.default = authenticate;
