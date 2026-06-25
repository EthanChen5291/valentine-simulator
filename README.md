# be my valentine

A little hand-drawn, point-and-click film that asks you to be its valentine and then refuses to take no for an answer.

<p align="center">
  <img src="public/assets/scans/StartScreen.png" width="640" alt="A watercolor cafeteria with a hand-drawn 'Start' button floating in the doorway" />
</p>

## How it goes

You hand your "special other" a card. What could their answer be?

| The ask | The reaction |
| --- | --- |
| ![A character holds up a card reading 'you be my valentine' with yes and no checkboxes](public/assets/scans/Default.png) | ![The same character tearing up after the wrong checkbox](public/assets/scans/Scared.png) |

There are right answers. There are also incorrect answers. We ensure that your special other chooses correctly :)

<p align="center">
  <img src="public/assets/scans/Dark.png" width="640" alt="A dark room with the question typed out and yes / no buttons" />
</p>

## What's in here

**10 hand-animated scenes**, drawn, voiced, and scored from scratch — **40+ original assets** : 14 video clips, a dozen painted sprites, and 16 audio tracks synced to the scene.

| | | | | |
| --- | --- | --- | --- | --- |
| ![](public/assets/scans/gallery-01.png) | ![](public/assets/scans/gallery-02.png) | ![](public/assets/scans/gallery-03.png) | ![](public/assets/scans/gallery-04.png) | ![](public/assets/scans/gallery-05.png) |

## A few notes on how it's built

A single-page React app — with no backend or UI framework. Just the art, the audio, and a small amount of friendship and happiness!

## Stack

- React + Vite
- ProCreate + ProCreate Dreams (drawings + animation)
- Dorico (audio)
- CapCut (sound effects + editing)
- CSS

## Running it

```bash
npm install
npm run dev
```

If you'd like to tune it to your own special other, edit the words in [src/config/script.js](src/config/script.js) (the question, the finale letter, and the headline), then drop your own art and music into [public/assets/](public/assets/) under the filenames listed in [src/config/assets.js](src/config/assets.js). Voila!

## Credits

All art, audio, and animation are mine.
