# Express-JWT-MongoDB-Mocha-boilerplate
Quickstart your projects with this API server Boilerplate. Uses ExpressJS, MongoDB, JWT, Mocha & Chai.

### What is this repository for? ###

* Create a RESTful API server within minutes.
* Uses ExpressJS API Framework and MongoDB as database.
* Uses JWT for authenticating incoming requests.
* Uses Mocha and Chai for testing
* Uses ESLint and Airbnb JS style-guide to help write standard and clean code.
* OpenAPI 3.0 documentation

### How do I get set up? ###

* Clone the repo to your local machine.
* Dependencies: nodejs v6.4.x+, npm v 5.5.x
* Open terminal run 'npm install'
* Create .env file with the required values. (See Creating .env file)
* run tests with command "npm test"
* run the server with command "npm start"
* TODO Deployment instructions

### Creating .env file ###

This project uses "dotenv" npm package to store and use enviroment variables.
Create a .env file in the root folder. Inside this file, the following variables must be declared:

* ENV        : 'production', 'development', 'test' or 'staging'.
* PORT       : port on which to run the API server.
* DB_DB      : Name of the database you want to connect to.
* DB_USER    : username with which to connect to the DB.
* DB_PASS    : password of the above given user.
* DB_HOST    : hostname of the server where the DB is located.
* DB_PORT    : port of the DB service.
* JWT_SECRET : The secret key with which to sign your JWT Tokens.

### Linting ###

To use linting, please ensure that you have dev-dependencies installed for this project.

* VS Code - Install the ESLint plugin by Dirk Baeumer.
* Manually - run the command "node node_modules/eslint/bin/eslint --ext .js server.js app".

### Running tests ###

Uses Mocha adn ChaiJS to run automated tests. You can use the results to integrate with CI/CD tools.
Run the command "npm test" to run the tests.
* Please note that running the tests clears the database, so DON'T RUN THE TESTS WHEN CONNECTED TO YOUR PRODUCTION DATABASE.

### Contribution guidelines ###

#### Writing tests ####
* TODO
#### Code review ####

### Help me out ###
This is just a boilerplate project and hence it might not be "perfect".

* If you want to enhance something, please fork this repo, make changes on your copy and submit a pull-request.
* If you want something added, please raise an issue.
* If you see a bug, please raise an issue OR fix it and submit a pull request.

Positive feedback and suggestions are appreciated.

### Who do I talk to? ###

* ishtiaque.zafar92 [at] gmail [dot] com