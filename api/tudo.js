export default async function handler(req, res) {
  try {
    const pageParam = req.query.page || 1;

    let pagesToFetch = [];

    // 🔥 Se for page=all → pega 1 até 10
    if (pageParam === "all") {
      pagesToFetch = Array.from({ length: 10 }, (_, i) => i + 1);
    } else {
      pagesToFetch = [Number(pageParam)];
    }

    // 🔥 Busca todas as páginas ao mesmo tempo
    const responses = await Promise.all(
      pagesToFetch.map(page =>
        fetch(
          `https://api.pixdomilhao.com.br/v1/raffle/recent/results?page=${page}`,
          {
            method: "GET",
            headers: {
              "accept": "application/json",
              "user-agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36",
            },
          }
        ).then(res => res.json())
      )
    );

    // 🔥 Junta tudo em um array só
    const merged = responses.flat().filter(item => item?.raffle);

    // 🔥 Ordena por mais recente
    merged.sort((a, b) => {
      const dateA = new Date(a?.raffle?.drawDate || 0);
      const dateB = new Date(b?.raffle?.drawDate || 0);
      return dateB - dateA;
    });

    const results = merged.map(item => {
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
      page: pageParam,
      pagesFetched: pagesToFetch,
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
