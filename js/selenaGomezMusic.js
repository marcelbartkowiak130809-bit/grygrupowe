// Selena Gomez — rozpoznawalne single z kariery solowej i okresu z The Scene.
// Previewy oraz okładki pochodzą z publicznego katalogu iTunes.
const track = (id, title, artist, album, coverUrl, previewUrl) => {
  const query = encodeURIComponent(`${artist} ${title}`);
  return {
    id: `itunes-${id}`,
    title,
    artist,
    album,
    region: "global",
    coverUrl,
    previewUrl,
    externalUrl: `https://open.spotify.com/search/${query}`,
    spotifyUrl: `https://open.spotify.com/search/${query}`,
    provider: "preview",
  };
};

export const selenaGomezMusicTracks = [
  track(1440839641, "Same Old Love", "Selena Gomez", "Revival (Deluxe)", "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/2e/33/f4/2e33f4a3-112d-be8c-d0e4-b1661dac6f6b/15UMGIM48242.rgb.jpg/600x600bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/c5/2b/8d/c52b8dc6-5df5-4f8f-337d-bb3500c8c7c5/mzaf_1658380701999766366.plus.aac.p.m4a"),
  track(1440619218, "Love You Like A Love Song", "Selena Gomez & The Scene", "When The Sun Goes Down", "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/70/31/00/7031001b-f918-6009-76c2-9db98d3ef811/11DMGIM02401.rgb.jpg/600x600bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/b7/bc/d7/b7bcd70f-3e44-f26e-21bb-4f2bf116a188/mzaf_3809983420380822936.plus.aac.p.m4a"),
  track(1506661712, "Lose You To Love Me", "Selena Gomez", "Rare (Deluxe)", "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/05/c5/f5/05c5f579-085a-7ac7-2c93-b23ec638c451/20UMGIM14807.rgb.jpg/600x600bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/a2/91/0a/a2910a04-46b7-fda1-4cd7-b602dfa48399/mzaf_11930876727703398032.plus.aac.p.m4a"),
  track(1440839635, "Hands To Myself", "Selena Gomez", "Revival (Deluxe)", "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/2e/33/f4/2e33f4a3-112d-be8c-d0e4-b1661dac6f6b/15UMGIM48242.rgb.jpg/600x600bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/27/7d/00/277d0003-0bc6-4332-45ce-8253a8dc8b0f/mzaf_13626496645323015449.plus.aac.p.m4a"),
  track(1440502294, "The Heart Wants What It Wants", "Selena Gomez", "For You", "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/87/10/df/8710df62-5898-f41d-b11f-47dc614531e3/14DMGIM05704.rgb.jpg/600x600bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/42/91/fe/4291fe04-efee-9bde-13c3-8f04dafe9de0/mzaf_11850616979107122049.plus.aac.p.m4a"),
  track(1381915969, "Back To You", "Selena Gomez", "13 Reasons Why (Season 2)", "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/9b/8a/fb/9b8afb81-03ad-975a-a2d8-93533fb7dd67/18UMGIM26534.rgb.jpg/600x600bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/58/36/67/58366770-6541-57a3-fa58-8f7ad0b1cb8e/mzaf_11238694758091585166.plus.aac.p.m4a"),
  track(1445055017, "Wolves", "Selena Gomez & Marshmello", "Wolves - Single", "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/3a/e5/12/3ae51282-a318-71d1-085f-f4d621de44e6/17UM1IM41679.rgb.jpg/600x600bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/7b/27/56/7b275622-3051-914a-2b70-de47374b4f8c/mzaf_2742001812879947761.plus.aac.p.m4a"),
  track(1205671288, "It Ain't Me", "Kygo & Selena Gomez", "It Ain't Me - Single", "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/3f/8e/44/3f8e4469-ea05-29d7-99b9-e3aec73ecc32/886446357423.jpg/600x600bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/1c/29/ae/1c29aec4-dc88-cc55-d635-bee1f8b1488e/mzaf_7703806769142431542.plus.aac.p.m4a"),
  track(1488413283, "Rare", "Selena Gomez", "Rare", "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/1d/5e/35/1d5e35f4-dbd3-f588-1f0b-1244fc2aad55/19UM1IM04673.rgb.jpg/600x600bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/75/c2/01/75c201b6-73c7-097e-fd83-aae136934b8f/mzaf_1486002887815831718.plus.aac.p.m4a"),
  track(1506661954, "Look At Her Now", "Selena Gomez", "Rare (Deluxe)", "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/05/c5/f5/05c5f579-085a-7ac7-2c93-b23ec638c451/20UMGIM14807.rgb.jpg/600x600bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/bb/25/a0/bb25a0a4-018f-09eb-df01-1ded2438b295/mzaf_930156896602533031.plus.aac.p.m4a"),
  track(1703517719, "Single Soon", "Selena Gomez", "Single Soon - Single", "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/37/21/45/37214531-57d0-b6d2-5dcd-0a4b6318d86f/23UMGIM91977.rgb.jpg/600x600bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/ac/1a/fb/ac1afb99-65e4-c17c-c104-dd1e3b74751c/mzaf_12834660421071390040.plus.aac.p.m4a"),
  track(1506661711, "Boyfriend", "Selena Gomez", "Rare (Deluxe)", "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/05/c5/f5/05c5f579-085a-7ac7-2c93-b23ec638c451/20UMGIM14807.rgb.jpg/600x600bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/7e/ee/a2/7eeea23b-d972-53de-e92a-2753aba68f06/mzaf_2647798344288466348.plus.aac.p.m4a"),
  track(1440625020, "Come & Get It", "Selena Gomez", "Stars Dance (Bonus Track Version)", "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/02/27/1e/02271e27-21e2-d044-1678-2644184681c9/13DMGIM03981.rgb.jpg/600x600bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/10/e3/34/10e33404-d013-f7fc-23bd-dfb2bf9504ba/mzaf_15875602299713181779.plus.aac.p.m4a"),
  track(1440638661, "Naturally", "Selena Gomez & The Scene", "Kiss & Tell", "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/8f/16/29/8f1629c8-df81-9cac-deb5-93183520f035/09BVMIM00964.rgb.jpg/600x600bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/88/5b/c1/885bc15f-7024-479d-3e0f-f291a54ab190/mzaf_12280976675587859959.plus.aac.p.m4a"),
  track(1440619222, "Who Says", "Selena Gomez & The Scene", "When The Sun Goes Down", "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/70/31/00/7031001b-f918-6009-76c2-9db98d3ef811/11DMGIM02401.rgb.jpg/600x600bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/cf/86/08/cf860812-6b7e-4e0c-a6b3-fa8feef8ea4e/mzaf_11448972915342822579.plus.aac.p.m4a"),
  track(1440839628, "Kill Em With Kindness", "Selena Gomez", "Revival (Deluxe)", "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/2e/33/f4/2e33f4a3-112d-be8c-d0e4-b1661dac6f6b/15UMGIM48242.rgb.jpg/600x600bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/42/0b/2a/420b2a24-340d-32c9-559f-4c1657376e19/mzaf_4403074800527392446.plus.aac.p.m4a"),
  track(1445844007, "A Year Without Rain", "Selena Gomez & The Scene", "A Year Without Rain (Deluxe Edition)", "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/da/c4/07/dac40712-b88c-27cd-ccb3-8bc540fc7790/10DMGIM01659.rgb.jpg/600x600bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/6f/7f/6f/6f7f6fec-edac-cb8d-c8dc-6f527259c369/mzaf_14676271559486931201.plus.aac.p.m4a"),
];
