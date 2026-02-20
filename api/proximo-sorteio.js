export default async function handler(req, res) {
  try {
    const response = await fetch(
      "https://api.pixdomilhao.com.br/v1/site/blocks?type=BANNER,COUNTDOWN,MARQUEE,POPUP,STORY,STORY_GROUP",
      {
        method: "GET",
        headers: {
          "accept": "application/json, text/plain, */*",
          "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36",
        },
      }
    );

    const rawText = await response.text();

    let json;
    try {
      json = JSON.parse(rawText);
    } catch {
      json = rawText;
    }

    // Se a API externa retornar erro, repassa exatamente
    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        externalStatus: response.status,
        headers: {
          "x-treated-error": response.headers.get("x-treated-error"),
          "x-lm-treated-error": response.headers.get("x-lm-treated-error"),
          "x-lm-security-error": response.headers.get("x-lm-security-error"),
        },
        body: json,
      });
    }

    // Buscar apenas o ID específico
    const targetId = "101061537879478272";

    const bloco = Array.isArray(json)
      ? json.find(item => String(item.id) === targetId)
      : null;

    if (!bloco) {
      return res.status(404).json({
        success: false,
        message: "ID não encontrado na resposta da API",
        externalStatus: response.status,
      });
    }

    const date = bloco?.dataBlock?.date;

    if (!date) {
      return res.status(404).json({
        success: false,
        message: "Date não encontrada dentro do bloco",
      });
    }

    return res.status(200).json({
      success: true,
      date,
      externalStatus: response.status,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Erro interno na Vercel",
      error: error.message,
    });
  }
}
