const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);

const MONGODB_URI = 'mongodb+srv://testuser:testuser@cluster0-7spbm.mongodb.net/shop?retryWrites=true';

const adminRoutes = require('./routes/admin');
const shopRouter = require('./routes/shop');
const authRoutes = require('./routes/auth');
const shopController = require('./controllers/shop');
const isAuth = require('./middleware/is-auth');
const errorController = require('./controllers/error');
const User = require('./models/user');
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');

const app = express();

const store = new MongoDBStore(
  {
    uri: MONGODB_URI,
    collection: 'sessions'
  }
);

const csrfProtection = csrf();

const fileStorage = multer.diskStorage({
destination: (req, file, cb) => {
  cb(null, 'images');
},
filename: (req, file, cb) => {
  cb(null, new Date().getTime() + '-' + file.originalname);
}
});

const fileFilter = (req, file, cb) => {
  if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg'){
    cb(null, true);
  } else {
    cb(null, false);
  }
}

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded());
app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('image'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images' , express.static(path.join(__dirname, 'images')));
app.use(
  session({secret: 'some string', saveUninitialized: false, resave: false, store: store})
);

app.use(flash());

app.use((req, res, next ) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  next();
});

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      if(!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch(err => {
      next(new Error(err));
    });
});

app.post('/create-order', isAuth , shopController.postOrder);

app.use(csrfProtection);

app.use((req, res, next ) => {
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use('/admin',adminRoutes);
app.use(shopRouter);
app.use(authRoutes);

app.get('/500', errorController.get500);

app.use(errorController.get404);

app.use((error, req, res, next) => {
  res.status(500).render('500', {
    pageTitle: 'Error!',
    path: '/500',
    isAuthenticated: req.session.isLoggedIn
  });
});

mongoose.connect(MONGODB_URI)
.then(result => {
    app.listen(3000);
})
.catch(err => 
    console.log(err)
);