const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    lesson: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson',
        required: true
    },
    content: {
        type: String,
        required: [true, 'Please provide note content'],
        trim: true
    },
    timestamp: {
        type: Number, // In seconds, to link the note to a specific time in the video
        default: 0
    }
}, {
    timestamps: true
});

// One note per user per lesson? Or multiple notes per lesson?
// Let's allow multiple notes per lesson (at different timestamps).

module.exports = mongoose.model('Note', noteSchema);
