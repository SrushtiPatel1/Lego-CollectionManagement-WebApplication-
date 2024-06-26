/********************************************************************************
 * WEB322 – Assignment 06
 * I declare that this assignment is my own work in accordance with Seneca's
 * Academic Integrity Policy:
 * https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
 *
 * Name: Srushti Patel Student ID: 117791228 Date: 13/12/2023
 *
 * Published URL: https://successful-teal-fashion.cyclic.app/lego/sets
 ********************************************************************************/

const express = require('express');
const legoData = require('./modules/legoSets');
const authData = require('./modules/auth-service');
const clientSessions = require('client-sessions');
const path = require('path');

const app = express();
const PORT = 3000;

// Configure EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware for parsing form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configure client-sessions middleware
app.use(
  clientSessions({
    cookieName: 'session',
    secret: 'o6LjQ5EVNC28ZgK64hDELM18ScpFQr',
    duration: 24 * 60 * 1000,
    activeDuration: 1000 * 60,
  })
);

// Custom middleware to provide session data to templates
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

// Ensure login middleware
function ensureLogin(req, res, next) {
  if (!req.session || !req.session.user) {
    res.redirect('/login');
  } else {
    next();
  }
}

// Initialize LEGO data and authentication data, then start the server
async function startServer() {
  try {
    await legoData.initialize();
    await authData.initialize();

    app.listen(PORT, () => {
      console.log(`Server started on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to initialize data:", error);
  }
}

startServer();


// Home route
app.get('/', (req, res) => {
  res.render('home', { page: '/' });
});

// About route
app.get('/about', (req, res) => {
  res.render('about', { page: '/about' });
});

// Route for all LEGO sets with a specific theme
app.get('/lego/sets', handleSetsRoute);

// Route for a specific LEGO set by number
app.get('/lego/sets/:set_num', handleSetDetailsRoute);

// Route to render the form for adding a new set
app.get('/lego/addSet', ensureLogin, handleAddSetFormRoute);

// Route to handle form submission for adding a new set
app.post('/lego/addSet', ensureLogin, handleAddSetSubmissionRoute);

// Route to render the form for editing an existing set
app.get('/lego/editSet/:num', ensureLogin, handleEditSetFormRoute);

// Route to handle form submission for editing an existing set
app.post('/lego/editSet', ensureLogin, handleEditSetSubmissionRoute);

// Route for deleting a LEGO set
app.get('/lego/deleteSet/:num', ensureLogin, handleDeleteSetRoute);

// Route to render the login form
app.get('/login', (req, res) => {
  res.render('login', { errorMessage: null, userName: '' });
});

// Route to render the register form  
app.get('/register', (req, res) => {
  res.render('register', { successMessage: null, errorMessage: null, userName: '' });
});

// Route to handle registration form submission
app.post('/register', async(req, res) => {
   try{ const userData = req.body;
  
    await authData.registerUser(userData);
     res.render('register', { successMessage: 'User created'});
   }catch(err) {
    res.render('register', { successMessage: null, errorMessage: err, userName: req.body.userName });
   }
});

// Route to handle login form submission
app.post('/login', async (req, res) => {
  try{
    req.body.userAgent = req.get('User-Agent');
    const user = await authData.checkUser(req.body);
  
      req.session.user = {
        userName: user.userName,
        email: user.email,
        loginHistory: user.loginHistory,
      };

      res.redirect('/lego/sets');
  }
    catch(err) { res.render('login', { errorMessage: err, userName: req.body.userName });
}
});

// Route to handle logout
app.get('/logout', (req, res) => {
  req.session.user = null;
  res.redirect('/');

});
// Route to render the user history view
app.get('/userHistory', ensureLogin, (req, res) => {
  res.render('userHistory');
});


// Error handling middleware
app.use(handleError);

// Handle 404 errors with a custom 404.ejs template
app.use(handle404);

function handleSetsRoute(req, res) {
  getSetsData(req.query.theme)
    .then((legoSets) => res.render('sets', { sets: legoSets, page: '/lego/sets' }))
    .catch((error) => handleRouteError(res, error));
}

function handleSetDetailsRoute(req, res) {
  getSetDetails(req.params.set_num)
    .then((legoSet) => {
      if (legoSet) {
        res.render('set', { set: legoSet });
      } else {
        handleRouteError(res, 'LEGO set not found', 404);
      }
    })
    .catch((error) => handleRouteError(res, error));
}

async function getSetsData(theme) {
  try {
    return theme ? await legoData.getSetsByTheme(theme) : await legoData.getAllSets();
  } catch (error) {
    throw error;
  }
}

async function getSetDetails(setNum) {
  try {
    const legoSet = await legoData.getSetByNum(setNum);
    return legoSet;
  } catch (error) {
    throw error;
  }
}

function handleAddSetFormRoute(req, res) {
  getThemes()
    .then((themes) => res.render('addSet', { themes }))
    .catch((error) => handleRouteError(res, error));
}

function handleAddSetSubmissionRoute(req, res) {
  const setData = {
    set_num: req.body.set_num,
    name: req.body.name,
    year: parseInt(req.body.year),
    num_parts: parseInt(req.body.num_parts),
    img_url: req.body.img_url,
    theme_id: parseInt(req.body.theme_id),
  };

  addNewSet(setData)
    .then(() => res.redirect('/lego/sets'))
    .catch((error) => handleRouteError(res, error));
}

function handleEditSetFormRoute(req, res) {
  const setNum = req.params.num;

  Promise.all([getSetDetails(setNum), getThemes()])
    .then(([legoSet, themes]) => {
      res.render('editSet', { set: legoSet, themes });
    })
    .catch((error) => handleRouteError(res, error));
}

function handleEditSetSubmissionRoute(req, res) {
  const setNum = req.body.set_num;
  const setData = {
    name: req.body.name,
    year: parseInt(req.body.year),
    num_parts: parseInt(req.body.num_parts),
    img_url: req.body.img_url,
    theme_id: parseInt(req.body.theme_id),
  };

  editSet(setNum, setData)
    .then(() => res.redirect('/lego/sets'))
    .catch((error) => handleRouteError(res, error));
}

function handleDeleteSetRoute(req, res) {
  const setNum = req.params.num;

  legoData
    .deleteSet(setNum)
    .then(() => res.redirect('/lego/sets'))
    .catch((error) =>
      res.render('500', { message: `I'm sorry, but we have encountered the following error: ${error}` })
    );
}

async function editSet(setNum, setData) {
  try {
    await legoData.editSet(setNum, setData);
  } catch (error) {
    throw error;
  }
}

async function getThemes() {
  try {
    return await legoData.getAllThemes();
  } catch (error) {
    throw error;
  }
}

async function addNewSet(setData) {
  try {
    await legoData.addSet(setData);
  } catch (error) {
    throw error;
  }
}

function handleError(err, req, res, next) {
  console.error(err.stack);

  const page = req.path || '/';
  res.status(500).render('500', { page, message: `I'm sorry, but we have encountered the following error: ${err}` });
}

function handle404(req, res) {
  res.status(404).render('404');
}

function handleRouteError(res, error, status = 500) {
  console.error(error);
  res.status(status).send(error.message);
}