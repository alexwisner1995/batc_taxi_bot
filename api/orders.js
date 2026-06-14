const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const ordersPath = path.join(process.cwd(), 'data', 'orders.json');
    let orders = JSON.parse(fs.readFileSync(ordersPath, 'utf8'));
    
    // POST - создать заказ
    if (req.method === 'POST') {
        const order = {
            id: 'order-' + Date.now(),
            ...req.body,
            status: 'searching',
            created_at: new Date().toISOString()
        };
        orders.push(order);
        fs.writeFileSync(ordersPath, JSON.stringify(orders, null, 2));
        return res.json({ success: true, order });
    }
    
    // GET - получить заказы
    if (req.method === 'GET') {
        return res.json({ orders });
    }
    
    res.status(405).json({ error: 'Method not allowed' });
};
