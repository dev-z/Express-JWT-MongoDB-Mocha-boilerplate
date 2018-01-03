/**
 * @author Ishtiaque
 * @desc Schema Definition for User and model creation
 */
module.exports = (function createUserSchema() {
  // Defining the Schema
  const Schema = global.mongoose.Schema;
  const userSchema = new Schema({
    name: { type: String, required: true, trim: true, minlength: 1, maxlength: 50 },
    email: {
      type: String,
      unique: true,
      required: true,
      dropDups: true,
      lowercase: true,
      validate: {
        validator(v) {
          // eslint-disable-next-line
          let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          return re.test(v);
        },
        message: '{VALUE} is not a valid email address!',
      },
      maxlength: 100,
    },
    mobile: { type: String, minlength: 10, maxlength: 15 },
    password: { type: String, required: true, select: false },
    areasOfInterest: [String],
    subscribedFeeds: [{
      type: Schema.Types.ObjectId,
      ref: 'Feed',
    }],
    doj: { type: Date, default: Date.now },
    dob: Date,
    isDeleted: { type: Boolean, default: false, select: false },
    isAdmin: { type: Boolean, default: false, select: false },
    isEmailVerified: { type: Boolean, default: false, select: false },
  });
  /**
   * NOTE: The strict option, (enabled by default), ensures that values passed to our model
   * constructor that were not specified in our schema do not get saved to the db.
   * Pass a 2nd param like: const userSchema = new Schema({..}, { strict: false });
   */
  // Adding index
  userSchema.index({ email: 1 });
  // Adding virtual properties
  // Age
  userSchema.virtual('age').get(() => {
    const now = global.moment.utc();
    const dob = global.moment.utc(this.dob);
    return now.diff(dob, 'years');
  });
  // Creating a Model
  const User = global.mongoose.model('User', userSchema);
  return User;
}());
