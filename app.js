const express = require('express');
const uniqid = require('uniqid');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const passport = require("passport");
const LocalStrategy = require("passport-local");
const Sequelize = require('sequelize');

const sq = require("./sequelize");
const User = require("./models/User");
const Product = require("./models/Product");

// console.log(User)

User.sync();
Product.sync();

// sq
//   .authenticate()
//   .then(() => {
//     console.log('Connection has been established successfully.');
//   })
//   .catch(err => {
//     console.error('Unable to connect to the database:', err);
//   });

const app = express();

app.use(cookieParser);
app.use(queryParser);
app.use(bodyParser.json());

// const products = [];
// const users = [
//     {
//         username: "Clark Kent",
//         email: "clark_kent@gmail.com",
//         password: "1234",
//     }
// ];

passport.use(new LocalStrategy({
    usernameField: "email",
    passwordField: "password",
    session: false,
}, (username, password, done) => {
    User.findOne({where: { email: username }}).then(user => {
        if (user === null || user.password !== password) {
            done(null, false, "bad username")
        } else {
            done(null, user)
        }
    })
}))

function checkToken(req, res, next) {
    const token = req.headers["x-access-token"];

    if (token) {
        jwt.verify(token, "secret word", function(err) {
            if (err) {
                res.status(403).send({code: 403, message: "Forbidden", data: {}});
            } else {
                next()
            }
        });
    } else {
        res.status(403).send({code: 403, message: "No token provided", data: {}});
    }
}

app.post('/auth', passport.authenticate("local", {session: false}), (req, res) => {
    const token = jwt.sign({id: req.user.username}, "secret word", { expiresIn: 100 });
    const response = {
        code: 200,
        message: "OK",
        data: {
            user: {
                email: req.user.email,
                username: req.user.username,
            }
        },
        token,
    }
    res.json(response);
})

app.get('/api/products', checkToken, (req, res) => {
    Product.findAll().then(products => res.json(products));
});
  
app.get('/api/products/:id', checkToken, (req, res) => {
    Product.findById(req.params.id).then(product => res.json(product));
});

app.get('/api/products/:id/reviews', checkToken, (req, res) => {
    Product.findById(req.params.id).then(product => res.json(product.reviews));
});
  
app.post('/api/products', checkToken, (req, res) => {
    const product = {
        ...req.body,
        id: uniqid(),
    }
    Product.create(product).then(product => res.json(product));
})

app.get('/api/users', checkToken, (req, res) => {
    User.findAll().then(users => res.json(users));
})

function cookieParser(req, res, next) {
    let parsedCookies = {};
    if (!req.headers.cookie) {
        req.parsedCookies = parsedCookies;
        next();
        return;
    }
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