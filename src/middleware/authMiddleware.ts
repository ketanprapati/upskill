import { MongoClient } from 'mongodb';
import { findUser } from '../models/User';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs'

dotenv.config();

const MONGODB_URI: string = process.env.MONGODB_URI || ''
const client = new MongoClient(MONGODB_URI)

async function authenticate(req: any, res: any, next: any) {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(401).send('Authentication failed. Please provide email and password.');
    }
    const user = await findUser(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('user', user)
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    req.session.user = user; // Store user object in session
    await client.close()
    next();
  } catch (e) {
    console.error('Error logging in user:', e);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export default authenticate;