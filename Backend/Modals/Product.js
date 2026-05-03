const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, 'Name is required'],
		trim: true,
	},
	code: {
		type: String,
		required: [true, 'Code is required'],
		trim: true,
	},
	description: {
		type: String,
	},
	return: {
		type: Boolean,
		default: false,
	},
	category: {
		type: [String],
		required: [true, 'Category is required'],
	},
	price: {
		type: Number,
		required: [true, 'Price is required'],
	},
	quantity: {
		type: Number,
		required: [true, 'Stock is required'],
	},
	isVisible: {
		type: Boolean,
		default: false,
	},
	size: {
		type: [String],
		required: [true, 'Size is required'],
	},
	color: {
		type: [String],
		required: [true, 'Color is required'],
	},
	image: {
		type: [String],
		required: [true, 'Image is required'],
	},
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
	}
}, {
	timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
