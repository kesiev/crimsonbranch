function Game() {

    const
        CURRENTYEAR=(new Date().getFullYear()),
        GAMEYEAR=2023,
        FOOTERYEAR=CURRENTYEAR == GAMEYEAR ? GAMEYEAR : GAMEYEAR+"-"+CURRENTYEAR,
        GAMENAME="Dungeons of Crimsonbranch",
        GAMEVERSION="v0.1",
        GAMECODE="Crimsonbranch-"+GAMEVERSION,
        GAMESTORAGE="_CRIMSONBRANCH",
        GAMESTORAGELANGUAGE="_CRIMSONBRANCH_LANG",
        GAMEAUTHORNAME="KesieV",
        GAMEAUTHORURL="https://www.kesiev.com/",
        GAMESHORTPLAYURL="www.kesiev.com/crimsonbranch",
        GAMEPLAYURL="https://"+GAMESHORTPLAYURL,
        GAMESHORTSOURCESURL="github.com/kesiev/crimsonbranch",
        GAMESOURCESURL="https://"+GAMESHORTSOURCESURL,
        GAMEPRINTFOOTER=GAMENAME+" "+GAMEVERSION+" - (c) "+FOOTERYEAR+" by KesieV - "+GAMESHORTPLAYURL+" - "+GAMESHORTSOURCESURL,
        GAMECREDITSMUSIC=[
            {
                songs:[
                    {
                        name: "Demon Lord",
                        url: "https://opengameart.org/content/demon-lord"
                    }
                ],
                name:"Scrabbit"
            },{
                songs:[
                    {
                        name: "Dark Quest",
                        url: "https://opengameart.org/content/dark-quest"
                    },{
                        name:"Intrigue",
                        url:"https://opengameart.org/content/intrigue"
                    }
                ],
                name:"Alexandr Zhelanov"
            }
        ],
        GAMECREDITSMUSICLICENSE="<a target='_blank' href='https://creativecommons.org/licenses/by/4.0/'>CC-BY 4.0</a>",
        GAMECREDITSSFX="<a target='_blank' href='https://opengameart.org/content/100-cc0-sfx'>rubberduck</a> &dash; <a target='_blank' href='https://opengameart.org/content/fantasy-sound-effects-tinysized-sfx'>Vehicle</a> &dash; <a target='_blank' href='https://opengameart.org/content/rpg-sound-pack'>artisticdude</a> &dash; <a target='_blank' href='https://opengameart.org/content/big-scary-troll-sounds'>Darsycho</a> &dash; <a target='_blank' href='https://creativecommons.org/publicdomain/zero/1.0/'>CC0</a>",
        GAMECREDITSTHANKS="<a target='_blank' href='http://www.linearkey.net/'>Bianca</a>, Preuk";

    let
        player=new AudioPlayer([
            { id:"equip", file:"audio/effects/equip" },
            { id:"unequip", file:"audio/effects/unequip" },
            { id:"diceroll", file:"audio/effects/diceroll" },
            { id:"attack", file:"audio/effects/attack" },
            { id:"range", file:"audio/effects/range" },
            { id:"skillpoint", file:"audio/effects/skillpoint" },
            { id:"heal", file:"audio/effects/heal" },
            { id:"defense", file:"audio/effects/defense" },
            { id:"hit", file:"audio/effects/hit" },
            { id:"pick", file:"audio/effects/pick" },
            { id:"xp", file:"audio/effects/xp" },
            { id:"enter", file:"audio/effects/enter" },
            { id:"kill", file:"audio/effects/kill" },
            { id:"spell", file:"audio/effects/spell" },
            { id:"loot", file:"audio/effects/loot" },
            { id:"wound", file:"audio/effects/wound" },
            { id:"levelup", file:"audio/effects/levelup" },
            { id:"die", file:"audio/effects/die" },
            { id:"open", file:"audio/effects/open" },
            { id:"boss", file:"audio/effects/boss" },
            { id:"beads", file:"audio/effects/beads" },
            { id:"roar", file:"audio/effects/roar"},
            { id:"breakshield", file:"audio/effects/breakshield"},
            { id:"bossfight", file:"audio/music/demonlord"},
            { id:"ingame", file:"audio/music/darkquest"},
            { id:"title", file:"audio/music/intrigue"},
        ],{});

        // Load resources

        let
            language=new Language(GAMESTORAGELANGUAGE,GAMENAME),
            randomizer=new Randomizer(-1),
            namegenerator=new NameGenerator(randomizer),
            ui=new UI();

        language.initialize(()=>{

            ui.newContainer("loading",language.translate("loading"));

            player.load(()=>{
    
                ui.fadeOutDisplay(()=>{
    
                    let menu=new Menu(GAMESTORAGE,GAMEVERSION,language,player,namegenerator,ui);
                
                    function testPrintSheet() {
                        let template=new SVGTemplate("svg/model.svg","l",true);
                        template.load(()=>{
                            let
                                rnd=new Randomizer(-1),
                                nameGenerator=new NameGenerator(rnd),
                                svg=new SVG(template),
                                paperPrinter=new SheetPrinter(svg),
                                generator=new Generator(language,nameGenerator.generate("heroName")),
                                data=generator.getData();
                            paperPrinter.print(language,GAMEPRINTFOOTER,[
                                data,{ board:true }
                            ]);
                            svg.finalize();
                            page=document.createElement("div");
                            page.style.display="inline-block";
                            page.style.backgroundColor="#fff";
                            page.className="page";
                            page.innerHTML=paperPrinter.getSvg();
                            document.getElementsByClassName("display")[0].appendChild(page);
                            ui.fadeInDisplay();
                            // svg.downloadSVG("test.svg");
                            // svg.downloadPDF("test.pdf");
                        })
                            
                    }
    
                    function testPrintManual(id) {
                        let template=new SVGTemplate("svg/manual.svg","p",true);
                        template.load(()=>{
                            let
                                svg=new SVG(template),
                                book=new PDFBook(),
                                paperPrinter=new ManualPrinter(book,svg);
                            paperPrinter.print(language,GAMENAME,GAMEPLAYURL);
                            page=document.createElement("div");
                            page.style.display="inline-block";
                            page.style.backgroundColor="#fff";
                            page.className="page";
                            page.innerHTML=book.getPage(id);
                            document.getElementsByClassName("display")[0].appendChild(page);
                            ui.fadeInDisplay();
                            // book.downloadPDF(GAMECODE+"-manual.pdf");
                        })
                            
                    }
        
                    // return testPrintSheet(0);
        
                    menu.setEvents({
                        getCredits:()=>{
                            let musicCredits=[];
                            GAMECREDITSMUSIC.forEach(author=>{
                                let songs=[];
                                author.songs.forEach(song=>{
                                    songs.push("<a target='_blank' href='"+song.url+"'>"+song.name+"</a>")
                                });
                                musicCredits.push(songs.join(", ")+" "+language.translate("creditsBy")+" "+author.name);
                            });
                            return "<h1>"+GAMENAME+"</h1>"+
                                "<h2>"+language.translate("creditsHead", { gameVersion: GAMEVERSION, gameSourcesUrl:GAMESOURCESURL, gamePlayUrl:GAMEPLAYURL })+"</h2>"+
                                "<p>"+language.translate("creditsHead2", { authorUrl: GAMEAUTHORURL, authorName:GAMEAUTHORNAME })+"</p>"+
                                "<p>"+language.translate("creditsMusic", { creditsMusic: musicCredits.join(" &dash; ")+" &dash; "+GAMECREDITSMUSICLICENSE })+"</p>"+
                                "<p>"+language.translate("creditsSfx", { creditsSfx: GAMECREDITSSFX })+"</p>"+
                                "<p>"+language.translate("creditsThanks", { creditsThanks: GAMECREDITSTHANKS })+"</p>";
                        },
                        startGame:(config,heroName)=>{
                            let
                                gameplayer=new Player(language,player,ui,heroName,false,()=>{
                                    menu.start();
                                });
                            gameplayer.play();
                        },
                        startTutorial:(config)=>{
                            let
                                gameplayer=new Player(language,player,ui,"Tutorial",true,()=>{
                                    menu.start();
                                });
                            gameplayer.play();
                        },
                        printSheet:(filename,heroNames)=>{
                            let template=new SVGTemplate("svg/model.svg",'l',true);
                            template.load(()=>{
                                let
                                    svg=new SVG(template),
                                    paperPrinter=new SheetPrinter(svg),
                                    model=[];
                                heroNames.forEach(name=>{
                                    let generator=new Generator(language,name);
                                    model.push(generator.getData());
                                });
                                while (model.length<2)
                                    model.push({board:true});
                                paperPrinter.print(language,GAMEPRINTFOOTER,model);
                                svg.finalize();
                                svg.downloadPDF(GAMECODE+"-"+filename+".pdf");
                            });
                        },
                        printManual:(filename,heroNames)=>{
                            let template=new SVGTemplate("svg/manual.svg",'p',true);
                            template.load(()=>{
                                let
                                    svg=new SVG(template),
                                    book=new PDFBook(),
                                    paperPrinter=new ManualPrinter(book,svg);
                                paperPrinter.print(language,GAMENAME,GAMEPLAYURL);
                                book.downloadPDF(GAMECODE+"-manual.pdf");
                            });
                        }
                    });
        
                    menu.start();
    
                })
    
            });
        });


}