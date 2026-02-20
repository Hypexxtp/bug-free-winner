export default async function handler(req, res) {
  try {
    const response = await fetch(
      "https://api.pixdomilhao.com.br/v1/site/blocks?type=BANNER,COUNTDOWN,MARQUEE,POPUP,STORY,STORY_GROUP"
    );

    const data = await response.json();

    let foundDate = null;

    for (const item of data) {
      if (item?.dataBlock?.textBefore === "PRÓXIMO SORTEIO EM:") {
        foundDate = item.dataBlock.date;
        break;
      }
    }

    if (!foundDate) {
      return res.status(404).json({
        success: false,
        message: "Data não encontrada"
      });
    }

    return res.status(200).json({
      success: true,
      date: foundDate
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
