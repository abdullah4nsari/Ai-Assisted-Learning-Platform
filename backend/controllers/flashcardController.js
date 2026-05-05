import Flashcard from "../models/Flashcard.js";

//@desc Get all flashcards for a document
//@route GET /api/flashcards/:documentId
//@access private
export const getFlashcards = async (req, res, next) => {
  try {
    const flashcards = await Flashcard.find({
      documentId: req.params.documentId,
      userId: req.user._id,
    })
        .populate('documentId','title fileName')
        .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: flashcards.length,
      data: flashcards,
    });
  } catch (error) {
    next(error);
  }
};

//@desc Get All flashcardset for a user
//@route GET /api/flashcards
//@access private
export const getAllFlashcardSets = async (req, res, next) => {
  try {
    const flashcardSets = await Flashcard.find({
        userId:req.user._id
    })
        .populate('documentId', 'title fileName')
        .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: flashcardSets.length,
      data: flashcardSets,
    });
  } catch (error) {
    next(error);
  }
};


//@desc Mark flashcard as reviewed
//@route PUT /api/flashcards/:cardId/review
//@access private
// export const markReviewed = async (req, res, next) => {
//   try {
//     const flashcardSet = await Flashcard.findOne({
//         'cards._id':req.params.cardId,
//         userId:req.user._id
//     });

//     if (!flashcardSet) {
//       return res.status(404).json({
//         success: false,
//         error: "Flashcard not found",
//         statusCode:404
//       });
//     }

//     const cardIndex = flashcardSet.cards.findIndex(card=>card._id.toString() === req.params.cardId);
//     if(cardIndex === -1){
//         return res.status(200).json({
//             success:false,
//             error:"Card not found in set",
//             statusCode:404
//         });
//     }

//     //update review info
//     flashcardSet.cards[cardIndex].lastReviewed = Date.now();
//     flashcardSet.cards[cardIndex].reviewCount += 1;

//     await flashcardSet.save();

//     res.status(200).json({
//       success: true,
//       data: flashcardSet,
//       message:"Card marked as reviewed"
//     });
//   } catch (error) {
//     next(error);
//   }
// };
export const reviewFlashcard = async (req, res, next) => {
  try {
    const updatedFlashcard = await Flashcard.findOneAndUpdate(
      {
        userId: req.user._id,
        "cards._id": req.params.cardId
      },
      {
        $set: {
          "cards.$.lastReviewed": new Date()
        },
        $inc: {
          "cards.$.reviewCount": 1
        }
      },
      {returnDocument:'after'}
    );

    if (!updatedFlashcard) {
      return res.status(404).json({
        success: false,
        error: "Flashcard not found",
      });
    }

    res.status(200).json({
      success: true,
      data: updatedFlashcard,
      message: "Card marked as reviewed"
    });

  } catch (error) {
    next(error);
  }
};


//@desc Toggle star/favorite on falshcards
//@route PUT /api/flashcards/:cardId/star
//@access private

export const toggleStarFlashcard = async (req, res, next) => {
  try {
    const flashcardSet= await Flashcard.findOneAndUpdate({
        'cards._id':req.params.cardId,
        userId:req.user._id
    });

    if (!flashcardSet) {
      return res.status(404).json({
        success: false,
        error: "Flashcard not found",
      });
    }

    const cardIndex = flashcardSet.cards.findIndex(card=>card._id.toString() === req.params.cardId);
    if(cardIndex === -1){
        return res.status(200).json({
            success:false,
            error:"Card not found in set",
            statusCode:404
        });
    }

    //toggle starred
    flashcardSet.cards[cardIndex].isStarred = !flashcardSet.cards[cardIndex].isStarred;

    await flashcardSet.save();

    res.status(200).json({
      success: true,
      data: flashcardSet,
      message:`Flashcard ${flashcardSet.cards[cardIndex].isStarred ? 'starred' : 'unstarred'}`
    });
  } catch (error) {
    next(error);
  }
};


//@desc delete flascardset
//@route DELETE /api/flashcards/:id
//@access private
export const deleteFlashcardSet = async (req, res, next) => {
  try {
    const flashcardSet = await Flashcard.deleteOne({
      _id: req.params.setId,
      userId: req.user._id,
    });

    if (flashcardSet.deletedCount===0) {
      return res.status(404).json({
        success: false,
        error: "Flashcard set not found",
      });
    }

    res.status(200).json({
      success: true,
      message: `Flashcard Set deleted successfully`,
    });
  } catch (error) {
    next(error);
  }
};