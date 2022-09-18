## Creating a cross-browser video player

> See the [example running live](https://iandevlin.github.io/mdn/video-player)

### HTML Markup
To start off with, let's take a look at the HTML that makes up the player. First of all the `<video>` element is defined, contained within a `<figure>` element that acts as the video container.

```html
<figure id="videoContainer">
  <video id="video" controls preload="metadata" poster="img/poster.jpg">
    <source
      src="video/tears-of-steel-battle-clip-medium.mp4"
      type="video/mp4" />
    <source
      src="video/tears-of-steel-battle-clip-medium.webm"
      type="video/webm" />
    <source
      src="video/tears-of-steel-battle-clip-medium.ogg"
      type="video/ogg" />
  </video>
  <figcaption>
    &copy; xyz |
    <a href="">xyz.org</a>
  </figcaption>
</figure>
```

Even though this player will define its own custom control set, the `controls` attribute is still added to the `<video>` element, and the player's default control set is switched off later with JavaScript. Doing things this way still allows users who have JavaScript turned off to still have access to the browser's native controls.

A poster image is defined for the video, and the `preload` attribute is set to `metadata`, which informs the browser that it should initially only attempt to load the metadata from the video file rather than the entire video file. This provides the player with data such as video duration and format.

The next step is to define a custom control set, also in HTML, which will be used to control the video.

- Play/pause
- Mute
- Volume control
- Progress bar
- Skip ahead
- Go fullscreen

```html
<ul id="video-controls" class="controls">
  <li><button id="playpause" type="button">Play/Pause</button></li>
  <li><button id="stop" type="button">Stop</button></li>
  <li class="progress">
    <progress id="progress" value="0" min="0">
      <span id="progress-bar"></span>
    </progress>
  </li>
  <li><button id="mute" type="button">Mute/Unmute</button></li>
  <li><button id="volinc" type="button">Vol+</button></li>
  <li><button id="voldec" type="button">Vol-</button></li>
  <li><button id="fs" type="button">Fullscreen</button></li>
</ul>
```

The `span` within the `<progress>` element is for browsers that do not support the progress element and will be updated at the same time as progress (this `span` element won't be visible on browsers that support `progress`).

The controls are initially hidden with a CSS `display:none` and will be enabled with JavaScript. Again if a user has JavaScript disabled, the custom control set will not appear and they can use the browser's default control set unhindered.

Before dealing with the individual buttons, a number of initialization calls are required.

```js
const videoContainer = document.getElementById('videoContainer');
const video = document.getElementById('video');
const videoControls = document.getElementById('video-controls');

// Hide the default controls
video.controls = false;

// Display the user defined video controls
videoControls.style.display = 'block';
```

### Play/Pause
When a `click` event is detected on the play/pause button, the handler first checks if the video is currently paused or has ended; if so, it uses the `play()` method to playback the video. Otherwise the video must be playing, so it is paused using the `pause()` method.

```js
playpause.addEventListener('click', (e) => {
  if (video.paused || video.ended) {
    video.play();
  } else {
    video.pause();
  }
});
```

### Stop
The Media API doesn't have a stop method, so to mimic this the video is paused, and its `currentTime` (i.e. the video's current playing position) and the `<progress>` element's position is set to 0.

```js
stop.addEventListener('click', (e) => {
  video.pause();
  video.currentTime = 0;
  progress.value = 0;
});
```

### Mute
The mute button is a simple toggle button that uses the Media API's `muted` attribute to mute the video: this is a `Boolean` indicating whether the video is muted or not.

```js
mute.addEventListener('click', (e) => {
  video.muted = !video.muted;
});
```

### Volume
Two volume control buttons have been defined, one for increasing the volume and another for decreasing it. Media API's `volume` attribute holds the current volume value of the video. Valid values for this attribute are 0 and 1 and anything in between. The function is defined to increase or decrease the video's `volume` attribute in steps of 0.1, ensuring that it doesn't go lower than 0 or higher than 1.

```js
function alterVolume(dir) {
  const currentVolume = Math.floor(video.volume * 10) / 10;
  if (dir === '+' && currentVolume < 1) {
    video.volume += 0.1;
  } else if (dir === '-' && currentVolume > 0) {
    video.volume -= 0.1;
  }
}
```

### Progress
When the `<progress>` element was defined above in the HTML, only two attributes were set, `value` and `min`, both being given a value of 0. It also needs to have a maximum value set so that it can display its range correctly, and this can be done via the `max` attribute, which needs to be set to the maximum playing time of the video. This is obtained from the video's `duration` attribute, which again is part of the Media API.

Ideally, the correct value of the video's `duration` attribute is available when the `loadedmetadata` event is raised, which occurs when the video's metadata has been loaded:

```js
video.addEventListener('loadedmetadata', () => {
  progress.setAttribute('max', video.duration);
});
```

Another event, `timeupdate`, is raised periodically as the video is being played through. This event is ideal for updating the progress bar's value, setting it to the value of the video's `currentTime` attribute, which indicates how far through the video the current playback is. The `<span>` element mentioned earlier, for browsers that do not support the `<progress>` element, is also updated at this time, setting its width to be a percentage of the total time played.

```js
video.addEventListener('timeupdate', () => {
  progress.value = video.currentTime;
  progressBar.style.width = `${Math.floor(video.currentTime * 100 / video.duration)}%`;
});
```

Coming back to the `video.duration` problem, unfortunately in some mobile browsers, when `loadedmetadata` is raised, `video.duration` may not have the correct value. So something else needs to be done. When the `timeupdate` event is raised, in most mobile browsers the video's `duration` attribute should now have the correct value. This can be taken advantage of to set the `progress` element's `max` attribute if it is currently not set:

```js
video.addEventListener('timeupdate', () => {
  if (!progress.getAttribute('max')) progress.setAttribute('max', video.duration);
  progress.value = video.currentTime;
  progressBar.style.width = `${Math.floor(video.currentTime * 100 / video.duration)}%`;
});
```

### Skip Ahead
Another feature of most browser default video control sets is the ability to click on the video's progress bar to "skip ahead" to a different point in the video. This can also be achieved by adding a `click` event listener to the `progress` element:

```js
progress.addEventListener('click', (e) => {
  const rect = progress.getBoundingClientRect();
  const pos = (e.pageX  - rect.left) / progress.offsetWidth;
  video.currentTime = pos * video.duration;
});
```

### Fullscreen
If the browser is currently in fullscreen mode, then it must be exited and vice versa. Interestingly `document` must be used for exiting/cancelling fullscreen mode, whereas any HTML element can request fullscreen mode, here the `videoContainer` is used as it also contains the custom controls which should also appear with the video in fullscreen mode.

```js
function handleFullscreen() {
  if (document.fullscreenElement !== null) {
    // The document is in fullscreen mode
    document.exitFullscreen();
    setFullscreenData(false);
  } else {
    // The document is not in fullscreen mode
    videoContainer.requestFullscreen();
    setFullscreenData(true);
  }
}

// used to set some CSS to improve the styling of the custom controls when they are in fullscreen
function setFullscreenData(state) {
  videoContainer.setAttribute('data-fullscreen', !!state);
}
```

When a video goes into fullscreen mode, it usually displays a message indicating that the user can press the `Esc` key to exit fullscreen mode, so the code also needs to listen for relevant events in order to call the `setFullscreenData()` function to ensure the control styling is correct:

```js
document.addEventListener('fullscreenchange', (e) => {
  setFullscreenData(!!document.fullscreenElement);
});
```

### Media buffering and time ranges
Sometimes it's useful to know how much `<audio>` or `<video>` has downloaded or is playable without delay — a good example of this is the buffered progress bar of an audio or video player.

The `buffered` attribute will tell us which parts of the media has been downloaded. It returns a `TimeRanges` object, which will tell us which chunks of media have been downloaded. This is usually contiguous but if the user jumps about while media is buffering, it may contain holes.

```js
// a simple audio example
const audio = document.getElementById('my-audio');
const bufferedTimeRanges = audio.buffered;
```

TimeRanges are a series of non-overlapping ranges of time, with start and stop times. A TimeRanges Object consists of the following properties:

- `length`: The number of time ranges in the object.
- `start(index)`: The start time, in seconds, of a time range.
- `end(index)`: The end time, in seconds, of a time range.

Without any user interaction there is usually only one time range, but if you jump about in the media more than one time range can appear.

```js
// represents two buffered time ranges:
// one spanning 0 to 5 seconds and the second spanning 15 to 19 seconds.
audio.buffered.length;   // returns 2
audio.buffered.start(0); // returns 0
audio.buffered.end(0);   // returns 5
audio.buffered.start(1); // returns 15
audio.buffered.end(1);   // returns 19
```

If we wish to create our own custom player, it is better perhaps to give an indication of how much media has actually downloaded — this what the browser's native players seem to display.

```js
window.onload = () => {
  const audio = document.getElementById('my-audio');

  // The progress event is fired as data is downloaded, 
  // this is a good event to react to if we want to display buffering progress.
  audio.addEventListener('progress', () => {
    const duration = audio.duration;
    if (duration > 0) {
      for (let i = 0; i < audio.buffered.length; i++) {
        if (
          audio.buffered.start(audio.buffered.length - 1 - i) <
          audio.currentTime
        ) {
          document.getElementById('buffered-amount').style.width = `${
            (audio.buffered.end(audio.buffered.length - 1 - i) * 100) / duration
          }%`;
          break;
        }
      }
    }
  });

  // The timeupdate event is fired 4 times a second as the media plays,
  // and that's where we increment our playing progress bar.
  audio.addEventListener('timeupdate', () => {
    const duration = audio.duration;
    if (duration > 0) {
      document.getElementById('progress-amount').style.width = `${audio.currentTime / duration * 100}%`;
    }
  });
};
```
