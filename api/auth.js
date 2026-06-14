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
    
    // Читаем файл
    let users = [];
    try {
        const data = fs.readFileSync(usersPath, 'utf8');
        users = JSON.parse(data);
    } catch(e) {
        console.log('Ошибка чтения users.json:', e.message);
    }

    // GET запрос
    if (req.method === 'GET') {
        const { telegram_id } = req.query;
        console.log('GET telegram_id:', telegram_id);
        console.log('Всего пользователей:', users.length);
        
        const user = users.find(u => String(u.telegram_id) === String(telegram_id));
        
        if (user) {
            return res.json({ success: true, user: user });
        } else {
            return res.json({ success: false, user: null });
        }
    }
    
    // POST запрос
    if (req.method === 'POST') {
        const body = req.body;
        console.log('POST body:', body);
        
        const telegram_id = String(body.telegram_id);
        
        // Ищем существующего
        let user = users.find(u => String(u.telegram_id) === telegram_id);
        
        if (!user) {
            user = {
                id: 'user-' + Date.now(),
                telegram_id: telegram_id,
                first_name: body.first_name || 'Пользователь',
                phone: body.phone || '',
                role: body.role || 'passenger',
                created_at: new Date().toISOString()
            };
            users.push(user);
            
            // Записываем в файл
            fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
            console.log('Пользователь создан:', user);
        }
        
        return res.json({ success: true, user: user });
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
};
