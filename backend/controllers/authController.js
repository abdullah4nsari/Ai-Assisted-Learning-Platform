import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';

const client = new OAuth2Client(process.env.CLIENT_ID_OAUTH);

const generateToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

const userPayload = (user) => ({
    _id:          user._id,
    username:     user.username,
    displayName:  user.displayName || user.username,
    email:        user.email,
    profileImage: user.profileImage,
    createdAt:    user.createdAt,
});

//@desc Register new user
//@route POST /api/auth/register
//@access public
export const register = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        const userExists = await User.findOne({ $or: [{ email }, { username }] });
        if (userExists) {
            return res.status(400).json({
                success: false,
                error: userExists.email === email
                    ? 'Email already registered, try with different email.'
                    : 'Username already taken',
                statusCode: 400,
            });
        }

        const user  = await User.create({ username, email, password });
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            data:    { user: userPayload(user), token },
            message: 'User registered successfully',
        });
    } catch (error) {
        next(error);
    }
};

//@desc Login user
//@route POST /api/auth/login
//@access public
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Please provide email and password',
                statusCode: 400,
            });
        }

        const user = await User.findOne({ email }).select('+password');
        if (!user || !user.password) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials',
                statusCode: 401,
            });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials',
                statusCode: 401,
            });
        }

        const token = generateToken(user._id);
        res.status(200).json({
            success: true,
            data:    { user: userPayload(user), token },
            message: 'Login successful',
        });
    } catch (error) {
        next(error);
    }
};

//@desc Google OAuth — verify credential (ID token) or access_token, find or create user, return JWT
//@route POST /api/auth/google
//@access public
export const googleAuth = async (req, res, next) => {
    try {
        const { credential, access_token } = req.body;

        if (!credential && !access_token) {
            return res.status(400).json({
                success: false,
                error: 'Google credential or access_token is required',
                statusCode: 400,
            });
        }

        let googleId, email, name, picture;

        if (credential) {
            // ID token flow (GoogleLogin button)
            const ticket  = await client.verifyIdToken({
                idToken:  credential,
                audience: process.env.CLIENT_ID_OAUTH,
            });
            const payload = ticket.getPayload();
            ({ sub: googleId, email, name, picture } = payload);
        } else {
            // Access token flow (useGoogleLogin hook)
            const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${access_token}` },
            });
            if (!response.ok) throw new Error('Failed to fetch Google user info');
            const info = await response.json();
            googleId = info.sub;
            email    = info.email;
            name     = info.name;
            picture  = info.picture;
        }

        // Find existing user by googleId or email
        let user = await User.findOne({ $or: [{ googleId }, { email }] });

        if (user) {
            // Link googleId if they previously registered with email/password
            if (!user.googleId) {
                user.googleId     = googleId;
                user.profileImage = user.profileImage || picture || null;
                await user.save();
            }
        } else {
            // Create new user — username is space-free for DB uniqueness
            // displayName keeps the full name with spaces for display
            const baseUsername = (name || email.split('@')[0])
                .replace(/\s+/g, '')   // strip spaces for username only
                .toLowerCase()
                .slice(0, 20);

            let username  = baseUsername;
            let collision = await User.findOne({ username });
            while (collision) {
                username  = `${baseUsername}${Math.floor(1000 + Math.random() * 9000)}`;
                collision = await User.findOne({ username });
            }

            user = await User.create({
                username,
                displayName:  name || null,   // "Abdullah Ansari" — spaces preserved
                email,
                googleId,
                profileImage: picture || null,
            });
        }

        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            data:    { user: userPayload(user), token },
            message: 'Google authentication successful',
        });
    } catch (error) {
        console.error('Google auth error:', error.message);
        // surface a more specific error in development
        const msg = process.env.NODE_ENV === 'development'
            ? error.message
            : 'Google authentication failed';
        res.status(401).json({
            success: false,
            error: msg,
            statusCode: 401,
        });
    }
};

//@desc Get user profile
//@route GET /api/auth/profile
//@access private
export const getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        res.status(200).json({
            success: true,
            data: {
                id:           user._id,
                username:     user.username,
                displayName:  user.displayName || user.username,
                email:        user.email,
                profileImage: user.profileImage,
                createdAt:    user.createdAt,
                updatedAt:    user.updatedAt,
            },
        });
    } catch (error) {
        next(error);
    }
};

//@desc Update user profile
//@route PUT /api/auth/profile
//@access private
export const updateProfile = async (req, res, next) => {
    try {
        const { username, email, profileImage } = req.body;
        const user = await User.findById(req.user._id);

        if (username)     user.username     = username;
        if (email)        user.email        = email;
        if (profileImage) user.profileImage = profileImage;

        await user.save();

        res.status(200).json({
            success: true,
            data: {
                id:           user._id,
                username:     user.username,
                email:        user.email,
                profileImage: user.profileImage,
            },
            message: 'Profile updated successfully',
        });
    } catch (error) {
        next(error);
    }
};

//@desc Change password
//@route POST /api/auth/change-password
//@access private
export const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                error: 'Please provide current and new password',
                statusCode: 400,
            });
        }

        const user = await User.findById(req.user._id).select('+password');

        if (!user.password) {
            return res.status(400).json({
                success: false,
                error: 'This account uses Google sign-in. Password change is not available.',
                statusCode: 400,
            });
        }

        if (!(await user.matchPassword(currentPassword))) {
            return res.status(401).json({
                success: false,
                error: 'Current password is incorrect',
                statusCode: 401,
            });
        }

        user.password = newPassword;
        await user.save();

        res.status(200).json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        next(error);
    }
};
