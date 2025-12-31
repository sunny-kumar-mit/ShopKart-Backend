const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Check if user exists
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
            return done(null, user);
        }

        // Check if user exists by email
        user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
            // Link google account
            user.googleId = profile.id;
            if (!user.avatar) user.avatar = profile.photos[0].value;
            await user.save();
            return done(null, user);
        }

        // Create new user
        user = new User({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            avatar: profile.photos[0].value,
            isVerified: true
        });

        await user.save();
        done(null, user);

    } catch (err) {
        done(err, null);
    }
}));

module.exports = passport;
