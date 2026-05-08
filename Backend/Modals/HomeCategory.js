const mongoose = require('mongoose');

const homeCategorySchema = new mongoose.Schema({
	title: {
		type: String,
		required: [true, 'Title is required'],
		trim: true,
	},
	description: {
		type: String,
		required: [true, 'Description is required'],
		trim: true,
	},
	buttonText: {
		type: String,
		required: [true, 'Button text is required'],
		trim: true,
	},
	link: {
		type: String,
		required: [true, 'Link is required'],
		trim: true,
	},
	image: {
		type: String,
		required: [true, 'Image URL is required'],
		trim: true,
	},
	createdBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Admin',
	}
}, {
	timestamps: true
});

module.exports = mongoose.model('HomeCategory', homeCategorySchema);
