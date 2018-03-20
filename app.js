const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const expressValidator = require('express-validator');
const mongojs = require('mongojs');
const db = mongojs('customerapp', ['users']);
const ObjectId = mongojs.ObjectId;
const app = express();

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Body Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// Need a place to put our static stuff, e.g. css files and JS libraries
// Set Static Path
app.use(express.static(path.join(__dirname, 'client')));

// Global variables
app.use((request, response, next) => {
    response.locals.errors = null;
    next();
})

// Express Validator Middleware
app.use(expressValidator());

// Express routing
app.get('/', function(request, response) {
    db.users.find((err, docs) => {
        response.render('index', {
            title: 'Customers',
            users: docs
        });
    })
});

app.post('/users/add', function(request, response) {
    request.checkBody('first_name', 'First Name is Required').notEmpty();
    request.checkBody('last_name', 'Last Name is Required').notEmpty();
    request.checkBody('email', 'Email is Required').notEmpty();
    
    let errors = request.validationErrors();

    if (errors) {
        db.users.find((err, docs) => {
            response.render('index', {
                title: 'Customers',
                users: docs,
                errors: errors
            });
        });
    } else {
        let newUser = {
            first_name: request.body.first_name,
            last_name: request.body.last_name,
            email: request.body.email
        }
        db.users.insert(newUser, (error, result) => {
            if (error) {
                console.log(error);
            }
            response.redirect('/');
        })
    }
})

app.delete('/users/delete/:id', function(request, response){
    db.users.remove({_id: ObjectId(request.params.id)}, (error, result) => {
        if (error) {
            console.log(error);
        }
        response.redirect('/');
    })
})

app.listen(3000, function() {
    console.log('Server Started on Port 3000');
});
