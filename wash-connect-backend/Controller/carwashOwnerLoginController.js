
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

exports.loginCarwashOwner = async (req, res) => {
	const { ownerEmail, ownerPassword } = req.body;

	try {
		if (!ownerEmail || !ownerPassword) {
			return res.status(400).json({
				error: 'Missing credentials',
				details: !ownerEmail ? 'Email is required' : 'Password is required'
			});
		}

		const [owners] = await pool.execute(
			'SELECT owner_id, owner_email, owner_password, owner_first_name, owner_last_name FROM carwash_owners WHERE owner_email = ?',
			[ownerEmail]
		);

		if (owners.length === 0) {
			return res.status(401).json({
				error: 'Login failed',
				details: 'Invalid email or password'
			});
		}

		const owner = owners[0];

		const isPasswordValid = await bcrypt.compare(ownerPassword, owner.owner_password);
		if (!isPasswordValid) {
			return res.status(401).json({
				error: 'Login failed',
				details: 'Invalid email or password'
			});
		}

		const token = jwt.sign(
			{
				ownerId: owner.owner_id,
				email: owner.owner_email,
				role: 'owner'
			},
			process.env.JWT_SECRET,
			{ expiresIn: '8h' }
		);
        
		res.status(200).json({
			success: true,
			message: 'Login successful',
			token,
			owner: {
				id: owner.owner_id,
				first_name: owner.owner_first_name,
				last_name: owner.owner_last_name,
				email: owner.owner_email
			}
		});

	} catch (error) {
		console.error('Login error:', error);
		res.status(500).json({
			error: 'Server error during login',
			details: error.message
		});
	}
};
