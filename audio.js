// One context, unlocked by a user gesture, also plays the later timed effects.
let audioContext, masterGain, musicSource, musicBuffer, effectBuffer;
let musicLoading, effectLoading, soundRequested = false, muted = false;
const soundButton = document.getElementById('soundToggle');
function updateSoundButton(failed = false) {
  const playing = soundRequested && !muted && audioContext?.state === 'running';
  soundButton.textContent = failed ? 'Retry sound' : playing ? 'Sound on' : 'Enable sound';
  soundButton.setAttribute('aria-label', playing ? 'Mute sound' : 'Enable sound');
  soundButton.setAttribute('aria-pressed', String(playing));
}
function reportAudioError(error) {
  console.warn('Audio playback failed:', error);
  updateSoundButton(true);
}
function getAudioContext() {
  if (!audioContext) {
    const AudioEngine = window.AudioContext || window.webkitAudioContext;
    if (!AudioEngine) throw new Error('This browser does not support game audio.');
    audioContext = new AudioEngine();
    masterGain = audioContext.createGain();
    masterGain.connect(audioContext.destination);
    audioContext.onstatechange = () => updateSoundButton();
  }
  return audioContext;
}
async function loadSound(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Could not load ${path}: ${response.status}`);
  return audioContext.decodeAudioData(await response.arrayBuffer());
}
function ensureMusic() {
  if (musicSource || !musicBuffer || !soundRequested || muted || document.hidden || audioContext.state !== 'running') return;
  musicSource = audioContext.createBufferSource();
  musicSource.buffer = musicBuffer;
  musicSource.loop = true;
  const gain = audioContext.createGain();
  gain.gain.value = .45;
  musicSource.connect(gain).connect(masterGain);
  musicSource.start();
}
function startMusic() {
  if (muted || document.hidden) return;
  soundRequested = true;
  try {
    const context = getAudioContext();
    // Resume synchronously from the click, before waiting for file downloads.
    context.resume().then(() => {ensureMusic();updateSoundButton()}).catch(reportAudioError);
    if (!musicLoading) {
      musicLoading = loadSound('assests/Sound/Theme_Sound-browser.wav')
        .then(buffer => {musicBuffer = buffer;ensureMusic()})
        .catch(error => {musicLoading = null;reportAudioError(error)});
    }
    if (!effectLoading) {
      effectLoading = loadSound('assests/Sound/SFX-browser.wav')
        .then(buffer => {effectBuffer = buffer})
        .catch(error => {effectLoading = null;reportAudioError(error)});
    }
  } catch (error) {reportAudioError(error)}
}
function playSfx(volume = .6, rate = 1) {
  if (muted || document.hidden || !soundRequested) return;
  const requestedAt = Date.now();
  Promise.resolve(effectLoading).then(() => {
    if (!effectBuffer || muted || document.hidden || audioContext.state !== 'running' || Date.now() - requestedAt > 2000) return;
    const source = audioContext.createBufferSource();
    const gain = audioContext.createGain();
    source.buffer = effectBuffer;
    source.playbackRate.value = rate;
    gain.gain.value = volume;
    source.connect(gain).connect(masterGain);
    source.onended = () => {source.disconnect();gain.disconnect()};
    source.start();
  }).catch(reportAudioError);
}
soundButton.addEventListener('click', () => {
  if (soundRequested && !muted && audioContext?.state === 'running' && musicSource) {
    muted = true;
    masterGain.gain.value = 0;
    updateSoundButton();
  } else {
    muted = false;
    if (masterGain) masterGain.gain.value = 1;
    startMusic();
    playSfx();
  }
});
document.addEventListener('visibilitychange', () => {
  if (!audioContext) return;
  if (document.hidden) audioContext.suspend().catch(reportAudioError);
  else if (soundRequested && !muted) startMusic();
});
