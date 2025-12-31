const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const SYSTEM_PROMPT = `
You are the intelligent shopping assistant for ShopKart, a premium e-commerce platform.
Your goal is to help users find products, answer questions, and assist with orders in a polite, Apple-style concierge tone.
Keep your answers concise, helpful, and professional.

You have access to the following TOOLS (actions):
1. navigate(path): Go to a specific page (e.g., '/cart', '/orders', '/help').
2. addToCart(productName): Add a specific product to the cart.
3. applyCoupon(code): Apply a discount coupon.
4. trackOrder(orderId): Check status of an order.

When a user asks to perform an action, respond with a JSON object in this format ONLY:
{ "action": "actionName", "params": { ... } }

Specific Handling for Common Questions:
- "Where is my order?": Ask for the order ID or offer to navigate to the Orders page actions: { "action": "navigate", "params": { "path": "/orders" } }
- "Refund status?": Explain that refunds take 3-5 business days and offer to check detailed status on the Orders page.
- "How to return?": Explain the 7-day return policy and guide them to the Orders page to initiate a return.
- "Available coupons?": List the coupons from the provided context or offer to apply one if the user agrees.

If no action is needed, just provide a helpful text response.
`;

// Fallback logic for when OpenAI is down or out of credits
const getFallbackResponse = (lastMessage, context) => {
    const msg = lastMessage.toLowerCase();

    // 1. Navigation / Orders
    if (msg.includes('order') || msg.includes('track') || msg.includes('status')) {
        return JSON.stringify({
            action: "navigate",
            params: { path: "/orders" },
            // We can also return text if the frontend supports mixed, but our frontend expects JSON for actions
        });
    }

    // 2. Returns
    if (msg.includes('return') || msg.includes('refund')) {
        return JSON.stringify({
            action: "navigate",
            params: { path: "/orders" }
        }); // Usually returns start from order history
    }

    // 3. Coupons
    if (msg.includes('coupon') || msg.includes('offer') || msg.includes('discount')) {
        const available = context.availableCoupons ? context.availableCoupons.join(', ') : 'SAVE10';
        return `We have some great coupons available! You can use: ${available}. Would you like me to apply one?`;
    }

    // 4. Cart
    if (msg.includes('cart') || msg.includes('checkout')) {
        return JSON.stringify({
            action: "navigate",
            params: { path: "/cart" }
        });
    }

    // 5. Help / Contact
    if (msg.includes('help') || msg.includes('support') || msg.includes('contact')) {
        return JSON.stringify({
            action: "navigate",
            params: { path: "/help" }
        });
    }

    // Default Conversational Fallback
    if (msg.includes('hi') || msg.includes('hello') || msg.includes('hey')) {
        return "Hello! I'm capable of helping you check orders, apply coupons, or find products. How can I assist you today?";
    }

    return "I'm currently in 'Offline Mode' due to high traffic, but I can still help you navigate ShopKart! Try asking about your orders, coupons, or cart.";
};

exports.handleChat = async (req, res) => {
    try {
        const { messages, context } = req.body;
        const lastUserMessage = messages[messages.length - 1].content;

        // Construct the conversation with context
        const conversation = [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "system", content: `Current User Context: ${JSON.stringify(context)}` },
            ...messages
        ];

        let reply;

        try {
            const completion = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: conversation,
                modalities: ["text"],
            });
            reply = completion.choices[0].message.content;
        } catch (apiError) {
            console.warn("OpenAI API Failed (using fallback):", apiError.message);
            // Engage Fallback Logic
            reply = getFallbackResponse(lastUserMessage, context);
        }

        // simple parsing to check if it's a JSON action
        try {
            // Check for JSON block even if mixed with text (basic extraction)
            const jsonMatch = reply.match(/\{[\s\S]*\}/);
            // Also check if the reply is PURE JSON string from our fallback
            if (reply.trim().startsWith('{')) {
                const actionData = JSON.parse(reply);
                return res.json(actionData);
            }

            if (jsonMatch) {
                const actionData = JSON.parse(jsonMatch[0]);
                if (actionData.action) {
                    return res.json(actionData);
                }
            }
        } catch (e) {
            // Not a JSON action
        }

        res.json({ text: reply });

    } catch (error) {
        console.error('Chat AI Error Details:', error);
        res.status(500).json({ text: "I'm having trouble connecting right now. Please try again later." });
    }
};
