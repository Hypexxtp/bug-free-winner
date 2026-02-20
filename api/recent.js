export default async function handler(req, res) {
  try {
    // 🔥 Pega página da query (?page=2)
    const page = req.query.page ? Number(req.query.page) : 1;

    const response = await fetch(
      `https://api.pixdomilhao.com.br/v1/raffle/recent/results?page=${page}`,
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

    // 🔥 Ordena por mais recente (drawDate DESC)
    const sorted = data.sort((a, b) => {
      const dateA = new Date(a?.raffle?.drawDate || 0);
      const dateB = new Date(b?.raffle?.drawDate || 0);
      return dateB - dateA;
    });

    const results = sorted.map(item => {

      const videoUrl = item?.winner?.video?.url || null;

      let videoId = null;
      let thumbnail = null;

      if (videoUrl && videoUrl.includes("youtube.com")) {
        const match = videoUrl.match(/(?:shorts\/|v=)([^?&]+)/);
        if (match && match[1]) {
          videoId = match[1];
          thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        }
      }

      return {
        raffleUuid: item?.raffle?.uuid || null,
        raffleTitle: item?.raffle?.title || null,
        drawDate: item?.raffle?.drawDate || null,
        prize: item?.prize?.title || null,

        winner: {
          name: item?.winner?.name || null,
          number: item?.winner?.number || null,
          city: item?.winner?.city || null,
          state: item?.winner?.state || null,
          photo: item?.winner?.photoUrl || null,
        },

        youtubeUrl: videoUrl,
        thumbnail
      };
    });

    return res.status(200).json({
      success: true,
      page,
      total: results.length,
      results
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
