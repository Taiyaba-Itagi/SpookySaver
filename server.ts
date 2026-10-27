import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());

// Initialize GoogleGenAI
const getAIClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.startsWith('MY_')) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Resilient timeout wrapper for Gemini calls
async function callGeminiWithTimeout<T>(promise: Promise<T>, timeoutMs = 4000): Promise<T> {
  let timer: any;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('Gemini timeout')), timeoutMs);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timer);
  }
}

// --- API Endpoints ---

// 1. Analyze user spending and generate tailored Halloween savings quest
app.post('/api/mentor/analyze', async (req, res) => {
  try {
    const { budget, period, totalSpent, expenses, goals, currency = '₹' } = req.body;

    const remaining = Math.max(0, budget - totalSpent);
    const percentUsed = budget > 0 ? Math.round((totalSpent / budget) * 100) : 0;

    const topExpenses = (expenses || [])
      .slice(0, 10)
      .map((e: any) => `${e.title}: ${currency}${e.amount} (${e.category}, ${e.type || 'want'})`)
      .join(', ');

    const activeGoals = (goals || [])
      .map((g: any) => `${g.title} (Target: ${currency}${g.targetAmount}, Saved: ${currency}${g.currentAmount})`)
      .join('; ');

    const prompt = `You are "Professor Jack O'Lantern", the witty, wise, and slightly spooky financial ghost mentor of SpookySaver.
A user has provided their current financial ledger:
- Budget: ${currency}${budget} (${period || 'monthly'})
- Total Spent: ${currency}${totalSpent} (${percentUsed}% of budget consumed)
- Remaining Safe Allowance: ${currency}${remaining}
- Recent Expenses: ${topExpenses || 'No expenses logged yet.'}
- Savings Goals: ${activeGoals || 'No goals specified yet.'}

Analyze their spending with a playful Halloween flair (ghosts, pumpkins, witches' brews, cobweb-cleaning). 
Provide:
1. "diagnosis": A 2-3 sentence humorous yet sharply insightful diagnosis of their current budget health and spending traps.
2. "dangerLevel": A single word status: "Peaceful Graveyard" (safe, <50%), "Creaking Floorboards" (moderate, 50-75%), "Witching Hour" (warning, 75-90%), or "Full Moon Nightmare" (critical, >90%).
3. "missions": Exactly 3 practical, concrete Halloween-themed money-saving challenges they can do this week to save money towards their goals. Each mission must have:
   - "title" (string, fun Halloween pun)
   - "action" (string, 1 clear action like brewing own coffee, avoiding late-night delivery, cooking a cauldron batch meal)
   - "potentialSavings" (string e.g. "${currency}300")
   - "pumpkinPoints" (number e.g. 50, 75, 100)
4. "spookyRoast": A 1-sentence friendly, playful Halloween roast of their most unnecessary impulse or splurge spending.
5. "encouragement": A motivating closing phrase to inspire them to grow their virtual pumpkin treasure.

Respond strictly in valid JSON format matching this schema:
{
  "diagnosis": "string",
  "dangerLevel": "string",
  "spookyRoast": "string",
  "encouragement": "string",
  "missions": [
    { "title": "string", "action": "string", "potentialSavings": "string", "pumpkinPoints": 50 }
  ]
}`;

    const ai = getAIClient();
    if (ai) {
      try {
        const response = await callGeminiWithTimeout(
          ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
              temperature: 0.7,
            },
          }),
          3000
        );

        const text = response.text?.trim() || '{}';
        const parsed = JSON.parse(text);
        return res.json({ success: true, data: parsed, poweredBy: 'gemini-3.8-flash' });
      } catch (geminiErr) {
        console.warn('Gemini analyze fallback used:', geminiErr);
      }
    }

    // Dynamic smart fallback if API key is not yet set or timed out
    return res.json({
      success: true,
      data: {
        diagnosis: `You've summoned ${percentUsed}% of your ${currency}${budget} budget from the vault. ${percentUsed > 80 ? 'Beware the phantom drain!' : 'Your financial ghost guards are keeping the ghouls at bay.'}`,
        dangerLevel: percentUsed > 90 ? 'Full Moon Nightmare' : percentUsed > 75 ? 'Witching Hour' : percentUsed > 50 ? 'Creaking Floorboards' : 'Peaceful Graveyard',
        spookyRoast: percentUsed > 60 ? "Those midnight treat deliveries are vanishing into thin air like wandering spirits!" : "Even the tight-fisted phantoms are impressed by your budget restraint.",
        encouragement: "Keep guarding your pumpkin treasure chest—every coin saved feeds the golden harvest!",
        missions: [
          {
            title: "Cauldron Batch Brew",
            action: "Cook 2 hearty meals at home instead of ordering takeout phantoms.",
            potentialSavings: `${currency}350`,
            pumpkinPoints: 75
          },
          {
            title: "Ghosting the Impulse Buy",
            action: "Apply the 24-Hour Haunt Rule: wait 1 full day before buying any non-essential item.",
            potentialSavings: `${currency}500`,
            pumpkinPoints: 100
          },
          {
            title: "Banish Blood-Sucking Subs",
            action: "Audit recurring subscriptions and cancel at least one dormant service.",
            potentialSavings: `${currency}200`,
            pumpkinPoints: 60
          }
        ]
      },
      poweredBy: 'spooky-advisor-offline'
    });
  } catch (error: any) {
    console.error('Mentor analysis error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to summon financial spirits'
    });
  }
});

// 2. Chat with the Spooky Financial Mentor
app.post('/api/mentor/chat', async (req, res) => {
  try {
    const { message, history = [], userContext = {} } = req.body;
    const { budget = 1000, totalSpent = 420, currency = '₹', goals = [] } = userContext;

    const systemInstruction = `You are "Professor Jack O'Lantern", an ancient, wise, charmingly spooky financial mentor in SpookySaver.
Your role: help students and young adults make smart money choices, curb scary impulse buys, and hit their savings targets.
Tone: Warm, witty, slightly gothic/Halloween-flavored (metaphors of potions, pumpkin patches, crypts of debt, phantom splurges, treat jars), but genuinely practical and financially sharp.
Context:
- User's Current Budget: ${currency}${budget}
- Current Spent: ${currency}${totalSpent} (${budget > 0 ? Math.round((totalSpent/budget)*100) : 0}% used)
- Savings Goals: ${goals.map((g: any) => `${g.title}: ${currency}${g.currentAmount}/${currency}${g.targetAmount}`).join(', ') || 'General pumpkin treasure'}

Keep responses concise (2-4 paragraphs max), readable with bullet points when listing ideas, and always end with a mini-action or spooky cheer.`;

    const ai = getAIClient();
    if (ai) {
      try {
        const formattedContents: any[] = [];
        for (const item of history.slice(-6)) {
          formattedContents.push({
            role: item.role === 'user' ? 'user' : 'model',
            parts: [{ text: item.content }],
          });
        }
        formattedContents.push({
          role: 'user',
          parts: [{ text: message }],
        });

        const response = await callGeminiWithTimeout(
          ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: formattedContents,
            config: {
              systemInstruction,
              temperature: 0.7,
            },
          }),
          3000
        );

        return res.json({
          success: true,
          reply: response.text || "The crystal ball is misty... remember, a coin saved today keeps the financial ghouls away!",
        });
      } catch (e) {
        console.warn('Gemini chat fallback used:', e);
      }
    }

    // Smart fallback answer
    return res.json({
      success: true,
      reply: `🎃 *Spooky Wisdom:* To conquer that dilemma with your ${currency}${budget} budget, remember the **Witching Hour 24-Hour Rule**! Before spending ${currency} on anything that isn't essential food or shelter, let it haunt your wishlist for one day. If you still need it tomorrow, allocate it safely without raiding your savings cauldron!`,
    });
  } catch (error: any) {
    console.error('Mentor chat error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Quick Impulse Spender Check: "Should I buy this?"
app.post('/api/mentor/impulse-check', async (req, res) => {
  try {
    const { itemName, cost, reason, currency = '₹', budget = 1000, totalSpent = 450 } = req.body;

    const prompt = `A user is tempted by an impulse purchase:
Item: "${itemName}"
Cost: ${currency}${cost}
Reason: "${reason || 'Just felt like it'}"
Current Budget: ${currency}${budget}
Already Spent: ${currency}${totalSpent}
Remaining Budget: ${currency}${Math.max(0, budget - totalSpent)}

You are Professor Jack O'Lantern from SpookySaver. Evaluate whether this is a "Spooky Trap" (bad impulse buy) or a "Worthy Treat" (justified / budgeted purchase).
Provide:
1. "verdict": "Spooky Trap" or "Worthy Treat" or "Haunted Dilemma"
2. "score": number from 1 to 10 (1 = terrifying waste, 10 = absolute necessity)
3. "analysis": 2-3 sentences explaining the impact on their wallet and savings timeline.
4. "alternative": A smart, fun money-saving alternative action or compromise.
5. "savingsEquivalent": What else this amount could unlock in their savings goal (e.g., "5 days of college textbooks" or "10% of your new laptop").

Return strictly JSON:
{
  "verdict": "string",
  "score": 5,
  "analysis": "string",
  "alternative": "string",
  "savingsEquivalent": "string"
}`;

    const ai = getAIClient();
    if (ai) {
      try {
        const response = await callGeminiWithTimeout(
          ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
              temperature: 0.7,
            },
          }),
          3000
        );
        const parsed = JSON.parse(response.text?.trim() || '{}');
        return res.json({ success: true, data: parsed });
      } catch (e) {
        console.warn('Gemini impulse fallback used:', e);
      }
    }

    // Fallback response
    const percentOfBudget = budget > 0 ? Math.round((cost / budget) * 100) : 10;
    const isTrap = cost > 300 || percentOfBudget > 20;

    return res.json({
      success: true,
      data: {
        verdict: isTrap ? 'Spooky Trap' : 'Worthy Treat',
        score: isTrap ? 3 : 7,
        analysis: isTrap 
          ? `Spending ${currency}${cost} swallows ${percentOfBudget}% of your entire budget in one single bite! That leaves your savings pumpkin starving.`
          : `At ${currency}${cost}, this treat fits comfortably if you offset it with a small cutback elsewhere this week.`,
        alternative: isTrap ? `Wait 48 hours. If the craving still lingers, look for a second-hand version or split the cost with a friend.` : `Enjoy mindfully, but log it immediately to keep your pumpkin ledger balanced.`,
        savingsEquivalent: `That's equivalent to ${(cost / 20).toFixed(0)} cups of home-brewed potion or a solid boost to your goal!`
      }
    });
  } catch (error: any) {
    console.error('Impulse check error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. 'Trick or Treat' Spending Game Endpoint
app.post('/api/mentor/trick-or-treat', async (req, res) => {
  try {
    const { itemName, cost, decision, currency = '₹', currentStreak = 0 } = req.body;

    const isTrick = decision === 'trick';
    const bonusPoints = isTrick ? Math.max(50, Math.min(250, Math.round(cost * 0.5))) : 10;

    const prompt = `You are Professor Jack O'Lantern, the wise Halloween financial mentor in SpookySaver.
A user was tempted to buy "${itemName}" for ${currency}${cost}.
Their decision in the "Trick or Treat" spending game:
Decision: ${isTrick ? "TRICK (They skipped the purchase to save money!)" : "TREAT (They decided to indulge mindfully with their budget allowance)"}
Current Impulse Trick Streak: ${currentStreak + (isTrick ? 1 : 0)}

Give a short (1-2 sentences), spirited Halloween response:
- If TRICK: Celebrate their iron will, praise their smart move, and mention how their virtual pumpkin treasure is glowing brighter!
- If TREAT: Give a warm, mindful green light, but suggest 1 quick zero-guilt way to balance it (like skipping one fancy drink this week).

Respond in JSON format:
{
  "remark": "string",
  "bonusPoints": ${bonusPoints},
  "treatAnimation": "${isTrick ? 'candy-burst' : 'gentle-sparkle'}"
}`;

    const ai = getAIClient();
    if (ai) {
      try {
        const response = await callGeminiWithTimeout(
          ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
              temperature: 0.7,
            },
          }),
          3000
        );
        const parsed = JSON.parse(response.text?.trim() || '{}');
        return res.json({
          success: true,
          data: {
            remark: parsed.remark || (isTrick ? `🎃 Ha! You tricked the impulse ghost and saved ${currency}${cost}!` : `Enjoy your treat! Just balance it with home potions this week.`),
            bonusPoints: parsed.bonusPoints || bonusPoints,
            treatAnimation: isTrick ? 'candy-burst' : 'gentle-sparkle',
          },
        });
      } catch (e) {
        console.warn('Gemini trick-or-treat fallback used:', e);
      }
    }

    // Dynamic smart fallback
    const fallbackRemark = isTrick
      ? `🎃 Masterful trick! You cast banishment on the ${currency}${cost} impulse phantom! Your pumpkin stash swells with pride.`
      : `🍬 Mindful treat approved! Enjoy your ${itemName}, but brew your own potions tomorrow to keep the vault guarded.`;

    return res.json({
      success: true,
      data: {
        remark: fallbackRemark,
        bonusPoints,
        treatAnimation: isTrick ? 'candy-burst' : 'gentle-sparkle',
      },
    });
  } catch (error: any) {
    console.error('Trick or treat error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Vite middleware or static serving
async function setupServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`🎃 SpookySaver server running on port ${PORT}`);
  });
}

setupServer();
