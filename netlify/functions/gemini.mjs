export default async (req) => {
  if (req.method !== "POST") {
    return Response.json(
      { error: "Method not allowed" },
      { status: 405 }
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return Response.json(
      { error: "GEMINI_API_KEY belum diset di Netlify." },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();

    const parts = [
      { text: body.prompt }
    ];

    if (body.image?.data) {
      parts.push({
        inlineData: {
          mimeType: body.image.mimeType,
          data: body.image.data
        }
      });
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
  return Response.json(
    {
      error: data?.error?.message || "Gemini API request failed",
      status: response.status,
      details: data
    },
    { status: response.status }
  );
    }

    const text = data?.candidates?.[0]?.content?.parts
      ?.map(part => part.text || "")
      .join("")
      .trim();

    if (!text) {
      return Response.json(
        { error: "Gemini tidak mengembalikan teks." },
        { status: 502 }
      );
    }

    return Response.json({ text });

  } catch (error) {
    return Response.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
};
