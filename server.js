/********************************************************************************
* WEB322 – Assignment 04
 I declare that this assignment is my own work in accordance with Seneca's
   Academic Integrity Policy:
    https://www.senecacollege.ca/about/policies/academic-integrity-policy.html

 Name: Srushti Patel Student ID: 117791228 Date: 10/11/2023

 Published URL: https://successful-teal-fashion.cyclic.app/lego/sets

********************************************************************************/

const express = require('express');
const legoData = require('./modules/legoSets');
const path = require('path');

const app = express();
const PORT = 3000;

// Configure EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());

// Initialize LEGO data and start the server
async function startServer() {
    try {
        await legoData.initialize();
        app.listen(PORT, () => {
            console.log(`Server started on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Failed to initialize data:", error);
    }
}

startServer();

// Routes
app.get('/', (req, res) => {
    res.render('home', { page: '/' });
});

app.get('/about', (req, res) => {
    res.render('about', { page: '/about' });
});

app.get('/lego/sets', async (req, res) => {
    try {
        const theme = req.query.theme;
        const legoSets = theme ? await legoData.getSetsByTheme(theme) : await legoData.getAllSets();
        res.render('sets', { sets: legoSets });
    } catch (error) {
        console.error(error);
        res.status(404).send(error.message);
    }
});

app.get('/lego/sets/:set_num', async (req, res) => {
    try {
        const setNum = req.params.set_num;
        const legoSet = await legoData.getSetByNum(setNum);

        if (!legoSet) {
            return res.status(404).send('Set not found');
        }

        res.render('set', { set: legoSet });
    } catch (error) {
        console.error(error);
        res.status(404).send(error.message);
    }
});

// Handle 404 errors with a custom 404.ejs template
app.use((req, res) => {
    res.status(404).render('404');
});
