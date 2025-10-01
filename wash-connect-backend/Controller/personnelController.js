const pool = require('../db');
const multer = require("multer");
const path = require("path");

// Configure multer for avatar uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/personnel/");
  },
  filename: (req, file, cb) => {
    cb(null, `personnel_${req.params.personnelId}_${Date.now()}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage });

exports.getPersonnelByOwner = async (req, res) => {
  const { ownerId } = req.params;
  const { role } = req.query;
  let query = 'SELECT * FROM personnel WHERE owner_id = ?';
  let params = [ownerId];
  if (role) {
    query += ' AND role = ?';
    params.push(role);
  }
  const [rows] = await pool.query(query, params);
  res.json(rows);
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
}

exports.createPersonnel = async (req, res) => {
  // For multipart/form-data, fields are in req.body
  const { owner_id, first_name, last_name, role, type, address, email, day_available, time_available, time_availability } = req.body;
  // Avatar file is in req.file
  const avatar = req.file ? `/uploads/personnel/${req.file.filename}` : null;

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

// Assign a personnel to a specific service
exports.assignToService = async (req, res) => {
  const { personnelId, serviceId } = req.body;
  if (!personnelId || !serviceId) {
    return res.status(400).json({ error: 'personnelId and serviceId are required' });
  }
  try {
    // Ensure mapping table (idempotent)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS service_personnel (
        id INT AUTO_INCREMENT PRIMARY KEY,
        service_id INT NOT NULL,
        personnel_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uniq_service_personnel (service_id, personnel_id)
      )
    `);

    await pool.query(
      `INSERT INTO service_personnel (service_id, personnel_id)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE personnel_id = VALUES(personnel_id)`,
      [serviceId, personnelId]
    );
    res.json({ message: 'Personnel assigned to service successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to assign personnel to service', details: error.message });
  }
};

// GET /api/personnel/by-service/:serviceId
exports.getPersonnelByService = async (req, res) => {
  const { serviceId } = req.params;
  if (!serviceId) return res.status(400).json({ error: 'serviceId is required' });

  try {
    const [rows] = await pool.query(
      `SELECT p.personnelId, p.first_name, p.last_name, p.role, p.type, p.email, p.avatar
       FROM service_personnel sp
       JOIN personnel p ON p.personnelId = sp.personnel_id
       WHERE sp.service_id = ?`,
      [serviceId]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch assigned personnel', details: error.message });
  }
};

exports.uploadAvatar = [
  upload.single("avatar"),
  async (req, res) => {
    const { personnelId } = req.params;
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const avatarUrl = `/uploads/personnel/${req.file.filename}`;
    try {
      await pool.query(
        "UPDATE personnel SET avatar = ? WHERE personnelId = ?",
        [avatarUrl, personnelId]
      );
      res.json({ avatar: avatarUrl });
    } catch (error) {
      res.status(500).json({ error: "Failed to update avatar", details: error.message });
    }
  },
];

exports.getPersonnelAvailability = async (req, res) => {
  const { personnel_id } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT day_available, time_available, time_availability
       FROM personnel
       WHERE personnelId = ?`,
      [personnel_id]
    );
    if (!rows.length) {
      return res.status(404).json({ error: 'Personnel not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch personnel availability', details: error.message });
  }
};

// PUT /api/personnel/:personnelId
exports.editPersonnel = async (req, res) => {
  const { personnelId } = req.params;
  const {
    first_name,
    last_name,
    role,
    type,
    address,
    email,
    day_available,
    time_available,
    time_availability
  } = req.body;

  // Build avatar path if uploaded
  const avatar = req.file ? `/uploads/personnel/${req.file.filename}` : null;

  // Only update fields that are provided
  const fields = [];
  const values = [];

  if (first_name) { fields.push("first_name = ?"); values.push(first_name); }
  if (last_name) { fields.push("last_name = ?"); values.push(last_name); }
  if (role) { fields.push("role = ?"); values.push(role); }
  if (type) { fields.push("type = ?"); values.push(type); }
  if (address) { fields.push("address = ?"); values.push(address); }
  if (email) { fields.push("email = ?"); values.push(email); }
  if (avatar) { fields.push("avatar = ?"); values.push(avatar); }
  if (day_available) { fields.push("day_available = ?"); values.push(day_available); }
  if (time_available) { fields.push("time_available = ?"); values.push(time_available); }
  if (time_availability) { fields.push("time_availability = ?"); values.push(time_availability); }

  if (!fields.length) {
    return res.status(400).json({ error: "No fields to update." });
  }

  values.push(personnelId);

  try {
    await pool.query(
      `UPDATE personnel SET ${fields.join(", ")} WHERE personnelId = ?`,
      values
    );
    res.json({ message: "Personnel updated successfully." });
  } catch (error) {
    res.status(500).json({ error: "Failed to update personnel", details: error.message });
  }
};
