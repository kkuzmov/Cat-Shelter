const url = require('url');
const fs = require('fs');
const path = require('path');
const qs = require('querystring');
const formidable = require('formidable');
const breeds = require('../data/breeds');
const cats = require('../data/cats.json');
const globalPath = __dirname.toString().replace('handlers', '');

// ИЗМИСЛИ ПО-ДОБЪР ВАРИАНТ ЗА ВЗИМАНЕ/НАСРОЧВАНЕ НА ID, ЗАЩОТО ТАКА ПРОМЕНЯ ЛОГИКАТА И ОБЪРКВА СПИСЪКА С КОТКИ!

module.exports = (req, res) => {

    const pathname = url.parse(req.url).pathname;

    if (pathname === '/cats/add-cat' && req.method === 'GET') {
        let filePath = path.normalize(
            path.join(__dirname, '../views/addCat.html')
        );
        const index = fs.createReadStream(filePath);
        index.on('data', (data) => {
            let catBreedPlaceholder = breeds.map((breed) => `<option value=${breed}>${breed}</option>`);
            let modifiedData = data.toString().replace('{{catBreeds}}', catBreedPlaceholder);
            res.write(modifiedData);
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
    } else if (pathname === '/cats/add-breed' && req.method === 'POST') {
        let formData = '';

        req.on('data', (data) => {
            formData += data;
        })
        req.on('end', () => {
            let body = qs.parse(formData);
            fs.readFile('./data/breeds.json', (err, data) => {
                if (err) {
                    throw err;
                }

                let breeds = JSON.parse(data);
                breeds.push(body.breed);
                let json = JSON.stringify(breeds);

                fs.writeFile('./data/breeds.json', json, 'utf-8', () => console.log('The breed was uploaded succesfully!'))
            })

            res.writeHead(302, {
                location: '/'
            });
            res.end();
        })
    } else if (pathname === '/cats/add-cat' && req.method === 'POST') {
        let form = new formidable.IncomingForm();

        form.parse(req, (err, fields, files) => {
            if (err) throw err;
            let oldPath = files.upload.path;
            let newPath = path.normalize(path.join(globalPath, '/content/images/' + files.upload.name));

            fs.rename(oldPath, newPath, (err) => {
                if (err) throw err;
                console.log('Files were uploaded successfully')
            })
            fs.readFile('./data/cats.json', 'utf-8', (err, data) => {
                if (err) throw err;

                let allCats = JSON.parse(data);
                allCats.push({
                    id: cats.length + 1,
                    ...fields,
                    image: files.upload.name
                });
                let json = JSON.stringify(allCats);
                fs.writeFile('./data/cats.json', json, () => {
                    res.writeHead(302, {
                        location: '/'
                    });
                    res.end();
                })
            })
        })
    } else if (pathname.includes('/cats-edit') && req.method === 'GET') {
        const filePath = path.normalize(path.join(__dirname, '../views/editCat.html'));
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(404, {
                    'Content-Type': 'text/plain'
                });
                res.write('404 File Not Found');
                res.end();
                return;
            }
            const id = pathname.split('/').pop();
            const cat = cats.find((cat) => cat.id == id);
            let editForm = `<form action="/cats-edit/${id}" method="POST" class="cat-form" enctype="multipart/form-data">
            <h2>Edit Cat</h2>
            <label for="name">Name</label>
            <input name="name" type="text" id="name" value="${cat.name}">
            <label for="description">Description</label>
            <textarea name="description" id="description">${cat.description}</textarea>
            <label for="image">Image</label>
            <input name="upload" type="file" id="image">
            <label for="group">Breed</label>
            <select name="breed" id="group">
                {{catBreeds}}
            </select>
            <button type="submit">Add Cat</button>
        </form>`
            const placeholder = breeds.map(breed => `<option value="${breed}">${breed}</option>`);
            editForm = editForm.replace('{{catBreeds}}', placeholder);
            const modifiedData = data.toString().replace('{{edit}}', editForm);

            res.writeHead(200, {
                'Content-Type': 'text/html'
            });
            res.write(modifiedData);
            res.end();
        });
    } else if (pathname.includes('/cats-find-new-home') && req.method === 'GET') {
        let filePath = path.normalize(
            path.join(__dirname, '../views/catShelter.html')
        );
        fs.readFile(filePath, (err, data) => {
            if (err) {
                console.log(err);
                res.writeHead(404, {
                    'Content-Type': 'text/plain'
                });
                res.write('404 File Not Found');
                res.end();
                return;
            }
            const id = pathname.split('/').pop();
            const cat = cats.find((cat) => cat.id == id);
            let editForm = `<form action="/cats-find-new-home/${id}" method="POST" class="cat-form">
            <h2>Shelter the cat</h2>
            <img src="/content/images/${cat.image}" alt="${cat.image}">
            <label for="name">Name</label>
            <input type="text" id="name" value="${cat.name}" disabled>
            <label for="description">Description</label>
            <textarea id="description" disabled>${cat.description}</textarea>
            <label for="group">Breed</label>
            <select id="group" disabled>
                <option value="${cat.breed}">${cat.breed}</option>
            </select>
            <button>SHELTER THE CAT</button>
            </form>`

            const modifiedData = data.toString().replace('{{shelter}}', editForm);
            res.writeHead(200, {
                'Content-Type': 'text/html'
            });
            res.write(modifiedData);
            res.end();
        });
    } else if (pathname.includes('/cats-edit') && req.method === 'POST') {
        let form = new formidable.IncomingForm();

        form.parse(req, (err, fields, files) => {
            if (err) throw err;
            let oldPath = files.upload.path;
            let newPath = path.normalize(path.join(globalPath, '/content/images/' + files.upload.name));

            fs.rename(oldPath, newPath, (err) => {
                if (err) throw err;
                console.log('Files were uploaded successfully')
            })
            fs.readFile('./data/cats.json', 'utf-8', (err, data) => {
                if (err) throw err;

                let id = Number(pathname.split('/').pop()) // correct
                let allCats = JSON.parse(data);
                let currentCat = allCats.find(cat => cat.id == id);
                let indexOfCurrCat = allCats.indexOf(currentCat);
                allCats.splice(indexOfCurrCat, 1, {
                    id: Number(id),
                    ...fields,
                    image: files.upload.name
                })
                let json = JSON.stringify(allCats);
                fs.writeFile('./data/cats.json', json, () => {
                    res.writeHead(301, {
                        location: '/'
                    });
                    res.end();
                })
            })
        })
    } else if (pathname.includes('/cats-find-new-home') && req.method === 'POST') {
        fs.readFile('./data/cats.json', 'utf-8', (err, data) => {
            if (err) throw err;

            let id = pathname.slice(pathname.length - 1); // correct

            let allCats = JSON.parse(data);
            let currentCat = allCats.find(cat => cat.id == id);
            console.log(`Current cat is ${currentCat}`);
            let indexOfCurrCat = allCats.indexOf(currentCat);
            console.log(`ID is ${id}`);
            console.log(`Index of deleted cat is ${indexOfCurrCat}`);
            allCats.splice(indexOfCurrCat, 1);
            let json = JSON.stringify(allCats);
            fs.writeFile('./data/cats.json', json, () => {
                console.log(`Found a new home for ${currentCat.name}`)
                res.writeHead(301, {
                    location: '/'
                });
                res.end();
            })
        })
    } else {
        return true;
    }




}