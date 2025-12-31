const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit mobile number']
    },
    altPhone: {
        type: String,
        match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit mobile number']
    },
    pincode: {
        type: String,
        required: [true, 'Pincode is required'],
        match: [/^[0-9]{6}$/, 'Please enter a valid 6-digit pincode']
    },
    addressLine1: { // House No / Building Name
        type: String,
        required: [true, 'House No / Building Name is required'],
        trim: true
    },
    addressLine2: { // Street / Area / Locality
        type: String,
        required: [true, 'Street / Area / Locality is required'],
        trim: true
    },
    landmark: {
        type: String,
        trim: true
    },
    city: {
        type: String,
        required: true,
        trim: true
    },
    state: {
        type: String,
        required: true,
        trim: true
    },
    addressType: {
        type: String,
        enum: ['Home', 'Work', 'Other'],
        default: 'Home'
    },
    isDefault: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false,
        select: false // By default, do not return deleted addresses
    }
}, { timestamps: true });

// Ensure only one default address per user (handled in controller, but index helps)
// Partial index to allow multiple isDefault:false but only one isDefault:true per user?
// Actually, it's safer to handle this in business logic to avoid index complexity with soft deletes.
// But we can verify "active" addresses. 

module.exports = mongoose.model('Address', addressSchema);
