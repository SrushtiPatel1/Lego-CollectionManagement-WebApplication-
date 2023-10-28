/********************************************************************************
* WEB322 – Assignment 03
* 
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
* 
* https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
* Name: Srushti Patel Student ID: 117791228  Date: 27/10/2023
*
* Published URL: ___________________________________________________________
*
********************************************************************************/

const express = require('express');
const legoData = require('./modules/legoSets');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());

legoData.initialize()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server started on http://localhost:${PORT}`);
        });
    })
    .catch(error => {
        console.error("Failed to initialize data:", error);
    });

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'home.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'about.html'));
});

app.get('/lego/sets', async (req, res) => {
    try {
        const theme = req.query.theme;
        if (theme) {
            const setsByTheme = await legoData.getSetsByTheme(theme);
            res.json(setsByTheme);
        } else {
            const allSets = await legoData.getAllSets();
            res.json(allSets);
        }
    } catch (error) {
        res.status(404).send(error.message);
    }
});

app.get('/lego/sets/:set_num', async (req, res) => {
    const setNum = req.params.set_num;
    try {
        const set = await legoData.getSetByNum(setNum);
        res.json(set);
    } catch (error) {
        res.status(404).send(error.message);
    }
});

app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
});
