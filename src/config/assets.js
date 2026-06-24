// Every video, image, and audio file the experience plays, in one place.
// Paths resolve against /public, so they work the same in dev and in a build.

const art = (file) => `/assets/art/${file}`;
const song = (file) => `/assets/songs/${file}`;

export const VIDEOS = {
  default: art('valentine_default.mp4'),
  loop: art('valentine_loop.mp4'),
  loopTired: art('valentine_loop_tired.mp4'),
  loopTired2: art('valentine_loop_tired_2.mp4'),
  yesHover: art('valentine_yes_hover.mp4'),
  noHover1: art('valentine_no_hover_1.mp4'),
  noHover2: art('valentine_no_hover_2.mp4'),
  no1: art('valentine_no_1.mp4'),
  no2: art('valentine_no_2.mp4'),
  no3: art('valentine_no_3.mp4'),
  no4: art('valentine_no_4.mp4'),
  paperYesClick: art('valentine_paper_yes_click.mp4'),
  yes: art('valentine_yes.mp4'),
  explosion: art('explosion.mp4'),
};

export const IMAGES = {
  startBg: art('valentine_start_bg.png'),
  startButton: art('valentine_start_button.png'),
  paper1: art('valentine_paper_1.png'),
  paper1Yes: art('valentine_paper_1_yes.png'),
  paper1No: art('valentine_paper_1_no.png'),
  paper2: art('valentine_paper_2.png'),
  paper2Yes: art('valentine_paper_2_yes.png'),
  paper2No: art('valentine_paper_2_no.png'),
  paper3: art('valentine_paper_3.png'),
  paper3Yes: art('valentine_paper_3_yes.png'),
  paper3No: art('valentine_paper_3_no.png'),
};

export const AUDIO = {
  startSong: song('VALENTINE_start_song.mp3'),
  song1: song('song1.mp3'),
  song2: song('song2.mp3'),
  song3: song('song3.mp3'),
  typewriter: song('typewriter.mp3'),
  romance: song('romance.mp3'),
  next: song('next.mp3'),
};

// Several clips have their soundtrack stored as a separate file so video and
// audio can be started together on the exact same frame.
export const VIDEO_AUDIO = {
  [VIDEOS.default]: song('VALENTINE_default.mp3'),
  [VIDEOS.no1]: song('VALENTINE_no_1.mp3'),
  [VIDEOS.no2]: song('VALENTINE_no_2.mp3'),
  [VIDEOS.no3]: song('VALENTINE_no_3.mp3'),
  [VIDEOS.no4]: song('VALENTINE_no_4.mp3'),
  [VIDEOS.noHover1]: song('VALENTINE_no_hover_1.mp3'),
  [VIDEOS.noHover2]: song('VALENTINE_no_hover_2.mp3'),
  [VIDEOS.yesHover]: song('VALENTINE_yes_hover.mp3'),
  [VIDEOS.yes]: song('VALENTINE_YES.mp3'),
};
