
const pool = require('../db');

exports.getCarwashOwner = async (req, res) => {
	const { ownerId } = req.params;
	try {
		const [rows] = await pool.query(
			'SELECT *, owner_avatar FROM carwash_owners WHERE owner_id = ?',
			[ownerId]
		);
		if (rows.length > 0) {
			res.json(rows[0]);
		} else {
			res.status(404).json({ error: "Owner not found" });
		}
	} catch (error) {
		res.status(500).json({ error: 'Failed to fetch owner', details: error.message });
	}
};
