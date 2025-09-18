
const pool = require('../db');

exports.uploadOwnerAvatar = async (req, res) => {
	try {
		if (!req.file) {
			return res.status(400).json({ error: 'No file uploaded' });
		}
		const avatarPath = `/uploads/avatars/${req.file.filename}`;
		const ownerId = req.params.id;

		// Update the avatar path in the database
		await pool.query(
			"UPDATE carwash_owners SET owner_avatar = ? WHERE owner_id = ?",
			[avatarPath, ownerId]
		);

		res.json({ avatar: avatarPath });
	} catch (err) {
		console.error('Avatar upload error:', err);
		res.status(500).json({ error: 'Failed to upload avatar' });
	}
};
