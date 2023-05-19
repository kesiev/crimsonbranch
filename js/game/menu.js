function Menu(storageid,version,language,player,namegenerator,ui) {

    const
        NAMEMINLENGTH=3,
        NAMEMAXLENGTH=16;

    let
        config,
        heroInputs,
        events,
        menu,
        logo,
        optionsAreaBox,
        optionsBox;

    function loadConfig() {
        if (localStorage && localStorage[storageid])
            config=JSON.parse(localStorage[storageid]);
        else
            config={
                musicEnabled:true,
                sfxEnabled:true,
                lastHeroName:generateHeroName(),
                printLastHeroNames:[
                    generateHeroName(),
                    generateHeroName()
                ]
            };
        applyConfig();
    }

    function saveConfig() {
        localStorage[storageid] = JSON.stringify(config);
    }

    function applyConfig() {
        saveConfig();
        player.setMusic(config.musicEnabled);
        player.setEffects(config.sfxEnabled);
    }

    function cleanHeroName(name) {
        name=name.toLowerCase().replace(/[^a-z]/g,"");
        return name.substr(0,1).toUpperCase()+name.substr(1,name.length);
    }

    function isHeroNameValid(name) {
        return name && (name.length>=NAMEMINLENGTH) && (name.length<=NAMEMAXLENGTH);
    }

    function generateHeroName() {
        return namegenerator.generate("heroName");
    }

    function renderMenu(empty,options) {
        let nodes={};
        if (empty) optionsBox.innerHTML="";
        options.forEach(option=>{
            let node=ui.addNode(optionsBox,"div",{ className:"option", innerHTML:option.label });
            node.onclick=option.callback;
            if (option.id) nodes[option.id]=node;
        })
        return nodes;
    }

    function playMenu() {
        player.playAudio(player.audio.beads);
        optionsBox.innerHTML="";
        let
            optionNodes,
            nameIsValid=false,
            currentHeroName=config.lastHeroName,
            settingsPanel=ui.newPanel("play",optionsBox);
        settingsPanel.newText(language.translate("menuEnterHeroName"))
        let
            nameInput=ui.addNode(settingsPanel.content,"input",{ className:"name", value:currentHeroName });
            randomName=ui.addNode(settingsPanel.content,"div",{ className:"button", innerHTML:language.translate("menuRandomName") });
        nameInput.setAttribute("maxLength",NAMEMAXLENGTH);
        nameInput.setAttribute("spellCheck",false);
        nameInput.onkeyup=()=>{
            currentHeroName = cleanHeroName(nameInput.value);
            nameIsValid=isHeroNameValid(currentHeroName);
            if (nameIsValid)
                optionNodes.start.className="option";
            else
                optionNodes.start.className="option disabled";
        }
        nameInput.onchange=()=>{
            nameInput.value=cleanHeroName(nameInput.value);
            nameInput.onkeyup();
        }
        randomName.onclick=()=>{
            player.playAudio(player.audio.beads);
            currentHeroName=generateHeroName();
            nameInput.value=currentHeroName;
            nameInput.onkeyup();
        }
        optionNodes = renderMenu(false,[
            { id:"start", label:language.translate("menuStartNewGame"), callback:()=>{
                if (nameIsValid) {
                    config.lastHeroName=cleanHeroName(currentHeroName);
                    saveConfig();
                    player.playAudio(player.audio.levelup);
                    player.stopMusic();
                    ui.fadeOutDisplay(()=>{
                        events.startGame(config,config.lastHeroName);
                    })
                } else
                    player.playAudio(player.audio.pick);
            }},
            { label:language.translate("menuBack"), callback:mainMenu }
        ]);
        nameInput.onkeyup();
    }

    function creditsMenu() {
        player.playAudio(player.audio.beads);
        optionsBox.innerHTML="";
        let settingsPanel=ui.newPanel("credits",optionsBox);
        settingsPanel.newText(events.getCredits());
        optionNodes = renderMenu(false,[
            { label:language.translate("menuBack"), callback:mainMenu }
        ]);
    }

    function validateHeroInputs() {
        let
            invalidCount=0,
            validCount=0;
        heroInputs.forEach(input=>{
            let
                trimmedInput=input.value.trim(),
                name=cleanHeroName(input.value);
            if (trimmedInput)
                if (isHeroNameValid(name))
                    validCount++;
                else
                    invalidCount++;
        });
        return validCount && !invalidCount;
    }

    function printMenu() {
        player.playAudio(player.audio.beads);
        heroInputs=[];
        optionsBox.innerHTML="";
        let
            optionNodes,
            randomName,
            nameIsValid=false,
            settingsPanel=ui.newPanel("print",optionsBox);
        settingsPanel.newText(language.translate("menuEnterHeroNames"));
        for (let i=0;i<2;i++) {
            let nameInput=ui.addNode(settingsPanel.content,"input",{ className:"name", value:config.printLastHeroNames[i] });
            nameInput._id=i;
            nameInput.setAttribute("maxLength",NAMEMAXLENGTH);
            nameInput.setAttribute("spellCheck",false);
            nameInput.onkeyup=()=>{
                nameIsValid=validateHeroInputs();
                if (nameIsValid)
                    optionNodes.print.className="option";
                else
                    optionNodes.print.className="option disabled";
            }
            nameInput.onchange=()=>{
                heroInputs.forEach(input=>{
                    input.value=cleanHeroName(input.value);
                })
                heroInputs[0].onkeyup();
            }
            heroInputs.push(nameInput);
        };
        randomName=ui.addNode(settingsPanel.content,"div",{ className:"button", innerHTML:language.translate("menuRandomNames") });
        randomName.onclick=()=>{
            player.playAudio(player.audio.beads);
            heroInputs.forEach(input=>{
                input.value=generateHeroName();
            });
            heroInputs[0].onkeyup();
        }
        optionNodes = renderMenu(false,[
            { id:"print", label:language.translate("menuDownloadSheetPdf"), callback:()=>{
                if (nameIsValid) {
                    let
                        heroNames=[],
                        filename="";
                    heroInputs.forEach((input,id)=>{
                        let name=cleanHeroName(input.value);
                        if (name) {
                            heroNames.push(name);
                            filename+=name+"-";
                            config.printLastHeroNames[id]=name;
                        } else config.printLastHeroNames[id]="";
                    });
                    saveConfig();
                    if (heroNames.length) {
                        player.playAudio(player.audio.equip);
                        filename=filename.substr(0,filename.length-1);
                        events.printSheet(filename,heroNames);
                    }
                } else
                    player.playAudio(player.audio.pick);
            }},
            { label:language.translate("menuDownloadManualPdf"), callback:()=>{
                player.playAudio(player.audio.equip);
                events.printManual();
            }},
            { label:language.translate("menuBack"), callback:mainMenu }
        ]);
        heroInputs[0].onkeyup();
    }

    function mainMenu() {
        player.playAudio(player.audio.beads);
        renderMenu(true,[
            { label:language.translate("menuPlay"), callback:playMenu },
            { label:language.translate("menuPrint"), callback:printMenu },
            { label:language.translate("menuTutorial"), callback:()=>{
                player.playAudio(player.audio.levelup);
                player.stopMusic();
                ui.fadeOutDisplay(()=>{
                    events.startTutorial(config)
                })
            } },
            { label:language.translate("menuSettings"), callback:settingsMenu },
            { label:language.translate("menuCredits"), callback:creditsMenu },
        ]);
    }

    function settingsMenu() {
        player.playAudio(player.audio.beads);
        renderMenu(true,[
            { label:config.musicEnabled?language.translate("menuDisableMusic"):language.translate("menuEnableMusic"), callback:()=>{
                config.musicEnabled=!config.musicEnabled;
                applyConfig();
                settingsMenu();
            } },
            { label:config.sfxEnabled?language.translate("menuDisableSfx"):language.translate("menuEnableSfx"), callback:()=>{
                config.sfxEnabled=!config.sfxEnabled;
                applyConfig();
                settingsMenu();
            } },
            { label:language.translate("menuSetFullScreen"), callback:()=>{
                ui.gotoFullScreen();
            } },
            { label:language.translate("menuChangeLanguage"), callback:()=>{
                language.setNextLanguage();
                settingsMenu();
            } },
            { label:language.translate("menuBack"), callback:mainMenu }
        ]);
    }

    this.setEvents=(newevents)=>{
        events=newevents;
    }

    this.start=()=>{
        player.playMusic(player.audio.title);
        ui.clearDisplay();
        menu=ui.newContainer("menu");
        ui.addNode(menu.node,"div",{ className:"background" });
        optionsAreaBox=ui.addNode(menu.node,"div",{ className:"optionsarea" });
        optionsBox=ui.addNode(optionsAreaBox,"div",{ className:"options" });
        logo=ui.addNode(menu.node,"div",{ className:"logo" });
        ui.addNode(menu.node,"div",{ className:"footer", innerHTML:version });
        mainMenu();
        ui.fadeInDisplay();
        setTimeout(()=>{
            logo.className="logo show";
        },100);
    }

    loadConfig();
    
}
