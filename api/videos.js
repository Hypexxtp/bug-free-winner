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

    const stories = data.filter(item =>
      item.type === "STORY" &&
      item.title &&
      item.title.startsWith("Raspou. Achou. É pix!") &&
      item?.data?.video?.url
    );

    const videos = await Promise.all(
      stories.map(async (item) => {
        const originalUrl = item.data.video.url;

        // Extrair ID
        const match = originalUrl.match(/(?:shorts\/|v=)([^?&]+)/);
        if (!match || !match[1]) return null;

        const videoId = match[1];

        const youtubeUrl = `https://youtu.be/${videoId}`;

        // 🔥 Chama oEmbed oficial do YouTube
        const oembedResponse = await fetch(
          `https://www.youtube.com/oembed?url=${encodeURIComponent(
            youtubeUrl
          )}&format=json`
        );

        if (!oembedResponse.ok) {
          return {
            id: item.id,
            error: "Vídeo não permite oEmbed"
          };
        }

        const oembedData = await oembedResponse.json();

        // 🔥 Iframe gerado automaticamente
        const iframe = `
<iframe
  width="315"
  height="560"
  src="https://www.youtube-nocookie.com/embed/${videoId}?playsinline=1&rel=0&modestbranding=1"
  title="${oembedData.title}"
  frameborder="0"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
  referrerpolicy="strict-origin-when-cross-origin"
  allowfullscreen>
</iframe>`;

        return {
          id: item.id,
          storyTitle: item.title,
          youtubeUrl,
          videoId,
          title: oembedData.title,
          author: oembedData.author_name,
          thumbnail: oembedData.thumbnail_url,
          iframe
        };
      })
    );

    return res.status(200).json({
      success: true,
      total: videos.filter(Boolean).length,
      videos: videos.filter(Boolean)
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
