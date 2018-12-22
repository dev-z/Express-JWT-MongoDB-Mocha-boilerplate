/**
 * @author Ishtiaque
 * @desc Connects to the DB.
 * @returns {Promise}
 */

function connectDB() {
  // Setting Mongoose to use ES6 native promises.
  global.mongoose.Promise = global.Promise;
  // Create the connection url based on the env properties.
  const db = process.env.DB_NAME;
  let userPass = '';
  if (process.env.DB_USER) {
    userPass = process.env.DB_USER;
    if (process.env.DB_PASS) {
      userPass = `${process.env.DB_USER}:${process.env.DB_PASS}`;
    }
  }
  let hostPort = process.env.DB_HOST;
  if (process.env.DB_PORT) {
    hostPort = `${process.env.DB_HOST}:${process.env.DB_PORT}`;
  }
  const uri = `mongodb+srv://${userPass}@${hostPort}/${db}`;
  const opts = {
    config: {
      // NOTE: set autoIndex to false in production mode to boost performance.
      // In other stages, it remains true.
      autoIndex: (process.env.STAGE === 'production'),
    },
    useNewUrlParser: true,
  };
  console.info(`Connecting to DB @ ${uri}`);
  const promise = global.mongoose.connect(uri, opts);
  return promise;
}

module.exports = connectDB;
