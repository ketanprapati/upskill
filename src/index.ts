import express  from 'express'
import ConnectDB from './db/ConnectDB'
import { MongoClient } from 'mongodb';
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');
require('dotenv/config'); 
// var passport     = require('passport');

const app = express()
const PORT = process.env.PORT; 
const MONGODB_URI:string = process.env.MONGODB_URI || ''; 
const DBName = 'nodejs'
const CollectionName = 'registerUser'

app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));

// Set view engine to EJS
app.set('view engine', 'ejs');

// Serve static assets from the "public" directory
app.use(express.static("public"));
const client = new MongoClient(MONGODB_URI)

//session middleware
app.use(session({
  secret: "thisismysecrctekey",
  saveUninitialized:true,
  cookie: { maxAge: 1000 * 60 * 60 * 2 }, // 2 hours
  resave: false
}));

app.use(cookieParser());

app.get('/', async(req:any, res:any) => {
  res.render('index')
});
// Authenticate in Database to user exists or not
async function authenticate(email:any, password:any, fn:any) {
  const collection = await ConnectDB(client, DBName, CollectionName )
  console.log('Collection find..')
  const data = await collection.findOne({ email: email, password: password })
  console.log('data', data)
  if (data) {
    fn(null,data)
    return { data: 'ok', error: '' }
  }
  if (!data) {
    fn('error', null)
    return { data: '', error: 'login error' }
  }
  fn(null,null)
}

app.post('/login', async (req:any, res:any, next:any) => {
  const {email, password} = req.body || {}
  await authenticate(email, password, function (err:any, user:any) {
    console.log({ user })
    if (err) return next(err)
    if (user) {
      req.session.user = {
        email: user?.email,
        password: user?.password 
      };
      res.redirect('/welcome');
    } else {
      req.session.error = 'Authentication failed, please check your '
        + ' username and password.';
      res.redirect('/failLogin');
    }
  });
  await client.close()
})

app.post('/signup', async (req:any, res:any) => {
  const { firstName, lastName, email, password, confirmpassword } = req.body || {}
  try {
    if (email !== '' && password !== '' && confirmpassword === password) {
      const collection = await ConnectDB(client, DBName, CollectionName )
      const data = await collection.findOne({ email: email, password: password })

      if (data !== null) {
        console.log('User already register')
      } else {
        await collection.insertOne({ firstName: firstName, lastName: lastName, email: email, password: password, time: new Date().getTime() })
        console.log('Registration successfully completed')
        res.render("home")
      }
    } else {
      console.log("require fields value is empty..")
    }
  } catch (error) {
    console.error('Failed to fetch data from DB:', error)
    throw error
  }
  await client.close()
})

app.get("/login", (req:any, res:any) => {
  res.render("login")
})
app.get("/welcome", (req:any, res:any) => {
  res.render("welcome")
})
app.get("/signup", (req:any, res:any) => {
  res.render("signup")
})

app.get("/home", (req:any, res:any) => {
  res.render("home")
})

// Start server
app.listen(PORT, function () {
  console.log(`Server running on port ${PORT} -> http://localhost:${PORT}`);
})

