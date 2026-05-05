import Quiz from '../models/Quiz.js';

//@desc Get all quizzes for a document
//@route GET /api/quiz/:documentId
//@access private

export const getQuizzes = async (req, res, next) => {
    try {
        const quizzes = await Quiz.find({
            documentId: req.params.documentId,
            userId: req.user._id,
        })
            .populate('documentId', 'title').sort({ createdAt: -1 });

        if (!quizzes) {
            res.status(404).json({
                success: false,
                error: 'No quizzes found for this document',
                statusCode: 404
            })
        }

        res.status(200).json({
            success: true,
            count: quizzes.length,
            data: quizzes,
        });
    } catch (error) {
        next(error);
    }
};


//@desc Get quiz by id
//@route GET /api/quiz/:id
//@access private

export const getQuizById = async (req, res, next) => {
    try {
        const quiz = await Quiz.findOne({
            _id: req.params.id,
            userId: req.user._id,
        })

        if (!quiz) {
            res.status(404).json({
                success: false,
                error: 'Quiz not found',
                statusCode: 404
            })
        }

        res.status(200).json({
            success: true,
            data: quiz,
        });
    } catch (error) {
        next(error);
    }
};


//@desc POST submit quiz
//@route POST /api/quiz/:id/submit
//@access private
export const submitQuiz = async (req, res, next) => {
    try {
        const { answers } = req.body;

        if (!Array.isArray(answers)) {
            return res.status(400).json({
                success: false,
                error: 'Please provide answers array',
                statusCode: 400
            })
        }

        const quiz = await Quiz.findOne({
            _id: req.params.id,
            userId: req.user._id,
        });

        if (!quiz) {
            return res.status(404).json({
                success: false,
                error: 'Quiz not found',
                statusCode: 404
            })
        }

        if (quiz.completedAt) {
            return res.status(400).json({
                success: false,
                error: 'Quiz already submitted',
                statusCode: 400
            })
        }

        //process quiz answers
        let correctAnswer = 0;
        const userAnswers = [];
        const answeredSet = new Set();

        answers.forEach((answer) => {
            const { questionIndex, selectedAnswer } = answer;
            if (answeredSet.has(questionIndex)) return;
            answeredSet.add(questionIndex);

            if (questionIndex >= 0 && questionIndex < quiz.questions.length) {
                const question = quiz.questions[questionIndex];
                const isCorrect =
                    selectedAnswer?.trim().toLowerCase() ===
                    question.correctAnswer?.trim().toLowerCase();

                if (isCorrect) {
                    correctAnswer++;
                }

                userAnswers.push({
                    questionIndex,
                    selectedAnswer,
                    isCorrect,
                    answeredAt: new Date()
                })
            }
        })


        //calculate score
        const score = Math.round((correctAnswer / quiz.questions.length) * 100);

        //update quiz
        quiz.userAnswer = userAnswers;
        quiz.score = score;
        quiz.completedAt = new Date();

        await quiz.save();

        res.status(200).json({
            success: true,
            data: {
                quizId:quiz._id,
                score,
                totalQuestions: quiz.questions.length,
                correctAnswers: correctAnswer,
                userAnswers,
                percentage:score,
                completedAt: quiz.completedAt
            },
            message: 'Quiz submitted successfully'
        });
    } catch (error) {
        next(error);
    }
}




//@desc Get quiz result
//@route GET /api/quiz/:id/results
//@access private
export const getQuizResults = async (req, res, next) => {
    try {
        const quiz = await Quiz.findOne({
            _id: req.params.id,
            userId: req.user._id,
        })

        if(!quiz){
            return res.status(404).json({
                success: false,
                error: 'Quiz not found',
                statusCode: 404
            })
        };

        if(!quiz.completedAt){
            res.status(400).json({
                success: false,
                error: 'Quiz not completed yet',
                statusCode: 400
            })
        }

        //build detailed results 
        const detailedResults=quiz.questions.map((question,index)=>{
            const userAnswer = quiz.userAnswer.find(a=>a.questionIndex===index);
            return {
                questionIndex:index,
                question:question.question,
                correctAnswer:question.correctAnswer,
                selectedAnswer:userAnswer? userAnswer.selectedAnswer : null,
                isCorrect:userAnswer? userAnswer.isCorrect : false,
                explanation:question.explanation || null
            }

        })

        res.status(200).json({
            success: true,
            data:{
                quiz:{
                    id:quiz._id,
                    title:quiz.title,
                    document:quiz.documentId,
                    totalQuestions:quiz.totalQuestions,
                    score:quiz.score,
                    percentage:quiz.score,
                    completedAt:quiz.completedAt
                },
                results:detailedResults
            }
        });
    } catch (error) {
        next(error);
    }
}




//@desc Delete quiz by id
//@route Delete /api/quiz/:id
//@access private
export const deleteQuiz = async (req, res, next) => {
    try {
        const quiz = await Quiz.findOne({
            _id:req.params.id,
            userId:req.user._id
        })

        if(!quiz){
            res.status(404).json({
                success:false,
                error:'Quiz not found',
                statusCode:404
            })
        }

        await quiz.deleteOne();

        res.status(200).json({
            success:true,
            message:'Quiz deleted successfully'
        })
    } catch (error) {
        next(error);
    }
}