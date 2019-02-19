const express = require('express');
const uniqid = require('uniqid');
const bodyParser = require('body-parser');

const app = express();

app.use(cookieParser);
app.use(queryParser);
app.use(bodyParser.json());

const products = [];
const users = [];

app.get('/api/products', (req, res) => {
    res.json(JSON.stringify(products));
});
  
app.get('/api/products/:id', (req, res) => {
    for (let i = 0; i < products.length; i++) {
        if (products[i].id === req.params.id) {
            res.json(JSON.stringify(products[i]));
            return;
        }
    }
    res.send(`product ${req.params.id} doesnt exist`);
});

app.get('/api/products/:id/reviews', (req, res) => {
    for (let i = 0; i < products.length; i++) {
        if (products[i].id === req.params.id) {
            res.json(JSON.stringify(products[i].reviews));
            return;
        }
    }
    res.send(`product ${req.params.id} doesnt exist`);
});
  
app.post('/api/products', (req, res) => {
    console.log(req.body)
    let product = {
        ...req.body,
        id: uniqid(),
    }
    products.push(product)
    res.json(JSON.stringify(product));
})

app.get('/api/users', (req, res) => {
    res.json(JSON.stringify(users));
})

function cookieParser(req, res, next) {
    let parsedCookies = {};
    let cookies = req.headers.cookie.split(";")
    for (let i = 0; i < cookies.length; i++) {
        let cookieFields = cookies[i].split("=");
        parsedCookies[cookieFields[0]] = cookieFields[1]
    }
    req.parsedCookies = parsedCookies;
    next()
}

function queryParser(req, res, next) {
    let queryPos = req.url.indexOf("?");
    let parsedQuery = {};
    if (queryPos !== -1) {
        let queries = req.url.slice(queryPos + 1).split("&")
        for (let i = 0; i < queries.length; i++) {
            let queryFields = queries[i].split("=");
            parsedQuery[queryFields[0]] = queryFields[1]
        }
    }
    req.parsedQuery = parsedQuery;
    next()
}

module.exports = app;