
const pool = require('../db');

exports.registerCarwashOwner = async (req, res) => {
	const { owner_name, owner_email, owner_password, owner_avatar } = req.body;
	if (!owner_name || !owner_email || !owner_password) {
		return res.status(400).json({ error: 'Missing required fields' });
	}
	try {
		await pool.query(
			'INSERT INTO carwash_owners (owner_name, owner_email, owner_password, owner_avatar) VALUES (?, ?, ?, ?)',
			[owner_name, owner_email, owner_password, owner_avatar || null]
		);
		res.status(201).json({ success: true, message: 'Carwash owner registered successfully.' });
	} catch (error) {
		res.status(500).json({ error: 'Failed to register carwash owner', details: error.message });
	}
};
