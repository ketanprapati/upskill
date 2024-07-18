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
exports.findUser = findUser;
exports.createUser = createUser;
const ConnectDB_1 = __importDefault(require("../db/ConnectDB"));
const mongodb_1 = require("mongodb");
const dotenv_1 = __importDefault(require("dotenv"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
dotenv_1.default.config();
const MONGODB_URI = process.env.MONGODB_URI || '';
const DB_NAME = process.env.DB_NAME || '';
const USER_COLLECTION = process.env.USER_COLLECTION || '';
const client = new mongodb_1.MongoClient(MONGODB_URI);
// Create new user 
function createUser(firstName, lastName, email, password) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const collection = yield (0, ConnectDB_1.default)(client, DB_NAME, USER_COLLECTION);
            const hashedPassword = yield bcryptjs_1.default.hash(password, 10); // Hash password
            const user = {
                firstName: firstName,
                lastName: lastName,
                email: email,
                password: hashedPassword,
                time: new Date().getTime()
            };
            const result = yield collection.insertOne(user);
            return result;
        }
        catch (e) {
            console.log('User creating Error', e);
            throw e;
        }
    });
}
// If user exists or not in DB
function findUser(email) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const collection = yield (0, ConnectDB_1.default)(client, DB_NAME, USER_COLLECTION);
            const user = yield collection.findOne({ email: email });
            return user;
        }
        catch (e) {
            console.log('User finding Error', e);
            throw e;
        }
    });
}
