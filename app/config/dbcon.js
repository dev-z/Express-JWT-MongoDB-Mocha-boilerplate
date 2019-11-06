const mongoose = require('mongoose');
/**
 * @author Ishtiaque
 * @desc Connects to the DB.
 * @returns {Promise}
 */
function connectDB() {
  // Setting Mongoose to use ES6 native promises.
  mongoose.Promise = global.Promise;
  // Create the connection url based on the env properties.
  const dbName = process.env.DB_NAME;
  let hostPort = process.env.DB_HOST;
  if (process.env.DB_PORT) {
    hostPort = `${process.env.DB_HOST}:${process.env.DB_PORT}`;
  } else {
    // Use default port
    hostPort = `${process.env.DB_HOST}:27017`;
  }
  const uri = `mongodb://${hostPort}/${dbName}`;
  const opts = {
    user: process.env.DB_USER,
    pass: process.env.DB_PASS,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };
  console.info(`Connecting to DB @ ${uri}`);
  const promise = mongoose.connect(uri, opts);
  return promise;
}

module.exports = connectDB;
