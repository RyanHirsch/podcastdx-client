interface PodcastBase {
  /** The internal podcastindex.org feed id. */
  id: number;
  /** The feed title. */
  title: string;
  /** The current feed url. */
  url: string;
  /** The itunes id of this feed if there is one, and we know what it is. */
  itunesId: number;
  /** The channel-level language specification of the feed. Languages accord with the RSS language spec. */
  language: string;
  /** This is a record of categoryId: categoryName */
  categories: Record<string, string>;
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace ApiResponse {
  export enum Status {
    Success = "true",
  }

  export interface NewPodcastFeed extends PodcastBase {
    /** [Unix Epoch] Timestamp */
    newestItemPublishTime: number;
  }

  export interface PodcastFeed {
    /** The url of the feed, before it changed to it’s current url. */
    originalUrl: string;
    /** The channel level link in the feed. */
    link: string;
    /** The channel-level description. */
    description: string;
    /** The channel-level author element. Usually iTunes specific, but could be from another namespace if not present. */
    author: string;
    /** The channel-level owner:name element. Usually iTunes specific, but could be from another namespace if not present. */
    ownerName: string;
    /** The channel-level image element. */
    image: string;
    /** The seemingly best artwork we can find for the feed. Might be the same as ‘image’ in most instances. */
    artwork: string;
    /** [Unix Epoch] The channel-level pubDate for the feed, if it’s sane. If not, this is a heuristic valu, arrived at by analyzing other parts of the feed, like item-level pubDates. */
    lastUpdateTime: number;
    /** [Unix Epoch] The last time we attempted to pull this feed from it’s url. */
    lastCrawlTime: number;
    /** [Unix Epoch] The last time we tried to parse the downloaded feed content. */
    lastParseTime: number;
    /** [Unix Epoch] Timestamp of the last time we got a "good", meaning non-4xx/non-5xx, status code when pulling this feed from it’s url. */
    lastGoodHttpStatusTime: number;
    /** The last http status code we got when pulling this feed from it’s url. You will see some made up status codes sometimes. These are what we use to track state within the feed puller. These all start with 9xx. */
    lastHttpStatus: number;
    /** The Content-Type header from the last time we pulled this feed from it’s url. */
    contentType: string;
    /** The channel-level generator element if there is one. */
    generator: string;
    /** 0 = RSS, 1 = ATOM */
    type: PodcastFeedType;
    /** At some point, we give up trying to process a feed and mark it as dead. This is usually after 1000 errors without a successful pull/parse cycle. Once the feed is marked dead, we only check it once per month. */
    dead: number;
    /** The number of errors we’ve encountered trying to pull a copy of the feed. Errors are things like a 500 or 404 resopnse, a server timeout, bad encoding, etc. */
    crawlErrors: number;
    /** The number of errors we’ve encountered trying to parse the feed content. Errors here are things like not well-formed xml, bad character encoding, etc. We fix many of these types of issues on the fly when parsing. We only increment the errors count when we can’t fix it. */
    parseErrors: number;
  }

  export interface SimplePodcastFeed {
    id: number;
    url: string;
    timeAdded: number;
    status: ApiResponse.Status;
  }

  export interface PodcastEpisode {
    id: number;
    title: string;
    link: string;
    description: string;
    guid: string;
    datePublished: number;
    datePublishedPretty: string;
    dateCrawled: number;
    enclosureUrl: string;
    enclosureType: string;
    enclosureLength: number;
    explicit: number;
    episode: number;
    episodeType: string;
    season: number;
    /** URL to episode image */
    image: string;
    feedItunesId: number;
    /** URL to feed image */
    feedImage: string;
    feedId: number;
    feedTitle: string;
    feedLanguage: string;
  }

  export interface Search {
    status: ApiResponse.Status;
    feeds: Array<ApiResponse.PodcastFeed>;
    count: number;
    description: string;
  }

  export interface RecentFeeds {
    currentTime: number;
    status: ApiResponse.Status;
    feeds: Array<ApiResponse.NewPodcastFeed>;
    count: number;
    max: number;
    description: string;
  }

  export interface RecentNewFeeds {
    status: ApiResponse.Status;
    feeds: Array<ApiResponse.SimplePodcastFeed>;
    count: number;
    max: number;
    description: string;
  }

  export interface RecentEpisodes {
    status: ApiResponse.Status;
    feeds: Array<ApiResponse.PodcastEpisode>;
    count: number;
    max: number;
    description: string;
  }

  export interface Podcast {
    status: ApiResponse.Status;
    feed: ApiResponse.PodcastFeed;
    description: string;
    query: {
      url?: string;
      id?: string;
    };
  }

  export interface Episodes {
    status: ApiResponse.Status;
    items: Array<ApiResponse.PodcastEpisode>;
    count: number;
    query: string;
    description: string;
  }

  export interface Episode {
    status: ApiResponse.Status;
    id: string;
    episode: ApiResponse.PodcastEpisode;
    description: string;
  }
}

export enum PodcastFeedType {
  RSS = 0,
  ATOM = 1,
}

/*
Latest Feeds
{
  status: 'true',
  feeds: [
    {
      id: 1131393,
      url: 'https://feeds.captivate.fm/the-piston-podcast/',
      timeAdded: 1600888893,
      status: 'confirmed'
    },
    {
      id: 1130644,
      url: 'https://feeds.captivate.fm/thesuccessascent/',
      timeAdded: 1600887830,
      status: 'confirmed'
    },
    ....
  ],
  count: 122,
  max: 1000,
  description: 'Feeds added in the last 24 hours.'
}
*/

/*
Latest episodes

{
  status: 'true',
  items: [
    {
      id: 365322499,
      title: '#87 - Minha experiência no intercâmbio na Irlanda',
      link: 'https://anchor.fm/edublincast/episodes/87---Minha-experincia-no-intercmbio-na-Irlanda-ek2pet',
      description: '<p>Participantes: Mah Marra, Tarcisio Junior, Gabriel Villela, Fabiano Carvalho e Carmyn Del Rosso.</p>\n' +
        '<p>Batemos um papo com os intercambistas Gabriel e Fabiano, que já estão há mais de dois anos na Irlanda, e a Carmyn, que chegou na Irlanda esse ano junto com a pandemia. Eles vieram pra cá com a IE Intercâmbio e contaram como tem sido a experiência de cada um deles no país.</p>\n' +
        '<p>Quer conversar com a IE e tirar mais dúvidas sobre intercâmbio? É só acessar www.ie.com.br</p>\n' +
        '<p>Se tiver comentários ou feedback...',
      guid: 'd1d34c1f-2a22-44a5-a5fa-f2b90590eb0f',
      datePublished: 1600890196,
      datePublishedPretty: 'September 23, 2020 2:43pm',
      dateCrawled: 1600890232,
      enclosureUrl: 'https://anchor.fm/s/1ab2e6c4/podcast/play/20063133/https%3A%2F%2Fd3ctxlq1ktw2nl.cloudfront.net%2Fstaging%2F2020-8-23%2F855e3250-212c-bb5d-0a90-47c1218d78af.mp3',
      enclosureType: 'audio/mpeg',
      enclosureLength: 41940848,
      explicit: 0,
      episode: 87,
      episodeType: 'full',
      season: 0,
      image: 'https://d3t3ozftmdmh3i.cloudfront.net/production/podcast_uploaded_episode/4379321/4379321-1600890203832-4565910d18875.jpg',
      feedItunesId: 1449962334,
      feedImage: 'https://d3t3ozftmdmh3i.cloudfront.net/staging/podcast_uploaded_nologo/4379321/40548e54a9bdae10.jpeg',
      feedId: 241097,
      feedTitle: 'E-Dublincast',
      feedLanguage: 'pt-br'
    },
    {
      id: 365009877,
      title: 'The Word For Day - Part 3 & The Young Earth Theory',
      link: 'http://www.sermonaudio.com/sermoninfo.asp?SID=92320183934405',
      description: '',
      guid: 'http://www.sermonaudio.com/sermoninfo.asp?SID=92320183934405',
      datePublished: 1600890180,
      datePublishedPretty: 'September 23, 2020 2:43pm',
      dateCrawled: 1600887427,
      enclosureUrl: 'https://mp3.sermonaudio.com/filearea/92320183934405/92320183934405.mp3',
      enclosureType: 'audio/mpeg',
      enclosureLength: 13568266,
      explicit: 0,
      episode: null,
      episodeType: null,
      season: 0,
      image: 'https://www.sermonaudio.com/images/sermonaudio-new-combo2-1400.jpg',
      feedItunesId: 1332505740,
      feedImage: 'https://www.sermonaudio.com/images/sermonaudio-new-combo2-1400.jpg',
      feedId: 1130343,
      feedTitle: 'SermonAudio: MP3',
      feedLanguage: 'en-us'
    },
    {
      id: 364844893,
      title: 'The Old Earth Theory & Critique - Part 3',
      link: 'http://www.sermonaudio.com/sermoninfo.asp?SID=923201831354589',
      description: '',
      guid: 'http://www.sermonaudio.com/sermoninfo.asp?SID=923201831354589',
      datePublished: 1600889700,
      datePublishedPretty: 'September 23, 2020 2:35pm',
      dateCrawled: 1600886220,
      enclosureUrl: 'https://mp3.sermonaudio.com/filearea/923201831354589/923201831354589.mp3',
      enclosureType: 'audio/mpeg',
      enclosureLength: 14154062,
      explicit: 0,
      episode: null,
      episodeType: null,
      season: 0,
      image: 'https://www.sermonaudio.com/images/sermonaudio-new-combo2-1400.jpg',
      feedItunesId: 1328380624,
      feedImage: 'https://www.sermonaudio.com/images/sermonaudio-new-combo2-1400.jpg',
      feedId: 1129399,
      feedTitle: 'SermonAudio: MP3',
      feedLanguage: 'en-us'
    },
    {
      id: 365304679,
      title: 'Episode 55: Early Birds and Night Owls',
      link: 'https://www.everydayamericanenglish.org/podcast/episode-55-early-birds-and-night-owls',
      description: "Improve your English listening comprehension and tell me whether you're an early bird or night owl!",
      guid: '5ec5669d5cd8874eb1227b4f:5ec56ee0a6524a5dc5e725a7:5f6ba15b14e57d606b848c84',
      datePublished: 1600889613,
      datePublishedPretty: 'September 23, 2020 2:33pm',
      dateCrawled: 1600890113,
      enclosureUrl: 'https://static1.squarespace.com/static/5ec5669d5cd8874eb1227b4f/t/5f6ba18539687436da75d75e/1600889240904/Episode+55+-+Early+Birds+and+Night+Owls.mp3',
      enclosureType: 'audio/mpeg',
      enclosureLength: 7900182,
      explicit: 0,
      episode: 54,
      episodeType: 'full',
      season: 1,
      image: 'https://images.squarespace-cdn.com/content/v1/5ec5669d5cd8874eb1227b4f/1600889309967-67ZWBKUR4SU6X48GTY8V/ke17ZwdGBToddI8pDm48kMM8z7kYYdSl9Rux1FI3bWF7gQa3H78H3Y0txjaiv_0fDoOvxcdMmMKkDsyUqMSsMWxHk725yiiHCCLfrh8O1z5QPOohDIaIeljMHgDF5CVlOqpeNLcJ80NK65_fV7S1UR138KQyk5OTCagkTvGhXxMsMkLvQtOW-bi6BNBjLogFZCkVnhDMoqWnIzF2cFonXg/IMG_6134.jpg?format=1500w',
      feedItunesId: 1514662398,
      feedImage: 'https://images.squarespace-cdn.com/content/5ec5669d5cd8874eb1227b4f/1590091088220-CZ6UYONVIA9K75IVS869/Afternoon+Doodles.png?content-type=image%2Fpng',
      feedId: 498964,
      feedTitle: 'Everyday American English',
      feedLanguage: 'en-US'
    },
    {
      id: 365308800,
      title: 'Mujeres, memoria y verdad.',
      link: 'https://anchor.fm/corporacionvamosmujer/episodes/Mujeres--memoria-y-verdad-ek18n7',
      description: '<p>En esta ocasión se genera un dialogo Entre Vecinas, sobre la construcción de verdad, justicia, reparación, no repetición y paz territorial, en el marco del posacuerdo, en medio del contexto actual del país de crisis en Derechos Humanos.</p>',
      guid: 'c579ef3a-8dcc-41c6-876b-af64d6d28bd7',
      datePublished: 1600889508,
      datePublishedPretty: 'September 23, 2020 2:31pm',
      dateCrawled: 1600890138,
      enclosureUrl: 'https://anchor.fm/s/1ce7b244/podcast/play/20013223/https%3A%2F%2Fd3ctxlq1ktw2nl.cloudfront.net%2Fstaging%2F2020-8-22%2F110685302-44100-2-0736b3444a852.m4a',
      enclosureType: 'audio/x-m4a',
      enclosureLength: 2678065,
      explicit: 0,
      episode: null,
      episodeType: 'full',
      season: 0,
      image: 'https://d3t3ozftmdmh3i.cloudfront.net/production/podcast_uploaded_episode/4749465/4749465-1600889516665-3b346b61a4b79.jpg',
      feedItunesId: 1508482404,
      feedImage: 'https://d3t3ozftmdmh3i.cloudfront.net/production/podcast_uploaded/4749465/4749465-1586878257720-f9c8d81343dfc.jpg',
      feedId: 1034642,
      feedTitle: 'Diálogo Entre Vecinas 🌺',
      feedLanguage: 'es'
    },
    {
      id: 365240055,
      title: 'The Tiberius Show EP 101 Dr. Diez',
      link: 'https://www.spreaker.com/user/thetiberiusshow/the-tiberius-show-ep-101-dr-diez',
      description: 'Dr. Diez talks with Tiberius about the art of chiropractic medicine.  They talk about playing the piano and review a book about mapping in Minecraft.  They talk about common levers in the human body and go over some Leadership skills.  If you want to learn about what a chiropractor does this is the episode for you.',
      guid: 'https://api.spreaker.com/episode/41003962',
      datePublished: 1600889416,
      datePublishedPretty: 'September 23, 2020 2:30pm',
      dateCrawled: 1600889449,
      enclosureUrl: 'https://api.spreaker.com/download/episode/41003962/the_tiberius_show_ep_101_dr_diez.mp3',
      enclosureType: 'audio/mpeg',
      enclosureLength: 35970104,
      explicit: 0,
      episode: null,
      episodeType: 'full',
      season: 0,
      image: 'https://d3wo5wojvuv7l.cloudfront.net/t_rss_itunes_square_1400/images.spreaker.com/original/76acf71770c91c0b5af780479e2cbbbd.jpg',
      feedItunesId: 1452964453,
      feedImage: 'https://d3wo5wojvuv7l.cloudfront.net/t_rss_itunes_square_1400/images.spreaker.com/original/c87ba628db230e493e22b8dbd6f03d55.jpg',
      feedId: 339789,
      feedTitle: 'The Tiberius Show',
      feedLanguage: 'en'
    },
    {
      id: 365280790,
      title: 'Ramó Morales se enoja por el intercambio de playeras y Andrés Vaca estuvo con nosotros',
      link: '',
      description: '<p>En El Tiradero platicamos con Andrés Vaca sobre la selección y los técnicos que penden de un hilo, además Ramón Morales se enoja por el cambio de camisetas entre jugadores de Chivas y América en el Clásico Nacional</p>',
      guid: 'gid://art19-episode-locator/V0/RFceFSsUcyB3RtyB1AKdGwmaEGm0FMolXu2jrpAfgE8',
      datePublished: 1600889400,
      datePublishedPretty: 'September 23, 2020 2:30pm',
      dateCrawled: 1600889846,
      enclosureUrl: 'https://rss.art19.com/episodes/8a0cbae8-1a3e-43d9-9472-3519dc3added.mp3',
      enclosureType: 'audio/mpeg',
      enclosureLength: 44075049,
      explicit: 0,
      episode: 538,
      episodeType: 'full',
      season: 0,
      image: 'https://content.production.cdn.art19.com/images/55/19/71/81/55197181-f178-492c-b17f-afb73b77d928/1853e5d2704a2f1351c111a6fd3ccbffaf0ebf226138de54b1180aa4dc0ce60fd01f8687ebb5847c69e26448e188ffe1cdc30739fc495ce2e0fd17d90b514580.jpeg',
      feedItunesId: 1342827284,
      feedImage: 'https://content.production.cdn.art19.com/images/55/19/71/81/55197181-f178-492c-b17f-afb73b77d928/1853e5d2704a2f1351c111a6fd3ccbffaf0ebf226138de54b1180aa4dc0ce60fd01f8687ebb5847c69e26448e188ffe1cdc30739fc495ce2e0fd17d90b514580.jpeg',
      feedId: 1132078,
      feedTitle: 'El Tiradero',
      feedLanguage: 'es'
    },
    {
      id: 365284613,
      title: 'Accelerating Transformation: Lessons in Business Resiliency',
      link: 'https://www.commonwealthclub.org/events/archive/podcast/accelerating-transformation-lessons-business-resiliency',
      description: '<p>SPEAKERS</p>\n' +
        '\n' +
        '<p>Sally Gilligan\n' +
        '<br />Chief Innovation Officer and Head of Strategy, Gap Inc.</p>\n' +
        '\n' +
        '<p>Karen Mangia\n' +
        '<br />Vice President, Customer and Market Insights, Salesforce; Author, Working from Home: Making the New Normal Work for You</p>\n' +
        '\n' +
        '<p>Everett Harper\n' +
        '<br />CEO, Co Founder, Truss</p>\n' +
        '\n' +
        '<p>Scott Bowden\n' +
        '<br />Managing Director, Software and Platform Lead–North America, Accenture—Moderator</p>\n' +
        '\n' +
        '<p>In response to the Coronavirus COVID-19 outbreak, this program took place and was recorded live via video conference, for an online audience only, and was live-streamed by The Commonwealth Club of California from San Francisco on S...',
      guid: '4064C020-85E3-4368-8B0C-B56EB7B3C9AD',
      datePublished: 1600889338,
      datePublishedPretty: 'September 23, 2020 2:28pm',
      dateCrawled: 1600889877,
      enclosureUrl: 'http://dts.podtrac.com/redirect.mp3/audio.commonwealthclub.org/audio/podcast/cc_20200922_FEA_Accenture_For_Podcast.mp3',
      enclosureType: 'audio/mpeg',
      enclosureLength: 0,
      explicit: 0,
      episode: null,
      episodeType: 'full',
      season: 0,
      image: '',
      feedItunesId: 976334034,
      feedImage: 'http://audio.commonwealthclub.org/audio/podcast/Club_Itunes_Logo.png',
      feedId: 872229,
      feedTitle: 'Commonwealth Club of California Podcast',
      feedLanguage: 'en-us'
    },
    {
      id: 365291594,
      title: "Breanna Taylor's murderers escapes accountability",
      link: 'https://anchor.fm/new-jersey-jay-on-the-rad/episodes/Breanna-Taylors-murderers-escapes-accountability-ek2p8s',
      description: 'Breaking news out of Kentucky where the grand jury returned a weak indictment against one devil instead of all of them.\n' +
        '\n' +
        '--- \n' +
        '\n' +
        'Support this podcast: https://anchor.fm/new-jersey-jay-on-the-rad/support',
      guid: 'dc688043-c06d-40e5-be6b-91a6f3655885',
      datePublished: 1600889329,
      datePublishedPretty: 'September 23, 2020 2:28pm',
      dateCrawled: 1600889970,
      enclosureUrl: 'https://anchor.fm/s/2a4397a0/podcast/play/20062940/https%3A%2F%2Fd3ctxlq1ktw2nl.cloudfront.net%2Fproduction%2F2020-8-23%2F111088542-44100-1-5bbac2cac5a63.m4a',
      enclosureType: 'audio/x-m4a',
      enclosureLength: 20958304,
      explicit: 0,
      episode: 13,
      episodeType: 'full',
      season: 1,
      image: 'https://d3t3ozftmdmh3i.cloudfront.net/production/podcast_uploaded/6990728/6990728-1594233140658-17b2af907675f.jpg',
      feedItunesId: 1522316599,
      feedImage: 'https://d3t3ozftmdmh3i.cloudfront.net/production/podcast_uploaded/6990728/6990728-1594233140658-17b2af907675f.jpg',
      feedId: 509620,
      feedTitle: 'Nj Jay On The Radar',
      feedLanguage: 'en'
    },
    {
      id: 365290580,
      title: 'Episode 26: Tanisha Mitchell',
      link: 'https://anchor.fm/tourpasspodcast/episodes/Episode-26-Tanisha-Mitchell-ek2ora',
      description: 'This week we welcome Canada’s own, Tanisha Mitchel to talk about her experiences on Warped Tour, in Europe and her humble beginnings booming DIY shows in Canada!!!! We also talk life in 2020, Toronto, shady places in Louisiana and so much more! @tourpasspodcast tourpasspodcast@gmail.com',
      guid: 'a676ace6-85ad-4d77-b998-8d72ca82771f',
      datePublished: 1600889317,
      datePublishedPretty: 'September 23, 2020 2:28pm',
      dateCrawled: 1600889934,
      enclosureUrl: 'https://anchor.fm/s/1b14b188/podcast/play/20062506/https%3A%2F%2Fd3ctxlq1ktw2nl.cloudfront.net%2Fstaging%2F2020-09-23%2F50a7e845e776ad67f2c05c58ae6c7821.m4a',
      enclosureType: 'audio/x-m4a',
      enclosureLength: 60891927,
      explicit: 0,
      episode: 26,
      episodeType: 'full',
      season: 1,
      image: 'https://d3t3ozftmdmh3i.cloudfront.net/production/podcast_uploaded_nologo/4443410/4443410-1588892911896-5759dc24e98b4.jpg',
      feedItunesId: 1507400956,
      feedImage: 'https://d3t3ozftmdmh3i.cloudfront.net/production/podcast_uploaded_nologo/4443410/4443410-1588892911896-5759dc24e98b4.jpg',
      feedId: 451673,
      feedTitle: 'Tour Pass Podcast',
      feedLanguage: 'en'
    }
  ],
  count: 10,
  max: '10',
  description: 'Found matching items.'
}
*/
