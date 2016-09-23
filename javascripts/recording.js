var audioContext = new (window.AudioContext || window.webkitAudioContext) ();
var recIndex = 0;

// recording button function ( toggle )
function toggleRecording( e ) {
	var imgchange = e;
	
	if (e.classList.contains("recording")) {
		// stop recording
		e.parentNode.parentNode.src.stop();
		e.classList.remove("recording");
		imgchange.src = 'images/recordOff.png';
		
		//draw signal on canvas && buffer link create
		e.parentNode.parentNode.src.getBuffers( function(buffers) {
			var ci = e.parentNode.nextElementSibling;
			drawBuffer( ci.width, ci.height, ci.getContext('2d'), buffers[0] );
			e.parentNode.parentNode.src.exportWAV(function(blob) {
				var good = Recorder.setupDownload( blob );
				var replace = e.parentNode.nextElementSibling.nextElementSibling;
				var link = document.createElement("a");
				link.id = "tracklink";
				link.href = good;
				link.download =  "myRecording" + ((recIndex<10)?"0":"") + recIndex + ".wav"  || 'output.wav';
				recIndex++;
				e.parentNode.parentNode.replaceChild(link, replace);
			});
			
		});
	} else {
		// start recording  
		if (!e.parentNode.parentNode.src)
	    		return;
	
		e.classList.add("recording");
		imgchange.src = 'images/recordOn.png';
		e.parentNode.parentNode.src.clear();
		e.parentNode.parentNode.src.record();
	}
}

//audio device select
function DeviceSelect(e) {
	var checkBox = e;
	var DevSel = document.querySelector('#device');
	
	if(checkBox.checked === true) {
		DevSel.hidden = false;
		navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError);
	} else {
		DevSel.hidden = true;
	}
	
	//input Device Check
	function gotDevices(deviceInfos) {
	
		var masterInputSelector = document.createElement('select');
		masterInputSelector.id = 'device';
		
		for (var i = 0; i !== deviceInfos.length; ++i) {
			var deviceInfo = deviceInfos[i];
			var option = document.createElement('option');
			option.value = deviceInfo.deviceId;
			if (deviceInfo.kind === 'audioinput') {
				option.text = deviceInfo.label || 'microphone ' + (masterInputSelector.length + 1);
				masterInputSelector.appendChild(option);
			}
		}
		
		var audioInputSelect = document.querySelectorAll('select#device');
		for ( var selector = 0; selector < audioInputSelect.length; selector++) {
			var newInputSelector = masterInputSelector.cloneNode(true);
			newInputSelector.addEventListener('change', changeAudioDestination);
			audioInputSelect[selector].parentNode.replaceChild(newInputSelector, audioInputSelect[selector]);
		}
	}
	
	//Audio recording check
	function initAudio(index) {

	  	var audioSource = index.value;
		var idconfirm = e.parentNode.parentNode;
		var recordCloud = document.createElement('a');
		var audioRecorder = null;
		
		function gotStream(stream) {
				
			// Create an AudioNode from the stream.
			var realAudioInput = audioContext.createMediaStreamSource(stream);
			var audioInput = realAudioInput;
			
			var inputPoint = audioContext.createGain();
			inputPoint.gain.value = 0.0;
			audioInput.connect(inputPoint);
			
			var analyserNode = audioContext.createAnalyser();
			analyserNode.fftSize = 2048;
			inputPoint.connect( analyserNode );
			
			audioRecorder = new Recorder( inputPoint ); // this fuck what the fuck
			// speak / headphone feedback initial settings
			
			inputPoint.connect(audioContext.destination);
			return audioRecorder;
		}
		
		var constraints = {
			audio: { deviceId: audioSource ? {exact: audioSource} : undefined}
		};
		
		navigator.mediaDevices.getUserMedia(constraints)
		.then(gotStream)
		.then(function() { 
			idconfirm.src = audioRecorder;
		})
		.catch(handleError);
	}
	
	// function for many Selector Element 
	function changeAudioDestination(event) {
		var InputSelector = event.path[0];
		initAudio(InputSelector);
	}
}


// fail callback
function handleError(error) {
	
  console.log('navigator.getUserMedia error: ', error);
}

//Get Input Devices
//page load then Start function
