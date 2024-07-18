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
Object.defineProperty(exports, "__esModule", { value: true });
function ConnectDB(client_1) {
    return __awaiter(this, arguments, void 0, function* (client, dbName = '', collectionName = '') {
        try {
            yield client.connect();
            console.log('DB Connected successfully');
            const db = client.db(dbName);
            const collection = db.collection(collectionName);
            console.log('collection find ');
            return collection;
        }
        catch (e) {
            console.log('DB connection error', e);
            throw e;
        }
    });
}
exports.default = ConnectDB;
