import Document from "../models/Document.js";
import Flashcard from "../models/Flashcard.js";
import Quiz from "../models/Quiz.js";
import User from "../models/User.js";

// returns today's date at midnight UTC for consistent day comparison
const toMidnightUTC = (date) => {
    const d = new Date(date);
    d.setUTCHours(0, 0, 0, 0);
    return d;
};

const updateStreak = async (userId) => {
    const user = await User.findById(userId).select('studyStreak lastActiveDate');
    const today = toMidnightUTC(new Date());
    const last = user.lastActiveDate ? toMidnightUTC(user.lastActiveDate) : null;

    let streak = user.studyStreak || 0;

    if (!last) {
        // first time visiting
        streak = 1;
    } else {
        const diffDays = Math.round((today - last) / (1000 * 60 * 60 * 24));
        if (diffDays === 0) {
            // same day — no change
        } else if (diffDays === 1) {
            // consecutive day — increment
            streak += 1;
        } else {
            // missed a day — reset
            streak = 1;
        }
    }

    await User.findByIdAndUpdate(userId, {
        studyStreak: streak,
        lastActiveDate: new Date()
    });

    return streak;
};

//@desc Get user learning statistics
//@route GET api/progress/dashboard
//@access private

export const getDashboardStats = async (req, res, next) => {
    try {
        const userId = req.user._id;

        //Get Counts
        //get total documents
        const totalDocuments = await Document.countDocuments({ userId });

        //get total flashcard sets
        const totalFlashcardSets = await Flashcard.countDocuments({ userId });

        //get total quizzes
        const totalQuizzes = await Quiz.countDocuments({ userId });

        //get completed quiz count
        const completedQuiz = await Quiz.countDocuments({ userId, completedAt: { $ne: null } });


        //get Flashcard statistics
        const flashcardSets = await Flashcard.find({ userId });
        let totalFlashcards = 0;
        let reviewFlashcards = 0;
        let starredFlashcards = 0;

        flashcardSets.forEach(set => {
            totalFlashcards += set.cards.length;
            reviewFlashcards += set.cards.filter(card => card.reviewCount > 0).length;
            starredFlashcards += set.cards.filter(card => card.isStarred).length;
        })

        //get quiz statistics
        const quizzes = await Quiz.find({ userId, completedAt: { $ne: null } });
        const averageScore = quizzes.length > 0
            ? Math.round(quizzes.reduce((sum, q) => sum + q.score, 0) / quizzes.length)
            : 0;

        //recent activity 
        const recentDocuments = await Document.find({ userId })
            .sort({ lastAccessed: -1 })
            .limit(5)
            .select('title filename lastAccessed status');

        const recentQuizzes = await Quiz.find({ userId })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('documentId', 'title')
            .select('title score totalQuestions completedAt')

        //study streak — tracked via lastActiveDate on User
        const studyStreak = await updateStreak(userId);

        res.status(200).json({
            success: true,
            data: {
                overview: {
                    totalDocuments,
                    totalFlashcardSets,
                    totalQuizzes,
                    completedQuiz,
                    totalFlashcards,
                    reviewFlashcards,
                    starredFlashcards,
                    averageScore,
                    studyStreak,
                },
                recentActivity: {
                    documents: recentDocuments,
                    quizzes: recentQuizzes
                }
            }
        })

    } catch (error) {
        next(error);
    }
}