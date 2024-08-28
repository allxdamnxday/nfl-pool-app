const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  content: {
    type: String,
    required: [true, 'Please add content'],
    trim: true,
    maxlength: [100000, 'Content cannot be more than 100000 characters']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  imageUrl: {
    type: String,
    validate: {
      validator: function(v) {
        // Updated regex to allow Cloudinary URLs
        return /^(https?:\/\/)?(res\.cloudinary\.com\/[\w\-]+\/image\/upload\/|[\da-z\.-]+\.([a-z\.]{2,6}))([\/\w \.-]*)*\/?$/.test(v);
      },
      message: props => `${props.value} is not a valid URL!`
    }
  },
  imagePublicId: {
    type: String
  },
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  featured: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  tags: [{
    type: String,
    trim: true
  }],
  readTimeMinutes: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  }
});

// Ensure the content is not escaped when converting to JSON
BlogSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    ret.content = ret.content;
    return ret;
  }
});

BlogSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

BlogSchema.methods.estimateReadTime = function() {
  const wordsPerMinute = 200;
  const wordCount = this.content.split(/\s+/).length;
  this.readTimeMinutes = Math.ceil(wordCount / wordsPerMinute);
};

module.exports = mongoose.model('Blog', BlogSchema);