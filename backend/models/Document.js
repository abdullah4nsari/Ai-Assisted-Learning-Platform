import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Please provide a title'],
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    filename: {
        type: String,
        required: true
    },
    filepath: {
        type: String,
        required: true
    },
    filesize: {
        type: Number,
        required: true
    },
    extractedText: {
        type: String,
        default: ''
    },
    chunks: [{
        content: {
            type: String,
            required: true
        },
        pageNumber: {
            type: Number,
            default: 0
        },
        chunkIndex: {
            type: Number,
            required: true
        }
    }],
    public_id: {
        type: String,
        default: null
    },
    resource_type: {
        type: String,
        default: 'raw'
    },
    uploadDate: {
        type: Date,
        default: Date.now
    },
    lastAccessed: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ["processing", "ready", "failed"],
        default: "processing"
    }
}, { timestamps: true });

//indexing for faster queries
documentSchema.index({ userId: 1, uploadDate: -1 });

const Document = mongoose.model('Document', documentSchema);
export default Document;