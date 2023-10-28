/********************************************************************************
* WEB322 – Assignment 02
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
*
* https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
*
* Name: Srushti Patel Student ID: 117791228 Date: 16/10/23
*
********************************************************************************/
const setData = require("../data/setData");
const themeDetails = require("../data/themeData");

let sets = [];

async function initialize() {
    return new Promise((resolve, reject) => {
        try {
            sets = setData.map(uniqueSet => {
                const matchedTheme = themeDetails.find(themeEntry => themeEntry.id === uniqueSet.theme_id);
                if (matchedTheme) {
                    return {
                        ...uniqueSet,
                        theme: matchedTheme.name
                    };
                }
                return null;
            }).filter(Boolean); 
            
            resolve();  
        } catch (err) {
            reject('Initialization error: ' + err.message);
        }
    });
}

async function getAllSets() {
    if (sets && sets.length > 0) {
        return sets;
    } else {
        throw new Error('No sets found');
    }
}

async function getSetByNum(designation) {
    const identifiedSet = sets.find(specificSet => specificSet.set_num === designation);
    if (identifiedSet) {
        return identifiedSet;
    } else {
        throw new Error(`Unable to find requested set: ${designation}`);
    }
}

async function getSetsByTheme(themeDescriptor) {
    const thematicSets = sets.filter(instanceSet => instanceSet.theme.toLowerCase().includes(themeDescriptor.toLowerCase()));
    if (thematicSets && thematicSets.length > 0) {
        return thematicSets;
    } else {
        throw new Error(`Unable to find requested sets for theme: ${themeDescriptor}`);
    }
}


(async function testLogic() {
    try {
        await initialize();
        const completeSets = await getAllSets();
        console.log("All sets:", completeSets);

        const fetchedSet = await getSetByNum('10837-1');
        console.log("Requested set:", fetchedSet);

        const setsViaTheme = await getSetsByTheme('My Town');
        console.log("Sets by theme:", setsViaTheme);
    } catch (issue) {
        console.error("Error:", issue);
    }
})();
module.exports = { initialize, getAllSets, getSetByNum, getSetsByTheme };
