/* global document, UI, util */

var UI = {

    USER_LOG_STYLE: 'color: lime; background-color: black; padding: 4px;',
    USER_WARN_STYLE: 'color: orange; background-color: black; padding: 4px;',
    USER_ERROR_STYLE: 'color: red; background-color: black; padding: 4px;',
    USER_INFO_STYLE: 'color: cyan; background-color: black; padding: 4px;',

    tunesContainer: document.getElementById('tunes-container'),
    fileBox: document.getElementById('file-box'),
    nameBox: document.getElementById('name-box'),
    uploadButton: document.getElementById('upload-button'),
    winningRow: null,
    playTime: document.getElementById('play-time'),

    selectedFile: null,

    updateProgressBar: function (percent) {

        if (percent < 0) {
            throw 'negative percent';
        }

        if (!this.selectedFile) {
            console.error('%cNo file selected', this.USER_ERROR_STYLE);
            return;
        }

        if (percent >= 100) {
            this.resetButton();
        }
        else {
            this.uploadButton.innerText = parseInt(percent, 10) + '%';
        }
    },

    cleanTunesList: function () {
        while (this.tunesContainer.firstChild) {
            this.tunesContainer.removeChild(this.tunesContainer.firstChild);
        }
    },

    createTuneItem: function (tuneId, votes, listener) {

        // Score container
        var scoreContainer = document.createElement('span');
        var scoreText = document.createTextNode(votes);
        scoreContainer.className = 'tune-score';
        scoreContainer.appendChild(scoreText);

        // Vote button with label for each tune
        var voteBtn = document.createElement('a');
        voteBtn.addEventListener('click', listener);

        // Tune name
        var tuneNameContainer = document.createElement('span');
        tuneNameContainer.className = 'tune-name';
        var tuneName = document.createTextNode(tuneId.substring(0, tuneId.lastIndexOf('.')));
        tuneNameContainer.appendChild(tuneName);

        // Tune audio
        var tuneAudioContainer = document.createElement('div');
        var tuneAudio = document.createElement('audio');
        var tuneSource = document.createElement('source');
        tuneSource.setAttribute('src', 'tunes/' + tuneId);
        tuneSource.setAttribute('accept', 'audio/*');
        tuneAudio.appendChild(tuneSource);
        tuneAudio.setAttribute('controls', '');
        tuneAudio.setAttribute('style', 'display:none');
        tuneAudioContainer.appendChild(tuneAudio);
        tuneAudioContainer.className = 'tune-audio';

        // Vote button with label for each tune
        var playButton = document.createElement('div');
        playButton.setAttribute('class', 'play-button');
        playButton.addEventListener('click', function() {
            playButton.setAttribute('style', 'display:none');
            pauseButton.setAttribute('style', 'display:block');
            tuneAudio.play()
        });

        var pauseButton = document.createElement('div');
        pauseButton.setAttribute('class', 'pause-button');
        pauseButton.addEventListener('click', function() {
            pauseButton.setAttribute('style', 'display:none');
            playButton.setAttribute('style', 'display:block');
            tuneAudio.pause();
        });

        tuneAudio.addEventListener('ended', function() {
            pauseButton.setAttribute('style', 'display:none');
            playButton.setAttribute('style', 'display:block');
        });

        // Container for each tune
        var tuneItem = document.createElement('li');
        tuneItem.setAttribute('data-tune-id', tuneId);
        tuneItem.className = 'tune-item';

        tuneItem.appendChild(scoreContainer);
        tuneItem.appendChild(tuneNameContainer);
        tuneItem.appendChild(tuneAudioContainer);
        tuneItem.appendChild(playButton);
        tuneItem.appendChild(pauseButton);
        tuneItem.appendChild(voteBtn);

        return tuneItem;
    },
    addRow: function (tuneId) {
        var tuneItem = this.createTuneItem(tuneId, 0);
        this.tunesContainer.appendChild(tuneItem);
    },
    resetButton: function () {
        this.uploadButton.innerText = 'Select File';
        this.nameBox.value = '';
        this.fileBox.value = '';
    }
};
