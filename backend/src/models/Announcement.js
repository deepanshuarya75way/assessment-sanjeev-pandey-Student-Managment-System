import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Announcement title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Announcement description is required'],
      trim: true,
    },
    content: {
      type: String,
      trim: true,
    },
    targetAudience: {
      type: String,
      enum: ['Everyone', 'Students', 'Teachers', 'ALL', 'STUDENT', 'TEACHER'],
      default: 'Everyone',
    },
    targetRole: {
      type: String,
      enum: ['ALL', 'STUDENT', 'TEACHER', 'Everyone', 'Students', 'Teachers'],
      default: 'ALL',
    },
    priority: {
      type: String,
      enum: ['Normal', 'High', 'Urgent'],
      default: 'Normal',
    },
    status: {
      type: String,
      enum: ['Published', 'Draft', 'Archived'],
      default: 'Published',
    },
    publishDate: {
      type: Date,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    category: {
      type: String,
      enum: ['General', 'Academic', 'Exam', 'Event'],
      default: 'General',
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    authorName: {
      type: String,
      default: 'Administration',
    },
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

announcementSchema.pre('validate', function (next) {
  if (this.content && !this.description) {
    this.description = this.content;
  } else if (this.description && !this.content) {
    this.content = this.description;
  }

  if (this.targetAudience === 'Students' || this.targetRole === 'STUDENT') {
    this.targetAudience = 'Students';
    this.targetRole = 'STUDENT';
  } else if (this.targetAudience === 'Teachers' || this.targetRole === 'TEACHER') {
    this.targetAudience = 'Teachers';
    this.targetRole = 'TEACHER';
  } else {
    this.targetAudience = 'Everyone';
    this.targetRole = 'ALL';
  }

  if (this.expiryDate && !this.expiresAt) this.expiresAt = this.expiryDate;
  if (this.expiresAt && !this.expiryDate) this.expiryDate = this.expiresAt;

  next();
});

announcementSchema.index({ publishDate: -1, status: 1, targetAudience: 1 });
announcementSchema.index({ createdAt: -1, targetRole: 1 });

const Announcement = mongoose.model('Announcement', announcementSchema);

export default Announcement;