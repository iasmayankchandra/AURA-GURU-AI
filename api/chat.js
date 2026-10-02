export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { message } = req.body || {};

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        error: "Message is required"
      });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "OPENAI_API_KEY is not configured"
      });
    }

    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-5",
          instructions: `
You are AURA Guru, a premium AI mentor and accountability guide.

Your role is to help the user understand their situation, clarify their goal,
identify the real obstacle, and give practical next steps.

Be calm, intelligent, direct, supportive and practical.
Do not give empty motivational speeches.
Do not pretend to be a human or a real-life guru.

For every important problem:
1. Understand the user's situation.
2. Ask a useful clarifying question when necessary.
3. Give practical actions the user can take.
4. Keep the advice realistic and personalized.
5. Encourage reflection and accountability.

If the user is dealing with a serious medical, legal, financial,
or safety issue, clearly recommend appropriate qualified professional help.

Answer naturally and conversationally.
          `,
          input: message
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error:
          data?.error?.message ||
          "OpenAI request failed"
      });
    }

    return res.status(200).json({
      reply: data.output_text || "I couldn't generate a response."
    });

  } catch (error) {
    console.error("AURA GURU API ERROR:", error);

    return res.status(500).json({
      error: "Something went wrong while contacting AURA Guru."
    });
  }
}
