const express = require("express");
const axios = require("axios");
const Order = require("../Modals/Order");

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const { messages } = req.body;

        let chatHistory = messages || [];
        if (!messages && req.body.message) {
            chatHistory = [{ role: "user", content: req.body.message }];
        }

        const lastMessage = chatHistory[chatHistory.length - 1]?.content || "";
        const orderMatch = lastMessage.match(/(?:order|id|#).*?([a-fA-F0-9]{8}|[a-fA-F0-9]{24})\b/i);
        let injectedContext = ""; // stores hidden instructions for AI.
        if (orderMatch) {
            const orderIdSuffix = orderMatch[1];
            try {
                let order;
                if (orderIdSuffix.length === 24) {
                    order = await Order.findById(orderIdSuffix).populate('items.product');
                } else {
                    // Match partial IDs(8char)
                    const orders = await Order.find({}).populate('items.product');
                    order = orders.find(o => o._id.toString().toUpperCase().endsWith(orderIdSuffix.toUpperCase()));
                }

                if (order) {
                    const itemNames = order.items.map(i => i.product?.name || 'Unknown Product').join(', ');
                    injectedContext = `\n\n[CRITICAL SYSTEM CONTEXT: The user is inquiring about order ID ${order._id}. You MUST tell them the following real-time data from the database: The order status is "${order.orderStatus}". Total amount is $${order.totalAmount}. Payment status is ${order.paymentStatus}. Items included: ${itemNames}. Do NOT tell them to check it themselves. Give them this exact information.]`;
                } else {
                    injectedContext = `\n\n[CRITICAL SYSTEM CONTEXT: The user is inquiring about order ID ${orderIdSuffix}, but this order DOES NOT EXIST in the database. You MUST tell them that you could not find their order and ask them to verify the ID. Do NOT give them generic instructions to check it themselves.]`;
                }
            } catch (err) {
                console.error("Error fetching order for AI:", err);
            }
        }

        const systemPrompt = {
            role: "system",
            content: `You are a helpful and polite customer support AI for an exclusive luxury ecommerce fashion brand called "Rivora". 
Your job is to assist users with their shopping experience, order tracking, and general queries about the website. 
Here is important information about Rivora:
- Shipping: We offer free standard shipping on orders over $50. Standard shipping takes 3-5 business days.
- Returns & Refunds: We have a 14-day return policy. Items must be unused and in original packaging. Refunds are instantly credited to the user's Rivora Wallet.
- Payment Methods: We accept major Credit/Debit Cards, Razorpay, Rivora Wallet, and Cash on Delivery (COD).
- Order Cancellation: Orders can only be cancelled within 48 hours of placement if they haven't shipped.
- Contact: For escalated issues, users can reach out via the Contact Us page.
Keep your answers concise, friendly, and strictly related to Rivora ecommerce. Do not answer questions outside the scope of shopping, fashion, and order management.` + injectedContext
        };

        const response = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                model: "openrouter/free",
                messages: [systemPrompt, ...chatHistory],
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );

        res.json({
            reply: response.data.choices[0].message.content,
        });
    } catch (error) {
        console.log(
            error.response?.data || error.message
        );

        res.status(500).json({
            error: "AI request failed",
        });
    }
});

module.exports = router;