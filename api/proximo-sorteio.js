export default async function handler(req, res) {
  try {
    const response = await fetch(
      "https://api.pixdomilhao.com.br/v1/site/blocks?type=BANNER,COUNTDOWN,MARQUEE,POPUP,STORY,STORY_GROUP"
    );

    const data = await response.json();

    const targetId = "101061537879478272";

    // Aqui ele procura direto no array principal
    const bloco = Array.isArray(data)
      ? data.find(item => String(item.id) === targetId)
      : null;

    if (!bloco) {
      return res.status(404).json({
        success: false,
        message: "ID não encontrado"
      });
    }

    // date está direto no objeto
    const date = bloco.date;

    if (!date) {
      return res.status(404).json({
        success: false,
        message: "Date não encontrada"
      });
    }

    return res.status(200).json({
      success: true,
      id: bloco.id,
      date: date,
      textBefore: bloco.textBefore,
      type: bloco.type
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
