
const pool = require('../db');

exports.getPersonnelByOwner = async (req, res) => {
	const { ownerId } = req.params;
	try {
		const [rows] = await pool.query(
			`SELECT personnelId, first_name, last_name, role, type, address, email, avatar FROM personnel WHERE owner_id = ?`,
			[ownerId]
		);
		res.json(rows);
	} catch (error) {
		res.status(500).json({ error: 'Failed to fetch personnel', details: error.message });
	}
};

exports.addPersonnel = async (req, res) => {
	const { owner_id, first_name, last_name, role, type, address, email, avatar } = req.body;
	if (!owner_id || !first_name || !last_name) {
		return res.status(400).json({ error: 'Missing required fields' });
	}
	try {
		await pool.query(
			`INSERT INTO personnel (owner_id, first_name, last_name, role, type, address, email, avatar)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
			[owner_id, first_name, last_name, role, type, address, email, avatar || null]
		);
		res.status(201).json({ message: 'Personnel added successfully' });
	} catch (error) {
		res.status(500).json({ error: 'Failed to add personnel', details: error.message });
	}
};

exports.assignPersonnel = async (req, res) => {
	const { personnelId, appointment_id } = req.body;
	if (!personnelId || !appointment_id) {
		return res.status(400).json({ error: 'Missing required fields' });
	}
	try {
		await pool.query(
			'UPDATE bookings SET personnelId = ? WHERE appointment_id = ?',
			[personnelId, appointment_id]
		);
		res.json({ message: 'Personnel assigned to appointment successfully' });
	} catch (error) {
		res.status(500).json({ error: 'Failed to assign personnel', details: error.message });
	}
};
