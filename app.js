let audioContext;
let currentInstrument = 'piano';

const chords = {
    piano: {
        'C': [261.63, 329.63, 392.00],
        'F': [349.23, 440.00, 523.25],
        'G': [392.00, 493.88, 587.33],
    },
    guitar: {
        'C': [130.81, 196.00, 261.63],
        'F': [174.61, 220.00, 261.63],
        'G': [196.00, 246.94, 293.66],
    }
};

function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function selectInstrument(instrument) {
    currentInstrument = instrument;
    updateChordButtons();
}

function updateChordButtons() {
    const chordButtonsContainer = document.getElementById('chord-buttons');
    chordButtonsContainer.innerHTML = '';
    
    for (const chord in chords[currentInstrument]) {
        const button = document.createElement('button');
        button.textContent = chord;
        button.ontouchstart = (e) => {
            e.preventDefault();
            initAudio();
            playChord(chord);
        };
        button.onclick = () => {
            initAudio();
            playChord(chord);
        };
        chordButtonsContainer.appendChild(button);
    }
}

function playChord(chord) {
    const frequencies = chords[currentInstrument][chord];
    frequencies.forEach(frequency => {
        const oscillator = audioContext.createOscillator();
        oscillator.type = currentInstrument === 'piano' ? 'sine' : 'sawtooth';
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        
        const gainNode = audioContext.createGain();
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 1);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 1);
    });
}

// 添加这个函数来防止双击缩放
function preventZoom(e) {
    var t2 = e.timeStamp;
    var t1 = e.currentTarget.dataset.lastTouch || t2;
    var dt = t2 - t1;
    var fingers = e.touches.length;
    e.currentTarget.dataset.lastTouch = t2;

    if (!dt || dt > 500 || fingers > 1) return; // 不是双击
    e.preventDefault();
    e.target.click();
}

document.addEventListener('DOMContentLoaded', () => {
    updateChordButtons();
});
