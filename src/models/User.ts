import ConnectDB from '../db/ConnectDB'
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs'
dotenv.config();

const MONGODB_URI:string = process.env.MONGODB_URI || ''; 
const DB_NAME: string = process.env.DB_NAME || ''
const USER_COLLECTION: string = process.env.USER_COLLECTION || ''
const client = new MongoClient(MONGODB_URI)
// Create new user 
async function createUser(firstName: string, lastName: string, email: string, password: string) {
  try {
    const collection = await ConnectDB(client, DB_NAME, USER_COLLECTION)
    const hashedPassword = await bcrypt.hash(password, 10); // Hash password
    const user = {
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: hashedPassword,
      time: new Date().getTime()
    }
    const result = await collection.insertOne(user)
    return result;
  } catch (e) {
    console.log('User creating Error', e)
    throw e
  }
}

// If user exists or not in DB
async function findUser(email: string) {
  try {
    const collection = await ConnectDB(client, DB_NAME, USER_COLLECTION )
    const user = await collection.findOne({ email: email });
    return user;
  } catch (e) {
    console.log('User finding Error', e)
    throw e
  }
}
export {findUser, createUser}