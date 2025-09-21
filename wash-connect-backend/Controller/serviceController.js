const pool = require('../db');

exports.createService = async (req, res) => {
  const { applicationId, name, price, description, duration_minutes, image_url } = req.body;
  if (!applicationId || !name) return res.status(400).json({ error: 'applicationId and name are required' });
  try {
    const [r] = await pool.query(
      `INSERT INTO services (applicationId, name, price, description, duration_minutes, image_url)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [applicationId, name, price ?? 0, description ?? null, duration_minutes ?? null, image_url ?? null]
    );
    res.status(201).json({ serviceId: r.insertId });
  } catch (e) {
    res.status(500).json({ error: 'Failed to create service', details: e.message });
  }
};

exports.getServicesByApplication = async (req, res) => {
  const { applicationId } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT serviceId, applicationId, name, price, description, duration_minutes, image_url, is_active
       FROM services
       WHERE applicationId = ? AND is_active = 1
       ORDER BY name`,
      [applicationId]
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch services', details: e.message });
  }
};

exports.updateService = async (req, res) => {
  const { serviceId } = req.params;
  const { name, price, description, duration_minutes, image_url, is_active } = req.body;
  try {
    const [r] = await pool.query(
      `UPDATE services
       SET name = COALESCE(?, name),
           price = COALESCE(?, price),
           description = COALESCE(?, description),
           duration_minutes = COALESCE(?, duration_minutes),
           image_url = COALESCE(?, image_url),
           is_active = COALESCE(?, is_active)
       WHERE serviceId = ?`,
      [name, price, description, duration_minutes, image_url, is_active, serviceId]
    );
    if (!r.affectedRows) return res.status(404).json({ error: 'Service not found' });
    res.json({ message: 'Updated' });
  } catch (e) {
    res.status(500).json({ error: 'Failed to update service', details: e.message });
  }
};

exports.deleteService = async (req, res) => {
  const { serviceId } = req.params;
  try {
    const [r] = await pool.query(`DELETE FROM services WHERE serviceId = ?`, [serviceId]);
    if (!r.affectedRows) return res.status(404).json({ error: 'Service not found' });
    res.json({ message: 'Deleted' });
  } catch (e) {
    res.status(500).json({ error: 'Failed to delete service', details: e.message });
  }
};

exports.uploadServiceImage = async (req, res) => {
  const { serviceId } = req.params;
  if (!req.file) return res.status(400).json({ error: 'No image uploaded' });
  const publicPath = `/uploads/services/${req.file.filename}`;

  try {
    const [r] = await pool.query('UPDATE services SET image_url = ? WHERE serviceId = ?', [publicPath, serviceId]);
    if (!r.affectedRows) return res.status(404).json({ error: 'Service not found' });
    res.json({ message: 'Image uploaded', image_url: publicPath });
  } catch (e) {
    res.status(500).json({ error: 'Failed to save image', details: e.message });
  }
};