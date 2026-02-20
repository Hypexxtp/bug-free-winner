export default async function handler(req, res) {
  try {
    const response = await fetch(
      "https://api.pixdomilhao.com.br/v1/site/blocks?type=BANNER,COUNTDOWN,MARQUEE,POPUP,STORY,STORY_GROUP"
    );

    const data = await response.json();

    const targetId = "101061537879478272";

    const bloco = data.find(item => String(item.id) === targetId);

    if (!bloco) {
      return res.status(404).json({
        success: false,
        message: "ID não encontrado"
      });
    }

    const date = bloco?.dataBlock?.date;

    if (!date) {
      return res.status(404).json({
        success: false,
        message: "Data não encontrada no bloco"
      });
    }

    return res.status(200).json({
      success: true,
      date
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
