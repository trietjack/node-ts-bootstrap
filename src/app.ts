import express from 'express';
import helmet from 'helmet';
import mongoose from 'mongoose';
import session from 'express-session';
import connectmongo from 'connect-mongo';
import cors from 'cors';
import cookieParser from 'cookie-parser';

require('dotenv').config();

// initilize env variables
const port = Number(process.env.PORT) || 4002;
const dbUri = process.env.DB_URI || '';
const env = process.env.NODE_ENV || 'development';
const secret = process.env.SESSION_SECRET || '';

// initialize mongostore for session storage
const MongoStore = connectmongo(session);

// initialize express app
const app = express();

// for reverse proxy in production env
if (env === 'production') {
  app.set('trust proxy', 1);
}

// set up global middlewares
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
    secret,
    cookie: {
      maxAge: 1000 * 60 * 60,
      httpOnly: true,
      secure: env === 'production',
    },
    resave: false, // forces the session to be saved back to the store
    saveUninitialized: false, // dont save unmodified
  }),
);

// run app and database
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Listening: http://localhost:${port}`);

  mongoose.connect(dbUri, () => {
    // eslint-disable-next-line no-console
    console.log('Database connected.');
  });
});
