function AudioPlayer(resources,settings) {
    
    var
        audio = document.createElement('audio'),
        resourcesPrefix="",
        ready=false,
        audioContext=audioOut=0,
        audioPlaying={},
        musicPlaying=0,
        audioToLoad = resources||[];

    this.canPlayOgg=!!(audio.canPlayType && audio.canPlayType('audio/ogg; codecs="vorbis"').replace(/no/, ''));
    this.audioEnabled=true;
    this.effectsEnabled=true;
    this.musicEnabled=true;
    this.audio = {};
    
    if (settings.volume==undefined) settings.volume=1;
    if (settings.musicVolume==undefined) settings.musicVolume=0.3;

    let delay=(cb)=>{
        setTimeout(cb,10);
    }
    
    let loadAudio=(cb,second)=>{
        if (!audioToLoad || !audioToLoad.length) {
            cb();
        } else {

            if (!second) this.audioInitialize();

            var sample=audioToLoad.shift();
            if (!this.audioEnabled) {

                this.audio[sample.id]={
                    id:sample.id,
                    buffer:0,
                    properties:sample
                };

                delay(()=>loadAudio(cb,true));

            } else if (sample.sam) {

                if (!sam) sam=new SamJs();
                var
                    audiobuffer=sam.buf32(sample.sam.text),
                    source = audioContext.createBufferSource(),
                    soundBuffer = audioContext.createBuffer(1, audiobuffer.length, 22050),
                    buffer = soundBuffer.getChannelData(0);
                for(var i=0; i<audiobuffer.length; i++)
                    buffer[i] = audiobuffer[i];
                this.audio[sample.id]={
                    id:sample.id,
                    buffer:soundBuffer,
                    properties:sample
                };
                delay(()=>loadAudio(cb,true));

            } else if (sample.mod) {

                var request = new XMLHttpRequest();
                request.open("GET", resourcesPrefix+sample.mod);
                request.responseType = "arraybuffer";
                request.onload = ()=>{
                    if (request.status === 200) {
                        this.audio[sample.id]={
                            id:sample.id,
                            buffer:0,
                            properties:sample,
                            mod:request.response
                        }
                    }
                    loadAudio(cb,true);
                };
                request.send();

            } else if (sample.like) {

                 this.audio[sample.id]={
                    id:sample.id,
                    buffer:this.audio[sample.like].buffer,
                    mod:this.audio[sample.like].mod,
                    properties:sample
                };
                delay(()=>loadAudio(cb,true));

            } else if (sample.noise) {

                var
                    sampleRate = audioContext.sampleRate,
                    data={},
                    out,bits,steps;

                for (var a in sample.noise) data[a]=sample.noise[a];
                for (var i=0;i<NOISETIMES.length;i++) data[NOISETIMES[i]]*=sampleRate;

                var 
                    attackDecay=data.attack+data.decay,
                    attackSustain=attackDecay+data.sustain,
                    samplePitch = sampleRate/data.frequency,
                    sampleLength = attackSustain+data.release,  

                    tremolo = .9,
                    value = .9,
                    envelope = 0;    

                var buffer = audioContext.createBuffer(2,sampleLength,sampleRate);

                for(var i=0;i<2;i++) {
                    var channel = buffer.getChannelData(i),
                        jump1=sampleLength*data.frequencyJump1onset,
                    jump2=sampleLength*data.frequencyJump2onset;
                    for(var j=0; j<buffer.length; j++) {
                        // ADSR Generator
                        value = NOISEWAVES[data.wave](value,j,samplePitch);
                        if (j<=data.attack) envelope=j/data.attack;
                        else if (j<=attackDecay) envelope=-(j-attackDecay)/data.decay*(1-data.limit)+data.limit;
                        if (j>attackSustain) envelope=(-(j-attackSustain)/data.release+1)*data.limit;
                        // Tremolo
                        tremolo = NOISEWAVES.sine(value,j,sampleRate/data.tremoloFrequency)*data.tremoloDepth+(1-data.tremoloDepth);
                        out = value*tremolo*envelope*0.9;
                        // Bit crush
                        if (data.bitCrush||data.bitCrushSweep) {
                            bits = Math.round(data.bitCrush + j / sampleLength * data.bitCrushSweep);
                            if (bits<1) bits=1;
                            if (bits>16) bits=16;
                            steps=Math.pow(2,bits);
                            out=-1 + 2 * Math.round((0.5 + 0.5 * out) * steps) / steps;
                        }

                        // Done!
                        if (!out) out=0;
                        if(out>1) out= 1;
                        if(out<-1) out = -1;

                        channel[j]=out;

                        // Frequency jump
                        if (j>=jump1) { samplePitch*=1-data.frequencyJump1amount; jump1=sampleLength }
                        if (j>=jump2) { samplePitch*=1-data.frequencyJump2amount; jump2=sampleLength }

                        // Pitch
                        samplePitch-= data.pitch;
                    }
                }
                this.audio[sample.id]={
                    id:sample.id,
                    buffer:buffer,
                    properties:sample
                };
                delay(()=>loadAudio(cb,true));

            } else {

                var request = new XMLHttpRequest();
                request.open('GET', resourcesPrefix+sample.file+(this.canPlayOgg?".ogg":".mp4"), true);
                request.responseType = 'arraybuffer';
                request.onload = ()=>{                   
                    audioContext.decodeAudioData(request.response, (buffer)=>{
                        this.audio[sample.id]={
                            id:sample.id,
                            buffer:buffer,
                            properties:sample
                        };
                        loadAudio(cb,true);
                    }, function(e){
                        console.log("Error loading resource",sample);
                        cb();
                    });
                }   
                request.send();

            }

        }
    }

    this.setMusic=(enabled)=>{
        this.musicEnabled=enabled;
        if (ready)
            if (enabled) this.playMusic(musicPlaying,true);
            else this.stopMusic(true);
    }

    this.setEffects=(enabled)=>{
        this.effectsEnabled=enabled;
    }

    this.audioIsEnded=(sample)=>{
        return !audioPlaying[sample.id]||audioPlaying[sample.id].ended;
    }

    this.setVolume=(vol)=>{
        settings.volume=vol;
    }

    this.setAudioVolume=(audio,vol)=>{
        if (audio&&audioPlaying[audio.id]&&audioPlaying[audio.id].gain)
            audioPlaying[audio.id].gain.gain.value=vol;
    }

    this.setMusicVolume=(vol)=>{
        settings.musicVolume=vol;
        if (window.XMPlayer&&XMPlayer.gainNode) {
            XMPlayer.gainNode.gain.value=0.1*vol;
        }
        this.setAudioVolume(musicPlaying,vol);
    }

    this.playAudio=(sample,loop,volume,force)=>{
        if (this.audioInitialize()&&sample&&this.audioEnabled&&(this.effectsEnabled||force)&&audioContext) {
            if (sample.mod) {
                XMPlayer.stop();
                XMPlayer.load(sample.mod);
                XMPlayer.play();
                audioPlaying[sample.id]="mod";
            } else {
                loop=!!loop;
                this.stopAudio(sample);
                var sound={
                    id:sample.id,
                    gain:audioContext.createGain(),
                    source: audioContext.createBufferSource(),
                    ended:false
                }
                sound.gain.connect(audioOut);
                sound.gain.gain.value=volume||settings.volume;
                sound.source.buffer = sample.buffer;
                sound.source.loop=loop;
                if (sample.properties.pitchStart!==undefined)
                    sound.source.playbackRate.value=sample.properties.pitchStart+(sample.properties.pitchRange*Math.random());
                sound.source.onended=()=>{ sound.ended=true; }
                if (loop&&(sample.properties.loopStart!==undefined)) {
                    sound.source.loopStart=sample.properties.loopStart;
                    sound.source.loopEnd=sample.properties.loopEnd;
                }
                sound.source.connect(sound.gain);
                sound.source.start(0);
                audioPlaying[sample.id]=sound;
            }
        }
    }

    this.playMusic=(sample,force)=>{
        if (force||(sample!=musicPlaying)) {
            if (this.audioInitialize()) {
                this.stopMusic();
                if (this.musicEnabled) this.playAudio(sample,true,settings.musicVolume,true);
                musicPlaying=sample;
            }
        }
    }

    this.stopMusic=(dontforget)=>{
        if (this.audioInitialize()) {
            this.stopAudio(musicPlaying)
            if (!dontforget) musicPlaying=0;
        }
    }
    
    this.replayMusic=()=>{
        if (this.audioInitialize())
            this.playMusic(musicPlaying,true);
    }

    this.stopEffects=()=>{
        if (this.audioInitialize()) {
            for (var a in audioPlaying)
                if (!musicPlaying||(audioPlaying[a].id!=musicPlaying.id))
                    this.stopAudio(audioPlaying[a]);
        }
    }

    this.stopAllAudio=()=>{
        if (this.audioInitialize()) {
            for (var a in audioPlaying)
                this.stopAudio(audioPlaying[a]);
        }
    }

    this.stopAudio=(sample)=>{
        if (this.audioInitialize()) {
            if (audioPlaying[sample.id]=="mod") {
                XMPlayer.stop();
            } else if (audioPlaying[sample.id]) {
                let playing=audioPlaying[sample.id];
                playing.source.stop(0);
                playing.gain.disconnect();
                playing.source.disconnect();
                audioPlaying[sample.id]=0;
            }
        }
    }

    this.setAudioEnabled=(state)=>{
        this.audioEnabled=state;
        this.stopAllAudio();
    }

    this.audioInitialize=()=>{
        if (!this.audioEnabled||ready) return true;
        else {
            if (window.XMPlayer)
                XMPlayer.init();
            if (window.AudioContext)
                audioContext=new window.AudioContext();
            else if (window.webkitAudioContext)
                audioContext=new window.webkitAudioContext();
            if (audioContext) {
                ready=true;
                audioOut=audioContext.createGain();
                audioOut.connect(audioContext.destination);
                audioOut.gain.value=0.9;
            }
            return false;
        }
    }

    this.load=(cb)=>{
        loadAudio(cb);
    }

}
