function Language(saveroot,gamename) {

    const DEFAULTLANGUAGE="EN";
    let
        breakCache=true,
        currentLanguage=0,
        translations,
        languages=[],
        languagesSequence=[],
        toLoad=[];

    let loadFile=(cb)=>{
        if (toLoad.length) {
            let entry=toLoad.pop();
            const xmlhttp = new XMLHttpRequest();
            if (cb)
                xmlhttp.onreadystatechange = ()=>{
                    if (xmlhttp.readyState == 4)
                        if ((xmlhttp.status == 200) || (xmlhttp.status == 0)) {
                            this.languages[entry.language][entry.key]=xmlhttp.responseText;
                            loadFile(cb);
                        }
                    else cb();
                };
            xmlhttp.open("GET", entry.file+(breakCache?"?"+Math.random():""), true);
            xmlhttp.send();
        } else cb();
    }

    this.getDefaultLanguage=function() {
        var
            language=DEFAULTLANGUAGE,
            userLang = navigator.language || navigator.userLanguage;
        if (userLang) {
            userLang=userLang.split("-")[0].toUpperCase();
            if (this.languages[userLang]) language=userLang;
        }
        return language;
    }

    this.setLanguage=(language)=>{
        if (this.languages[language])
            currentLanguage=language;
        else
            currentLanguage=this.getDefaultLanguage();
        localStorage[saveroot]=currentLanguage;
        translations=this.languages[currentLanguage];
    }

    this.setNextLanguage=()=>{
        let pos=(languagesSequence.indexOf(currentLanguage)+1) % languagesSequence.length;
        this.setLanguage(languagesSequence[pos]);
    }

    this.initialize=(cb)=>{
        for (let k in Language.languages) {
            this.languages[k]={};
            let language=Language.languages[k];
            for (let h in language) {
                let text=language[h];
                if (text.substr(0,1) == "@")
                    toLoad.push({language:k, key:h, file:text.substr(1)});
                else {
                    text=text.replace(/\{glyph ([^}]+)\}/g,(m,a)=>"<div class='glyph' style='background-image:url(\"images/"+a+".svg\")'>#</div>");
                    text=text.replace(/\{highlight\}/g,"<span class='highlight'>");
                    text=text.replace(/\{\/highlight\}/g,"</span>");
                    text=text.replace(/\{gamename\}/g,gamename);
                    this.languages[k][h]=text;
                }
            }
            languages.push({ id:k, name:this.languages[k].name });
        }
        languages.sort((a,b)=>{
            if (a.name<b.name) return -1;
            else if (a.name>b.name) return 1;
            else return 0;
        });
        languagesSequence=languages.map(language=>language.id);

        if (localStorage[saveroot])
            this.setLanguage(localStorage[saveroot]);
        else
            this.setLanguage(this.getDefaultLanguage());

        loadFile(cb);
    }

    this.translate=(k,placeholders)=>{
        let translation=translations[k];
        if (translation === undefined) {
            console.warn("Missing translation: "+k+" ("+currentLanguage+")");
            return "["+k+"]";
        } else {
            if (placeholders)
                for (let k in placeholders)
                    translation=translation.replaceAll("{{"+k+"}}",placeholders[k]);
            return translation;
        }
    }

    this.languages={};

}

Language.languages={};