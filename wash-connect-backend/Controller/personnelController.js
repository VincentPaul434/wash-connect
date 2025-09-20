const pool = require('../db');

exports.getPersonnelByOwner = async (req, res) => {
    const { ownerId } = req.params;
    try {
        const [rows] = await pool.query(
            `SELECT personnelId, owner_id, first_name, last_name, role, type, address, email, avatar,
                    day_available, time_available, time_availability
             FROM personnel
             WHERE owner_id = ?`,
            [ownerId]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch personnel', details: error.message });
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

exports.createPersonnel = async (req, res) => {
    const {
        owner_id,
        first_name,
        last_name,
        role,
        type,
        address,
        email,
        avatar,
        day_available,      // e.g., "Mon, Wed, Fri"
        time_available,     // e.g., "8:00 AM - 3:00 PM"
        time_availability,  // optional combined string
    } = req.body;

    // Required fields (kept consistent with legacy behavior)
    if (!owner_id || !first_name || !last_name) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const sql = `
            INSERT INTO personnel
                (owner_id, first_name, last_name, role, type, address, email, avatar, day_available, time_available, time_availability)
            VALUES
                (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const combined = (time_availability || `${day_available || ''} ${time_available || ''}`.trim()) || null;

        await pool.query(sql, [
            owner_id,
            first_name,
            last_name,
            role,
            type,
            address,
            email,
            avatar || null,
            day_available || null,
            time_available || null,
            combined,
        ]);

        res.status(201).json({ message: 'Personnel created successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create personnel', details: error.message });
    }
};

// Get a single personnel by id (for details page)
exports.getPersonnelById = async (req, res) => {
    const { personnelId } = req.params;
    try {
        const [rows] = await pool.query(
            `SELECT personnelId, owner_id, first_name, last_name, role, type, address, email, avatar,
                    day_available, time_available, time_availability
             FROM personnel
             WHERE personnelId = ?`,
            [personnelId]
        );
        if (!rows.length) return res.status(404).json({ error: 'Personnel not found' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch personnel', details: error.message });
    }
};
