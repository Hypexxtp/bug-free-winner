export default async function handler(req, res) {
  try {
    const response = await fetch(
      "https://api.pixdomilhao.com.br/v1/site/blocks?type=BANNER,COUNTDOWN,MARQUEE,POPUP,STORY,STORY_GROUP",
      {
        method: "GET",
        headers: {
          "accept": "application/json",
          "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36",
        },
      }
    );

    const data = await response.json();

    if (!Array.isArray(data)) {
      return res.status(500).json({
        success: false,
        message: "Formato inesperado da API externa"
      });
    }

    const videos = data
      .filter(item =>
        item.type === "STORY" &&
        item.title &&
        item.title.startsWith("Raspou. Achou. É pix!")
      )
      .map(item => {

        const videoUrl = item?.data?.video?.url || null;
        let embedUrl = null;
        let thumbnail = null;

        if (videoUrl && videoUrl.includes("youtube.com")) {

          const match = videoUrl.match(/(?:shorts\/|v=)([^?&]+)/);

          if (match && match[1]) {
            const videoId = match[1];

            // 🔥 Embed usando youtube-nocookie
            embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?playsinline=1&rel=0&modestbranding=1`;

            thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
          }
        }

        return {
          id: item.id,
          title: item.title,
          shortTitle: item?.data?.title || null,
          badge: item?.data?.badge?.text || null,
          publishAt: item.publishAt,
          embedUrl,
          thumbnail
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
