const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

/**
 * Returns a connection string to the DB based on the enviornment.
 * For test envs, it spins up a mock db and returns its connection string.
 * @returns {Promise}
 */
function getDbUri() {
  if (process.env.NODE_ENV === 'test') {
    console.info('Spinning up mock db...');
    const mongoServer = new MongoMemoryServer();
    return mongoServer.getConnectionString();
  }
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
  return Promise.resolve(uri);
}
/**
 * @author Ishtiaque
 * Connects to the DB.
 * @param {String} mongoUri Mongo db connection string
 * @returns {Promise}
 */
function connectDB(mongoUri) {
  // Setting Mongoose to use ES6 native promises.
  mongoose.Promise = global.Promise;
  const opts = {
    user: process.env.DB_USER,
    pass: process.env.DB_PASS,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    autoReconnect: true,
    reconnectTries: 10,
    reconnectInterval: 1000,
  };
  console.info(`Using ${process.env.NODE_ENV} environment`);
  console.info(`Connecting to DB @ ${mongoUri}`);
  const promise = mongoose.connect(mongoUri, opts);
  return promise;
}

module.exports = {
  connectDB,
  getDbUri,
};
