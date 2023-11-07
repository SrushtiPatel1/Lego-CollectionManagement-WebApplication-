const express = require('express');
const legoData = require('./modules/legoSets');
const path = require('path');
const https = require('https'); // Add this line for making HTTP requests

const app = express();
const PORT = 3000;

// Configure EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

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
    res.render('home', { page: '/'});
});

app.get('/about', (req, res) => {
    res.render('about', { page: '/'});
});

app.get('/lego/sets', async (req, res) => {
    try {
        const theme = req.query.theme; // Get the theme from the query parameter
        let legoSets;

        if (theme) {
            legoSets = await legoData.getSetsByTheme(theme);
        } else {
            legoSets = await legoData.getAllSets();
        }

        res.render('sets', { sets: legoSets });
    } catch (error) {
        res.status(404).send(error.message);
    }
});

// New route for rendering individual LEGO sets
app.get('/lego/sets/:set_num', async (req, res) => {
    try {
        const setNum = req.params.set_num;
        const legoSet = await legoData.getSetByNum(setNum);

        if (!legoSet) {
            return res.status(404).send('Set not found');
        }

        // Render the "set" view with the data
        res.render('set', { set: legoSet });
    } catch (error) {
        res.status(404).send(error.message);
    }
});

// Handle 404 errors with a custom 404.ejs template
app.use((req, res) => {
    res.status(404).render('404');
});
