const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
    // Разрешаем CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const usersPath = path.join(process.cwd(), 'data', 'users.json');
    
    // GET - получить пользователя по telegram_id
    if (req.method === 'GET') {
        const { telegram_id } = req.query;
        const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
        const user = users.find(u => u.telegram_id == telegram_id);
        
        if (user) {
            return res.json({ success: true, user });
        }
        return res.json({ success: false, user: null });
    }
    
    // POST - создать пользователя
    if (req.method === 'POST') {
        const { telegram_id, first_name, phone, role } = req.body;
        let users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
        
        // Проверяем, существует ли
        let user = users.find(u => u.telegram_id == telegram_id);
        
        if (!user) {
            user = {
                id: 'user-' + Date.now(),
                telegram_id,
                first_name,
                phone,
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
