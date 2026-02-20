export default async function handler(req, res) {
  try {
    const response = await fetch(
      "https://api.pixdomilhao.com.br/v1/site/blocks?type=BANNER,COUNTDOWN,MARQUEE,POPUP,STORY,STORY_GROUP"
    );

    const data = await response.json();

    if (!Array.isArray(data)) {
      return res.status(500).json({
        success: false,
        message: "Formato inesperado da API externa"
      });
    }

    // Filtra os STORIES que contenham o título desejado
    const videos = data
      .filter(item =>
        item.type === "STORY" &&
        item.title &&
        item.title.startsWith("Raspou. Achou. É pix!")
      )
      .map(item => {
        const videoUrl = item?.data?.video?.url || null;

        let embedUrl = null;

        if (videoUrl && videoUrl.includes("youtube.com")) {
          // Extrai ID do YouTube (Shorts ou normal)
          const match = videoUrl.match(/(?:shorts\/|v=)([^?&]+)/);
          if (match && match[1]) {
            embedUrl = `https://www.youtube.com/embed/${match[1]}`;
          }
        }

        return {
          id: item.id,
          title: item.title,
          shortTitle: item?.data?.title || null,
          badge: item?.data?.badge?.text || null,
          publishAt: item.publishAt,
          originalVideoUrl: videoUrl,
          embedUrl: embedUrl
        };
      });

    return res.status(200).json({
      success: true,
      total: videos.length,
      videos
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
