var audioContext = new (window.AudioContext || window.webkitAudioContext) ();
var childIndex = 0;
var tagIndex = 3;

function allowDrop(ev) {
	ev.preventDefault();
}

//canvas drag & drop
function dropping(e) {
	e.preventDefault();
	
	var ctx = e.toElement.getContext('2d');
	var w = e.toElement.width;
	var h = e.toElement.height;
	
	//create audio node
	var source = audioContext.createBufferSource();
	var analyser = audioContext.createScriptProcessor(1024,1,1);
	
	//fill the canvas first
	ctx.fillStyle = '#EEEEE0';
	ctx.fillRect(0,0,w,h);
	
	//create the file reader to read the audio file dropped
	var reader = new FileReader();
	reader.onload = function(e){
		if(audioContext.decodeAudioData){
			//decode the audio data
			audioContext.decodeAudioData(e.target.result,function(buffer){
				source.buffer = buffer;
				drawBuffer(w, h, ctx, buffer.getChannelData(0));
			});
		} else {
			//fallback to the old API
			source.buffer = audioContext.createBuffer(e.target.result,true);
		}
		//connect to the destination and our analyser
		source.connect(analyser);
		analyser.connect(audioContext.destination);
	}
	//read the file
	reader.readAsArrayBuffer(e.dataTransfer.files[0]);
	e.target.src = source;
}

//play
function Play(e) {
	if(!e.parentNode.nextElementSibling.src){
		console.log("no audio Source");
	} else {
		
		if(e.classList.contains("NoPlaying")){
			e.track = audioContext.createBufferSource();
			e.gainNode = audioContext.createGain();
			e.track.buffer = e.parentNode.nextElementSibling.src.buffer;
			e.track.connect(e.gainNode);
			e.gainNode.connect(audioContext.destination);
			e.classList.remove("NoPlaying");
			e.src = 'images/stop.png';
			e.track.start();
		} else {
			e.classList.add("NoPlaying");
			e.src = 'images/play.png';
			e.track.stop();
		}
	}
	
	if(!e.recSong) {
		e.recSong = new Audio();
	} else {
		if(e.parentNode.nextElementSibling.nextElementSibling.href === "") {
			console.log("no recorded audio");
		} else {
			if(e.classList.contains("NoPlaying")){
				e.classList.remove("NoPlaying");
				e.src = 'images/stop.png';
				var link = e.parentNode.nextElementSibling.nextElementSibling.cloneNode(true);
				var parentLink = e.parentNode;
				var a = document.createElement('a');
				a = link;
				var existA = e.nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling;
				var img = document.createElement('img');
				img.id = 'save';
				img.src = 'images/save.png';
				a.appendChild(img);
				parentLink.replaceChild(a, existA);
				e.recSong.src = link.href;
				e.recSong.play();
				
			} else {
				e.classList.add("NoPlaying");
				e.src = 'images/play.png';
				e.recSong.pause();
			}
		}
	}
}

//pause all track 
function Pause(e) {
	if(!e.previousElementSibling.track) {
		console.log("No Audio Track");
	} else {
		var pauseTrack = e.previousElementSibling.track;
		if(!e.previousElementSibling.track.context){
			console.log("no audio Source");
		} else {
			if(pauseTrack.playbackRate.value === 1) {
				pauseTrack.playbackRate.value = 0;
			} else {
				pauseTrack.playbackRate.value = 1;
			}
		}
	}
	
	if(!e.previousElementSibling.recSong) {
		console.log("No Recorded Track");
	} else {
		if(e.previousElementSibling.recSong.paused) {
			e.previousElementSibling.recSong.play(e.curT);
		} else {
			e.previousElementSibling.recSong.pause();
			e.curT = e.previousElementSibling.recSong.currentTime;
		}
	}
}

//individual mute
function Mute(e) {
	if(!e.previousElementSibling.previousElementSibling.previousElementSibling.gainNode) {
		console.log("No Audio Track");
	} else {
		var muteTrack = e.previousElementSibling.previousElementSibling.previousElementSibling.gainNode;
		if(!e.previousElementSibling.previousElementSibling.previousElementSibling.track){
			console.log("no audio Source");
		} else {
			if( muteTrack.gain.value === 1) {
				muteTrack.gain.value = 0;
				e.src = 'images/muteon.png';
			} else {
				muteTrack.gain.value = 1;
				e.src = 'images/muteoff.png';
			}
		}
	}
	
	if(!e.previousElementSibling.previousElementSibling.previousElementSibling.recSong) {
		console.log("No Recorded Track");
	} else {
		if(e.previousElementSibling.previousElementSibling.previousElementSibling.recSong.muted) {
			e.previousElementSibling.previousElementSibling.previousElementSibling.recSong.muted = false;
		} else {
			e.previousElementSibling.previousElementSibling.previousElementSibling.recSong.muted = true;
		}
	}
}

//addTrack
function AddTrack(e) {
	var newDiv = document.createElement('div');
	
	newDiv.id = "track"+tagIndex;
	newDiv.className = "track";
	
	var node = e.parentNode.nextElementSibling;
	node.insertBefore(newDiv, node.childNodes[5+childIndex]);

	var tag = "<aside>"
			+ "		<h2>Track" + tagIndex + "</h2>"
			+ "		<img id='play' class='NoPlaying' src='images/play.png' onclick='Play(this);'/>"
			+ "		<img id='pause' src='images/pause.png' onclick='Pause(this);'/>"
			+ "		<img id='record' src='images/recordOff.png'>"
			+ "		<img id='mute' src='images/muteoff.png' onclick='Mute(this);'>"
			+ "		<a id='down'></a>"
			+ "		<input type='checkbox' class='checkbox' onclick='DeviceSelect(this);'>"
			+ "</aside>"
			+ "<canvas ondrop='dropping(event)' ondragover='allowDrop(event)' draggable='true'></canvas>"
			+ "<a></a>";
	
	var lastProc = document.getElementById("track"+tagIndex);
	lastProc.innerHTML = tag;
	
	tagIndex++;
	childIndex++;
}

function drawBuffer( width, height, context, data ) {
    var step = Math.ceil( data.length / width );
    var amp = height / 2;
    context.fillStyle = "orange";
    context.clearRect(0,0,width,height);
    for(var i=0; i < width; i++){
        var min = 1.0;
        var max = -1.0;
        for (j=0; j<step; j++) {
            var datum = data[(i*step)+j]; 
            if (datum < min)
                min = datum;
            if (datum > max)
                max = datum;
        }
        context.fillRect(i,(1+min)*amp,1,Math.max(1,(max-min)*amp));
    }
}
