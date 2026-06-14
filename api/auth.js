export default async function handler(req, res) {
    // Разрешаем CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // GET запрос
    if (req.method === 'GET') {
        return res.json({ 
            success: false, 
            message: 'GET работает, но пользователей пока нет',
            telegram_id: req.query.telegram_id || 'не указан'
        });
    }

    // POST запрос
    if (req.method === 'POST') {
        return res.json({ 
            success: true, 
            message: 'POST работает',
            user: {
                id: 'user-' + Date.now(),
                telegram_id: req.body.telegram_id || 'не указан',
                first_name: req.body.first_name || 'не указан',
                phone: req.body.phone || 'не указан',
                role: req.body.role || 'passenger'
            }
        });
    }

    return res.status(405).json({ error: 'Метод не поддерживается' });
}
