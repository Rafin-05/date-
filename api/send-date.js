export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { date, time, message } = req.body || {};

        const botToken = process.env.TELEGRAM_BOT_TOKEN || '8858077913:AAHAFRiI0Q-2ioID7nFqZPLRox-HwPI9r3Q';
        let chatId = process.env.TELEGRAM_CHAT_ID;

        // Auto-discover Chat ID if not explicitly set in Vercel Environment Variables
        if (!chatId && botToken) {
            try {
                const updatesRes = await fetch(`https://api.telegram.org/bot${botToken}/getUpdates`);
                const updatesData = await updatesRes.json();
                if (updatesData.ok && updatesData.result && updatesData.result.length > 0) {
                    const lastUpdate = updatesData.result[updatesData.result.length - 1];
                    if (lastUpdate.message && lastUpdate.message.chat) {
                        chatId = lastUpdate.message.chat.id;
                    }
                }
            } catch (e) {
                console.warn('Auto Chat ID discovery failed:', e);
            }
        }

        if (!chatId) {
            console.warn('TELEGRAM_CHAT_ID is missing.');
            return res.status(200).json({ 
                success: false, 
                message: 'Please start your bot on Telegram or configure TELEGRAM_CHAT_ID.' 
            });
        }

        const formattedText = `💖 *NEW DATE CONFIRMED!* 💖\n\n📅 *Date:* ${date || 'N/A'}\n⏰ *Time:* ${time || 'N/A'}\n💌 *Message:* ${message || 'No message left'}`;

        const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: formattedText,
                parse_mode: 'Markdown'
            })
        });

        const data = await response.json();
        return res.status(200).json({ success: true, telegram: data });
    } catch (error) {
        console.error('Error sending Telegram notification:', error);
        return res.status(500).json({ error: error.message });
    }
}
