const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const bcrypt = require("bcrypt");
const userModel = require("../model/userModel");
const walletModel = require("../model/walletModel");

passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await userModel.findById(id);
        const userValue = { _id: user._id, email: user.email };
        done(null, userValue);
    } catch (error) {
        done(error);
    }
});

// google strategy
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "https://www.sonicboomgames.shop/auth/google/callback",
            passReqToCallback: true,
        },
        async (req, accessToken, refreshToken, profile, done) => {
            try {
                let user = await userModel.findOne({ googleId: profile.id });

                // inside GoogleStrategy
                if (!user) {
                    user = await userModel.create({
                        googleId: profile.id,
                        name: profile.displayName,
                        email: profile.emails[0].value,
                        profilePhoto: profile.photos[0].value,
                    });

                    await walletModel.create({
                        userId: user._id,
                    });

                    // pass isNewUser flag through done
                    return done(null, user, { isNewUser: true });
                }

                // if existing user
                if (user.isBlocked) {
                    return done(null, false, {
                        message: "Your account has been blocked by administrator",
                    });
                }

                return done(null, user, { isNewUser: false });

            } catch (err) {
                return done(err);
            }
        }
    )
);

module.exports = passport;
