const url = require('url');
const fs = require('fs');
const path = require('path');
const qs = require('querystring');
const formidable = require('formidable');
const breeds = require('../data/breeds');
const cats = require('../data/cats');


module.exports = (req, res) => {

    const pathname = url.parse(req.url).pathname;

    if (pathname === '/cats/add-cat' && req.method === 'GET') {
        let filePath = path.normalize(
            path.join(__dirname, '../views/addCat.html')
        );
        const index = fs.createReadStream(filePath);
        index.on('data', (data) => {
            res.write(data);
        })
        index.on('end', () => {
            res.end();
        })
        index.on('error', (err) => {
            console.log(err);
        })
    } else if (pathname === '/cats/add-breed' && req.method === 'GET') {
        let filePath = path.normalize(
            path.join(__dirname, '../views/addBreed.html')
        );
        const index = fs.createReadStream(filePath);
        index.on('data', (data) => {
            res.write(data);
        })
        index.on('end', () => {
            res.end();
        })
        index.on('error', (err) => {
            console.log(err);
        })
    } else if (pathname === '/cats/cat-shelter' && req.method === 'GET') {
        let filePath = path.normalize(
            path.join(__dirname, '../views/catShelter.html')
        );
        const index = fs.createReadStream(filePath);
        index.on('data', (data) => {
            res.write(data);
        })
        index.on('end', () => {
            res.end();
        })
        index.on('error', (err) => {
            console.log(err);
        })
    } else if (pathname === '/cats/edit-cat' && req.method === 'GET') {
        let filePath = path.normalize(
            path.join(__dirname, '../views/editCat.html')
        );
        const index = fs.createReadStream(filePath);
        index.on('data', (data) => {
            res.write(data);
        })
        index.on('end', () => {
            res.end();
        })
        index.on('error', (err) => {
            console.log(err);
        })
    } else if (pathname === '/cats/add-breed' && req.method === 'POST') {
        let formData = '';
        req.on('data', (data) => {
            formData += data;
        })
        req.on('end', () => {
            let body = fs.parse(formData);

            fs.readFile('./data/breeds.json', (err, data) => {
                if (err) {
                    throw err;
                }

                let breeds = JSON.parse(data);
                breeds.push(body.breed);
                let json = JSON.stringify(breeds);
                fs.writeFile('./data/breeds.json', json, 'utf-8', () => console.log('The breed was uploaded succesfully!'))
            })

            res.writeHead(302, { location: '/' });
            res.end();
        })
    } else {
        return true;
    }


}