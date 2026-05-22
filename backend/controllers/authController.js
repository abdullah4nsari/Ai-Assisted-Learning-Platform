import jwt            from 'jsonwebtoken';
import crypto          from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import User            from '../models/User.js';
import { sendVerificationEmail } from '../utils/emailService.js';

const client = new OAuth2Client(process.env.CLIENT_ID_OAUTH);

// ── helpers ───────────────────────────────────────────────────────────────────
const generateToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

/** Secure random hex token for email verification */
const generateVerificationToken = () => crypto.randomBytes(32).toString('hex');

const userPayload = (user) => ({
    _id:          user._id,
    username:     user.username,
    displayName:  user.displayName || user.username,
    email:        user.email,
    profileImage: user.profileImage,
    isVerified:   user.isVerified,
    createdAt:    user.createdAt,
});

// ── Register ──────────────────────────────────────────────────────────────────
//@desc  Register new user + send verification email
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

        // Generate verification token (expires in 24 hours)
        const verificationToken       = generateVerificationToken();
        const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

        const user = await User.create({
            username,
            email,
            password,
            isVerified:              false,
            verificationToken,
            verificationTokenExpiry,
        });

        // Respond immediately — don't make the client wait for the email
        res.status(201).json({
            success: true,
            message: 'Account created! Please check your email to verify your account.',
        });

        // Send email AFTER responding (true fire-and-forget)
        sendVerificationEmail(email, username, verificationToken)
            .catch(err => console.error('Verification email failed:', err.message));
    } catch (error) {
        next(error);
    }
};

// ── Login ─────────────────────────────────────────────────────────────────────
//@desc  Login — blocks unverified email/password users
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

        // Block login if email not verified
        if (!user.isVerified) {
            return res.status(403).json({
                success:        false,
                error:          'Please verify your email first.',
                needsVerification: true,
                email:          user.email,
                statusCode:     403,
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

// ── Verify Email ──────────────────────────────────────────────────────────────
//@desc  Verify email using token from link
//@route GET /api/auth/verify-email/:token
//@access public
export const verifyEmail = async (req, res, next) => {
    try {
        const { token } = req.params;

        // First check: is there a user already verified with no token?
        // This handles the StrictMode double-call edge case gracefully
        const user = await User.findOne({
            verificationToken:       token,
            verificationTokenExpiry: { $gt: new Date() },
        }).select('+verificationToken +verificationTokenExpiry');

        if (!user) {
            return res.status(400).json({
                success: false,
                error:   'Verification link is invalid or has expired.',
                statusCode: 400,
            });
        }

        // Mark as verified and clear token fields
        user.isVerified              = true;
        user.verificationToken       = undefined;
        user.verificationTokenExpiry = undefined;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Email verified successfully! You can now log in.',
        });
    } catch (error) {
        next(error);
    }
};

// ── Resend Verification Email ─────────────────────────────────────────────────
//@desc  Resend verification email — generates a fresh token
//@route POST /api/auth/resend-verification
//@access public
export const resendVerification = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                error:   'Please provide your email address.',
                statusCode: 400,
            });
        }

        const user = await User.findOne({ email })
            .select('+verificationToken +verificationTokenExpiry');

        // Always return success to prevent email enumeration
        if (!user || user.isVerified) {
            return res.status(200).json({
                success: true,
                message: 'If that email exists and is unverified, a new link has been sent.',
            });
        }

        // Generate fresh token (invalidates old one)
        user.verificationToken       = generateVerificationToken();
        user.verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await user.save();

        // Respond immediately, send email in background
        res.status(200).json({
            success: true,
            message: 'Verification email resent. Please check your inbox.',
        });

        sendVerificationEmail(email, user.username, user.verificationToken)
            .catch(err => console.error('Resend verification email failed:', err.message));
    } catch (error) {
        next(error);
    }
};

// ── Google OAuth ──────────────────────────────────────────────────────────────
//@desc  Google OAuth — Google users are auto-verified
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
            const ticket  = await client.verifyIdToken({
                idToken:  credential,
                audience: process.env.CLIENT_ID_OAUTH,
            });
            const payload = ticket.getPayload();
            ({ sub: googleId, email, name, picture } = payload);
        } else {
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

        let user = await User.findOne({ $or: [{ googleId }, { email }] });

        if (user) {
            if (!user.googleId) {
                user.googleId     = googleId;
                user.profileImage = user.profileImage || picture || null;
                user.isVerified   = true; // link existing account → auto-verify
                await user.save();
            }
        } else {
            const baseUsername = (name || email.split('@')[0])
                .replace(/\s+/g, '').toLowerCase().slice(0, 20);

            let username  = baseUsername;
            let collision = await User.findOne({ username });
            while (collision) {
                username  = `${baseUsername}${Math.floor(1000 + Math.random() * 9000)}`;
                collision = await User.findOne({ username });
            }

            user = await User.create({
                username,
                displayName:  name || null,
                email,
                googleId,
                profileImage: picture || null,
                isVerified:   true, // Google accounts are pre-verified
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
        const msg = process.env.NODE_ENV === 'development' ? error.message : 'Google authentication failed';
        res.status(401).json({ success: false, error: msg, statusCode: 401 });
    }
};

// ── Get Profile ───────────────────────────────────────────────────────────────
//@desc  Get user profile
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
                isVerified:   user.isVerified,
                createdAt:    user.createdAt,
                updatedAt:    user.updatedAt,
            },
        });
    } catch (error) {
        next(error);
    }
};

// ── Update Profile ────────────────────────────────────────────────────────────
//@desc  Update user profile
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

// ── Change Password ───────────────────────────────────────────────────────────
//@desc  Change password
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
