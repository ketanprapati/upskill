import express  from 'express'
import authenticate from './middleware/authMiddleware'
import cookieParser from 'cookie-parser';
import session from 'express-session';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { findUser, createUser } from './models/User';
dotenv.config();

const app = express()
const PORT = process.env.PORT; 

app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Generate a secure random secret key
const generateSecretKey = () => {
  return crypto.randomBytes(32).toString('base64'); // 32 bytes = 256 bits
};

app.use(session({
  secret: generateSecretKey(), // Change this to a secure random string
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set secure: true if using HTTPS
}));
// Set view engine to EJS
app.set('view engine', 'ejs');

// Serve static assets from the "public" directory
app.use(express.static("public"));

app.get('/', async(req:any, res:any) => {
  res.render('index')
});

app.post('/login', authenticate, async (req: any, res: any) => {
  if (!req.session.user) {
    return res.status(401).send('Unauthorized. Please login.');
  }
  res.redirect("welcome")
})
// New Registartion data save in DB.
app.post('/registration', async (req:any, res:any) => {
  const { firstName, lastName, email, password, confirmpassword } = req.body || {}
  try {
    if (email !== '' && password !== '' && confirmpassword === password) {
      const existingUser = await findUser(email);
      if (existingUser) {
        return res.status(400).json({ message: 'Email already exists' });
      }
      const result = await createUser(firstName, lastName, email, password);
      console.log('Registration successfully completed', result)
      res.redirect("home")
    } else {
      console.log("require fields value is empty..")
      return res.status(401).json({ message: 'Please fill the empty fields' });
    }
  } catch (error) {
    console.error('Failed to fetch data from DB:', error)
    res.status(500).json({ message: 'Internal server error' });
  }
})
// Login route
app.get("/login", (req:any, res:any) => {
  res.render("login")
})
// Login registration route
app.get("/registration", (req:any, res:any) => {
  res.render("registration")
})
app.get("/welcome", (req: any, res: any) => {
  if (!req.session.user) {
    return res.status(401).send('Unauthorized. Please login.');
  }
  res.render("welcome")
})
// Home page route
app.get("/home", (req: any, res: any) => {
  res.render("home")
})

// Logout route
app.get('/logout', (req:any, res:any) => {
  req.session.destroy((err: any) => {
    if (err) {
      return res.status(500).send('Error logging out');
    }
    res.redirect('/');
  });
});

// Start server
app.listen(PORT, function () {
  console.log(`Server running on port ${PORT} -> http://localhost:${PORT}`);
})

