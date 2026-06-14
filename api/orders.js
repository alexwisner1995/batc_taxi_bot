export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'POST') {
        return res.json({ 
            success: true, 
            message: 'Заказ создан (тестовый режим)',
            order: {
                id: 'order-' + Date.now(),
                ...req.body,
                status: 'searching'
            }
        });
    }

    if (req.method === 'GET') {
        return res.json({ orders: [], message: 'Заказов пока нет' });
    }

    return res.status(405).json({ error: 'Метод не поддерживается' });
}
