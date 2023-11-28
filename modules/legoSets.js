/********************************************************************************
* WEB322 – Assignment 05
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
*
* https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
*
* Name: Srushti Patel Student ID: 117791228 Date: 27/11/2023
*
********************************************************************************/
const Sequelize = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'postgres',
  port: 5432,
  dialectOptions: {
    ssl: { rejectUnauthorized: false },
  },
});

const Theme = sequelize.define('Theme', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: Sequelize.STRING,
});

const Set = sequelize.define('Set', {
  set_num: {
    type: Sequelize.STRING,
    primaryKey: true,
  },
  name: Sequelize.STRING,
  year: Sequelize.INTEGER,
  num_parts: Sequelize.INTEGER,
  theme_id: Sequelize.INTEGER,
  img_url: Sequelize.STRING,
});

Set.belongsTo(Theme, { foreignKey: 'theme_id' });

// Function to initialize the database
function initialize() {
  return sequelize.sync()
    .then(() => {
      console.log('Database synced successfully');
    })
    .catch((err) => {
      console.error('Unable to sync database: ' + err.message);
      throw new Error('Unable to sync database');
    });
}

// Function to get all sets
async function getAllSets() {
  try {
    const sets = await Set.findAll({ include: [Theme] });
    if (sets.length === 0) {
      throw new Error('No sets available');
    }
    return sets.map((set) => ({ ...set.dataValues, theme: set.Theme.name }));
  } catch (err) {
    throw new Error('Error fetching all sets: ' + err.message);
  }
}

// Function to get a set by set number
async function getSetByNum(setNum) {
  try {
    const set = await Set.findOne({
      where: { set_num: setNum },
      include: [Theme],
    });
    if (!set) {
      throw new Error('Unable to find requested set');
    }
    return { ...set.dataValues, theme: set.Theme.name };
  } catch (err) {
    throw new Error('Error fetching set by number: ' + err.message);
  }
}

// Function to get sets by theme
async function getSetsByTheme(theme) {
  try {
    const sets = await Set.findAll({
      include: [Theme],
      where: {
        '$Theme.name$': {
          [Sequelize.Op.iLike]: `%${theme}%`,
        },
      },
    });
    if (sets.length === 0) {
      throw new Error('Unable to find requested sets');
    }
    return sets.map((set) => ({ ...set.dataValues, theme: set.Theme.name }));
  } catch (err) {
    throw new Error('Error fetching sets by theme: ' + err.message);
  }
}

// Function to add a new set
function addSet(setData) {
  return Set.create(setData)
    .then(() => {
      console.log('Set added successfully');
    })
    .catch((err) => {
      console.error('Error adding set:', err.errors[0].message);
      throw new Error(err.errors[0].message);
    });
}

// Function to edit an existing set
async function editSet(setNum, setData) {
  try {
    const updatedSet = await Set.update(setData, {
      where: { set_num: setNum },
    });

    if (updatedSet[0] === 0) {
      throw new Error('Set not found for editing');
    }

    console.log('Set edited successfully');
  } catch (err) {
    console.error('Error editing set:', err.errors ? err.errors[0].message : err.message);
    throw new Error(err.errors ? err.errors[0].message : err.message);
  }
}





// Function to get all themes
async function getAllThemes() {
  try {
    const themes = await Theme.findAll();
    return themes.map((theme) => theme.dataValues);
  } catch (err) {
    throw new Error('Error fetching all themes: ' + err.message);
  }
}

function deleteSet(set_num) {
  return Set.destroy({
    where: {
      set_num: set_num
    }
  })
    .then(() => {
      console.log('Set deleted successfully');
    })
    .catch((err) => {
      console.error('Error deleting set:', err.errors[0].message);
      throw new Error(err.errors[0].message);
    });
}
module.exports = { initialize, getAllSets, getSetByNum, getSetsByTheme, addSet, editSet,deleteSet, getAllThemes, Theme, Set };