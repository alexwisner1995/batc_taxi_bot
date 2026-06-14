const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const usersPath = path.join(process.cwd(), 'data', 'users.json');
    
    // Читаем пользователей
    let users = [];
    try {
        users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
    } catch(e) {
        users = [];
    }
    
    // GET - получить пользователя по telegram_id
    if (req.method === 'GET') {
        const telegramId = req.query.telegram_id;
        const user = users.find(u => String(u.telegram_id) === String(telegramId));
        
        if (user) {
            return res.json({ success: true, user });
        }
        return res.json({ success: false, user: null });
    }
    
    // POST - создать пользователя
    if (req.method === 'POST') {
        const { telegram_id, first_name, phone, role } = req.body;
        
        // Проверяем существует ли
        let user = users.find(u => String(u.telegram_id) === String(telegram_id));
        
        if (!user) {
            user = {
                id: 'user-' + Date.now(),
                telegram_id: String(telegram_id),
                first_name: first_name || 'Пользователь',
                phone: phone || '',
                role: role || 'passenger',
                created_at: new Date().toISOString()
            };
            users.push(user);
            fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
        }
        
        return res.json({ success: true, user });
    }
    
    res.status(405).json({ error: 'Method not allowed' });
};
