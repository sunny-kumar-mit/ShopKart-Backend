const Address = require('../models/Address');

// @desc    Get all addresses for logged in user
// @route   GET /api/addresses
// @access  Private
exports.getAddresses = async (req, res) => {
    try {
        const addresses = await Address.find({ userId: req.user.id, isDeleted: false })
            .sort({ isDefault: -1, createdAt: -1 }); // Default first, then new ones
        res.json(addresses);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Add new address
// @route   POST /api/addresses
// @access  Private
exports.addAddress = async (req, res) => {
    try {
        const userId = req.user.id;

        // Check limit (10)
        const count = await Address.countDocuments({ userId, isDeleted: false });
        if (count >= 10) {
            return res.status(400).json({ message: 'Maximum 10 addresses allowed' });
        }

        const {
            fullName, phone, altPhone, pincode,
            addressLine1, addressLine2, landmark,
            city, state, addressType, isDefault
        } = req.body;

        // If setting as default, unset others
        if (isDefault) {
            await Address.updateMany(
                { userId, isDefault: true },
                { $set: { isDefault: false } }
            );
        }

        // If this is the FIRST address, make it default automatically
        const shouldBeDefault = isDefault || count === 0;

        const newAddress = new Address({
            userId,
            fullName,
            phone,
            altPhone,
            pincode,
            addressLine1, // House No
            addressLine2, // Locality
            landmark,
            city,
            state,
            addressType,
            isDefault: shouldBeDefault
        });

        const address = await newAddress.save();
        res.json(address);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Update address
// @route   PUT /api/addresses/:id
// @access  Private
exports.updateAddress = async (req, res) => {
    try {
        const {
            fullName, phone, altPhone, pincode,
            addressLine1, addressLine2, landmark,
            city, state, addressType, isDefault
        } = req.body;

        let address = await Address.findById(req.params.id);

        if (!address) return res.status(404).json({ message: 'Address not found' });
        if (address.userId.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

        // Handle Default Logic
        if (isDefault && !address.isDefault) {
            await Address.updateMany(
                { userId: req.user.id, isDefault: true },
                { $set: { isDefault: false } }
            );
        }

        // Build address object
        const addressFields = {
            fullName, phone, altPhone, pincode,
            addressLine1, addressLine2, landmark,
            city, state, addressType
        };
        if (isDefault !== undefined) addressFields.isDefault = isDefault;

        address = await Address.findByIdAndUpdate(
            req.params.id,
            { $set: addressFields },
            { new: true }
        );

        res.json(address);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Delete address (Soft Delete)
// @route   DELETE /api/addresses/:id
// @access  Private
exports.deleteAddress = async (req, res) => {
    try {
        let address = await Address.findById(req.params.id);

        if (!address) return res.status(404).json({ message: 'Address not found' });
        if (address.userId.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

        // Soft delete
        address.isDeleted = true;
        // If it was default, maybe warn user? Or just leave no default? 
        // Let's just unset default flag on soft delete to avoid confusion if recovered later (though not implementing recovery now)
        if (address.isDefault) {
            address.isDefault = false;
        }

        await address.save();

        res.json({ message: 'Address removed' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Set address as default
// @route   PATCH /api/addresses/:id/default
// @access  Private
exports.setDefaultAddress = async (req, res) => {
    try {
        let address = await Address.findById(req.params.id);

        if (!address) return res.status(404).json({ message: 'Address not found' });
        if (address.userId.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

        // Unset old default
        await Address.updateMany(
            { userId: req.user.id, isDefault: true },
            { $set: { isDefault: false } }
        );

        // Set new default
        address.isDefault = true;
        await address.save();

        res.json(address);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
