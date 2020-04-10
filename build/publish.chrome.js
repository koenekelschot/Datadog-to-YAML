const manifest = require('../dist/chrome/manifest.json');
const zipdir = require('zip-dir');

const distDir = './dist/chrome';
const releasesDir = './releases/chrome';

const packageName = `${manifest.name.toLowerCase()} ${manifest.version}`.split(" ").join("-");
console.log(`Publishing: ${packageName}`);

zipdir(
    distDir, 
    {
        saveTo: `${releasesDir}/${packageName}.zip`,
        each: path => console.log(`Added ${path}`) 
    }, 
    (err, buffer) => {
        if (err) {
            console.error(err);
        }
    }
);