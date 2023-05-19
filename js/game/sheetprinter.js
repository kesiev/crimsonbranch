function SheetPrinter(svg) {

    const
        DEBUG=false,
        GRAY="#cccccc",
        BLACK="#000000",
        TIMEBARFONT={
            modelId:"mediumText",
            wordSpacing:1,
            lineSpacing:1,
            horizontalAlignment:"right",
            verticalAlignment:"center",
            textGap:0.9
        },
        SPECIALSFONT={
            modelId:"mediumText",
            wordSpacing:0.5,
            lineSpacing:-0.5,
            horizontalAlignment:"center",
            verticalAlignment:"top",
            textGap:0.9
        },
        LEVELFONT={
            modelId:"mediumText",
            wordSpacing:0,
            lineSpacing:0,
            horizontalAlignment:"center",
            verticalAlignment:"center",
            textGap:0.9
        },
        INPUTBOXFONT={
            modelId:"smallText",
            wordSpacing:0.3,
            lineSpacing:0,
            horizontalAlignment:"center",
            verticalAlignment:"bottom",
            textGap:0
        },
        ENEMYBOXFONT={
            modelId:"smallText",
            wordSpacing:0.3,
            lineSpacing:0,
            horizontalAlignment:"center",
            verticalAlignment:"center",
            textGap:0
        },
        BOARDFONT={
            modelId:"largeText",
            wordSpacing:0.5,
            lineSpacing:-1,
            horizontalAlignment:"right",
            verticalAlignment:"center",
            textGap:0.9
        };

    const P=new Printer(svg,DEBUG);

    function printHeader(x,y,width,text,minitext) {
        let
            height=4,
            printOut=P.richPrint({
                modelId:"mediumText",
                wordSpacing:0.5,
                lineSpacing:1,
                horizontalAlignment:"left",
                verticalAlignment:"center",
                textGap:0.9
            },x+1,y,width-2,height,text);
        if (minitext) {
            P.richPrint({
                modelId:"smallText",
                wordSpacing:0.5,
                lineSpacing:1,
                horizontalAlignment:"left",
                verticalAlignment:"center",
                textGap:0.2
            },x+1.5+printOut.right,y,width-2-printOut.right,height,minitext);
        }
        P.addRect({x:x,y:y,width:width,height:height},GRAY,1,printOut.firstNode);
    }

    function drawSmallGrid(x,y,width,height,cellmeasure,spacing,cornercolor,color) {
        let cellDelta=cellmeasure+spacing;
        for (let cy=0;cy<height;cy++) {
            for (let cx=0;cx<width;cx++)
                P.addRect({x:x+(cx*cellDelta),y:y+(cy*cellDelta),width:cellmeasure,height:cellmeasure},(cx==0)&&(cy==0)?cornercolor:color,1,"gridCell");
        }
    }

    function addInputBox(inputboxMeasure,x,y,label) {
        P.cloneNodeBy(0,"inputBox",0,x,y);
        P.richPrint(
            INPUTBOXFONT,
            x,y+inputboxMeasure.height-4,inputboxMeasure.width,3,label
        );
    }

    this.getSvg=()=>{
        return svg.getSVG();
    }

    this.print=(language,footer,model)=>{
       const
       
            PAGEWIDTH=148.5,
            PAGEHEIGHT=210,
            FRAMESIZE=5,
            SEPARATORSIZE=0.5,

            TIMELABELSPACING=4,
            TIMEBOXSIZE=5,
            TIMELABELDELTA=(TIMEBOXSIZE-SEPARATORSIZE)/4,
            SMALLGRIDSIZE=1,
            SMALLGRIDDELTAX=1,
            SMALLGRIDDELTAY=2,
            SMALLGRIDMARGIN=0.5,

            TIMEDISTANCE=0.83,
            TIMESEPARATORWIDTH=2,

            TITLEX=0,
            TITLEY=0,

            GRIDX=6.5,
            GRIDY=6.5,
            GRIDYAFTER=GRIDY+114.3,
            GRIDMARGIN=0;

            LEVELGRIDX=36,
            LEVELGRIDY=GRIDYAFTER,
            LEVELGRIDMARGIN=LEVELGRIDY+35,
            LEVELDISTANCE=1,
            LEVELBOXSIZE=5,
            LEVELSEPARATORHEIGHT=0.5,
            LEVELROWGAP=8.9,
            LEVELYAFTER=GRIDYAFTER+32,

            EQUIPMENTX=0,
            EQUIPMENTY=GRIDYAFTER,
            EQUIPMENTDISTANCE=1,

            ENEMYMODELSX=36,
            ENEMYMODELSY=LEVELYAFTER,
            ENEMYMODELSDISTANCE=1,
            ENEMYMODELSCOUNT=6,
            ENEMYMODELAFTER=ENEMYMODELSY+27,

            SPECIALSX=LEVELGRIDX,
            SPECIALSY=ENEMYMODELAFTER,

            LINEWIDTH=0.45,

            BOARDENEMIES=7,
            BOARDENEMIESSPACING=0.59;

        let
            sideSymbolMeasure=P.measureNodeById("stairsSymbol"),
            skillBoxMeasure=P.measureNodeById("skillBox"),
            enemyModelMeasure=P.measureNodeById("enemyModel2"),
            inputboxMeasure=P.measureNodeById("inputBox"),
            symbolMeasure=P.measureNodeById("attackSymbol"),
            checkboxMeasure=P.measureNodeById("checkbox"),
            cellMeasure=P.measureNodeById("gridCell"),
            corridorMeasure=P.measureNodeById("corridorCell"),
            spareBoxMeasure=P.measureNodeById("spareBox"),
            healthTrackerMeasure=P.measureNodeById("healthTracker"),
            smallCellDelta=SMALLGRIDSIZE+SMALLGRIDMARGIN,
            cellInnerSize=cellMeasure.width-GRIDMARGIN*2,
            halfCell=cellInnerSize/2,
            cellGap=cellMeasure.width+corridorMeasure.width-(LINEWIDTH*2),
            joinGap=(corridorMeasure.width-symbolMeasure.width)/2+0.5,
            corridorDelta=(cellMeasure.width-corridorMeasure.width)/2,
            levelBoxGap=(LEVELBOXSIZE-SEPARATORSIZE)/2,
            side=true,ox,oy,fx,fy,
            gridX,gridY,
            timeX,timeY,
            levelX,levelY,levelBarMargin,
            equipmentX,equipmentY,
            specialsX,specialsY,
            titleX,titleY,
            enemyModelsX, enemyModelsY;
        model.forEach(section=>{
            if (side) {
                fx=0;
                fy=0;
                side=false;
            } else {
                fx=PAGEWIDTH;
                fy=0;
                side=true;
            }
            ox=fx+FRAMESIZE;
            oy=fy+FRAMESIZE;
            gridX=ox+GRIDX;
            gridY=oy+GRIDY;
            timeX=ox+PAGEWIDTH-FRAMESIZE*2-checkboxMeasure.width,
            timeY=oy;
            levelX=ox+LEVELGRIDX;
            levelY=oy+LEVELGRIDY;
            levelBarMargin=levelX+85;
            equipmentX=ox+EQUIPMENTX;
            equipmentY=oy+EQUIPMENTY;
            specialsX=ox+SPECIALSX;
            specialsY=oy+SPECIALSY;
            titleX=ox+TITLEX;
            titleY=oy+TITLEY;
            enemyModelsX=ox+ENEMYMODELSX;
            enemyModelsY=oy+ENEMYMODELSY;
            if (DEBUG) {
                P.addRect({x:fx,y:fy,width:PAGEWIDTH,height:FRAMESIZE},"#ff0000",0.1,"gridCell");
                P.addRect({x:fx,y:fy,width:FRAMESIZE,height:PAGEHEIGHT},"#ff0000",0.1,"gridCell");
                P.addRect({x:fx,y:fy+PAGEHEIGHT-FRAMESIZE,width:PAGEWIDTH,height:FRAMESIZE},"#ff0000",0.1,"gridCell");
                P.addRect({x:fx+PAGEWIDTH-FRAMESIZE,y:fy,width:FRAMESIZE,height:PAGEHEIGHT},"#ff0000",0.1,"gridCell");
            }
            if (section.grid) {

                // Draw title
                printHeader(titleX,titleY,126,section.name+" "+language.translate("printThe")+" "+section.role," "+language.translate("printVs")+" "+section.bossName+" "+language.translate("printHeroNotes"));
            
                // Draw tree
                section.grid.forEach((row,y)=>{
                    row.forEach((cell,x)=>{
                        let
                            cellX=gridX+(x*cellGap),
                            cellY=gridY+(y*cellGap);
                            
                        P.cloneNodeBy(0,"gridCell",0,cellX,cellY);
                        
                        if (cell.connections.right) {
                            let
                                corridorX=cellX+cellMeasure.width-LINEWIDTH,
                                corridorY=cellY+corridorDelta;
                            for (let k in cell.connections.right.direction.stats)
                                symbol=k+"Symbol";
                            P.cloneNodeBy(0,"corridorCell",0,corridorX,corridorY);
                            P.cloneNodeBy(0,symbol,0,corridorX+joinGap,corridorY+joinGap);
                        }

                        if (cell.connections.down) {
                            let
                                corridorX=cellX+corridorDelta,
                                corridorY=cellY+cellMeasure.height-LINEWIDTH;
                            for (let k in cell.connections.down.direction.stats)
                                symbol=k+"Symbol";
                            P.cloneNodeBy(0,"corridorCell",0,corridorX,corridorY);
                            P.cloneNodeBy(0,symbol,0,corridorX+joinGap,corridorY+joinGap);
                        }

                        let symbols=[];
                        for (let k in cell.skill)
                            for (let i=0;i<cell.skill[k];i++)
                                symbols.push(k+"Symbol");
                        if (cell.pearls)
                            for (let i=0;i<cell.pearls;i++)
                                symbols.push("pearlSymbol");
                        if (cell.specials)
                            for (let i=0;i<cell.specials;i++)
                                symbols.push("specialSymbol");

                        switch (symbols.length) {
                            case 0:{
                                break;
                            }
                            case 1:{
                                P.cloneNodeBy(0,symbols[0],0,cellX+GRIDMARGIN+(cellInnerSize-symbolMeasure.width)/2,cellY+GRIDMARGIN+(cellInnerSize-symbolMeasure.height)/2);
                                break;
                            }
                            case 2:{
                                P.cloneNodeBy(0,symbols[0],0,cellX+GRIDMARGIN+(halfCell-symbolMeasure.width)/2,cellY+GRIDMARGIN+(cellInnerSize-symbolMeasure.height)/2);
                                P.cloneNodeBy(0,symbols[1],0,cellX+GRIDMARGIN+halfCell+(halfCell-symbolMeasure.width)/2,cellY+GRIDMARGIN+(cellInnerSize-symbolMeasure.height)/2);
                                break;
                            }
                            case 3:{
                                P.cloneNodeBy(0,symbols[0],0,cellX+GRIDMARGIN+(halfCell-symbolMeasure.width)/2,cellY+GRIDMARGIN+(halfCell-symbolMeasure.height)/2);
                                P.cloneNodeBy(0,symbols[1],0,cellX+GRIDMARGIN+halfCell+(halfCell-symbolMeasure.width)/2,cellY+GRIDMARGIN+(halfCell-symbolMeasure.height)/2);
                                P.cloneNodeBy(0,symbols[2],0,cellX+GRIDMARGIN+(cellInnerSize-symbolMeasure.width)/2,cellY+GRIDMARGIN+halfCell+(halfCell-symbolMeasure.height)/2);
                                break;
                            }
                            case 4:{
                                P.cloneNodeBy(0,symbols[0],0,cellX+GRIDMARGIN+(halfCell-symbolMeasure.width)/2,cellY+GRIDMARGIN+(halfCell-symbolMeasure.height)/2);
                                P.cloneNodeBy(0,symbols[1],0,cellX+GRIDMARGIN+halfCell+(halfCell-symbolMeasure.width)/2,cellY+GRIDMARGIN+(halfCell-symbolMeasure.height)/2);
                                P.cloneNodeBy(0,symbols[2],0,cellX+GRIDMARGIN+(halfCell-symbolMeasure.width)/2,cellY+halfCell+GRIDMARGIN+(halfCell-symbolMeasure.height)/2);
                                P.cloneNodeBy(0,symbols[3],0,cellX+GRIDMARGIN+halfCell+(halfCell-symbolMeasure.width)/2,cellY+GRIDMARGIN+halfCell+(halfCell-symbolMeasure.height)/2);
                                break;
                            }
                            default:{
                                debugger;
                            }
                        }
    
                        let
                            sideSymbols=[],
                            emptySide=0,
                            ox,oy;

                        if (cell.start)
                            sideSymbols.push("entranceSymbol");
                        else if (cell.isDeadEnd)
                            sideSymbols.push("stairsSymbol");

                        if (sideSymbols.length) {
                            ox=cellX-sideSymbolMeasure.width/2;
                            oy=cellY-sideSymbolMeasure.height/2;
                            sideSymbols.forEach(symbol=>{
                                P.cloneNodeBy(0,symbol,0,ox,oy);
                                oy+=sideSymbolMeasure.height;
                            })

                        }
                    });
                });

                // Draw time/area gauge

                printHeader(timeX-9,timeY,11.5,language.translate("printTime"));
                timeY+=5+TIMELABELDELTA;

                section.time.forEach((timesection,id)=>{
                    P.addRect({x:timeX-TIMESEPARATORWIDTH,y:timeY,width:TIMESEPARATORWIDTH+checkboxMeasure.width,height:SEPARATORSIZE},BLACK,1,"gridCell");
                    P.richPrint(
                        TIMEBARFONT,
                        timeX-TIMESEPARATORWIDTH-checkboxMeasure.width-TIMELABELSPACING,
                        timeY-TIMELABELDELTA*2,
                        TIMEBOXSIZE,TIMEBOXSIZE,id+1
                    );
                    timeY+=SEPARATORSIZE+TIMEDISTANCE;
                    drawSmallGrid(
                        timeX-SMALLGRIDDELTAX-timesection.range[0]*smallCellDelta+SMALLGRIDMARGIN,
                        timeY+SMALLGRIDDELTAY,
                        timesection.range[0], timesection.range[1],
                        SMALLGRIDSIZE,
                        SMALLGRIDMARGIN,
                        GRAY,BLACK
                    );
                    for (let i=0;i<timesection.duration;i++) {
                        P.cloneNodeBy(0,"checkbox",0,timeX,timeY);
                        timeY+=checkboxMeasure.height+TIMEDISTANCE;
                    }
                    
                });

                // Draw levels

                printHeader(levelX,levelY,90,language.translate("printLevelSkillPoints"),language.translate("printNewLevelNotes", { growthRatio:section.growthRatio }));
                levelY+=5;

                let
                    levelYcursor=levelY,
                    levelXcursor=levelX;
                for (let level=1;level<=section.maxLevel;level++) {
                    let
                        points=level==1?section.startingPoints:section.pointsPerLevel,
                        levelbox={x:levelXcursor,y:levelYcursor,width:LEVELBOXSIZE,height:LEVELBOXSIZE};

                    for (let i=0;i<points;i++) {
                        P.cloneNodeBy(0,"checkbox",0,levelXcursor,levelYcursor+LEVELSEPARATORHEIGHT+LEVELBOXSIZE);
                        levelXcursor+=checkboxMeasure.width+LEVELDISTANCE;
                    }

                    P.addRect({x:levelXcursor,y:levelYcursor+LEVELBOXSIZE,width:SEPARATORSIZE,height:checkboxMeasure.height+LEVELSEPARATORHEIGHT},BLACK,1,"gridCell");
                    P.cloneNodeBy(0,level==1?"largeCheckboxChecked":"largeCheckbox",0,levelXcursor-levelBoxGap,levelYcursor);
                    P.richPrint(
                        LEVELFONT,
                        levelXcursor-levelBoxGap,levelYcursor,LEVELBOXSIZE,LEVELBOXSIZE,level
                    );

                    levelXcursor+=SEPARATORSIZE+LEVELDISTANCE;

                    if (levelXcursor>levelBarMargin) {
                        levelXcursor=levelX+checkboxMeasure.width+LEVELDISTANCE;
                        levelYcursor+=LEVELROWGAP;
                    }

                }

                // Draw equipment
                [
                    [ language.translate("printStats"),language.translate("printStartNotes", { startingXpHp:section.startingXpHp }  ) , [ language.translate("printHp"), language.translate("printHpXpMax"), language.translate("printXp") ] ],
                    [ language.translate("printMagicItem"),language.translate("printMagicItemNotes"), [ language.translate("printDice1"), language.translate("printDice2"), language.translate("printQuality") ] ],
                    [ language.translate("printStrengthItem"),language.translate("printStrengthItemNotes"), [ language.translate("printDice1"), language.translate("printDice2"), language.translate("printQuality") ] ],
                    [ language.translate("printDexterityItem"),language.translate("printDexterityItemNotes"), [ language.translate("printDice1"), language.translate("printDice2"), language.translate("printQuality") ] ],
                    [ language.translate("printVitalityItem"),language.translate("printVitalityItemNotes"), [ language.translate("printDice1"), language.translate("printDice2"), language.translate("printQuality") ] ]
                ].forEach(stat=>{
                    let
                        equipmentXcursor=equipmentX,
                        gap=inputboxMeasure.width+EQUIPMENTDISTANCE;
                    printHeader(equipmentX,equipmentY,35,stat[0],stat[1]);
                    equipmentY+=5;
                    stat[2].forEach(substat=>{
                        addInputBox(inputboxMeasure,equipmentXcursor,equipmentY,substat);
                        equipmentXcursor+=gap;
                    });
                    equipmentY+=inputboxMeasure.height+EQUIPMENTDISTANCE;
                });

                // Specials

                printHeader(specialsX,specialsY,102.5,language.translate("printDiceSpecial"),language.translate("printDiceSpecialNotes"));
                specialsY+=5;
                let
                    gapX=(skillBoxMeasure.width-symbolMeasure.width)/2,
                    gapY=skillBoxMeasure.height-symbolMeasure.height;

                [
                    "defense",
                    "attack",
                    0,
                    "range",
                    "heal"
                ].forEach(skill=>{
                    if (skill) {
                        let text=section.specials[skill]?section.specials[skill].description:"";
                        P.cloneNodeBy(0,"skillBox",0,specialsX,specialsY);
                        P.cloneNodeBy(0,skill+"Symbol",0,specialsX+gapX,specialsY+gapY);
                        P.richPrint(
                            SPECIALSFONT,
                            specialsX+1,specialsY+1,skillBoxMeasure.width-2,skillBoxMeasure.height-2,text
                        );
                        specialsX+=skillBoxMeasure.width+1;
                    } else {
                        P.cloneNodeBy(0,"spareBox",0,specialsX,specialsY);
                        P.richPrint(
                            SPECIALSFONT,
                            specialsX+1,specialsY+1,spareBoxMeasure.width-2,spareBoxMeasure.height-2,language.translate("printNeutral")
                        );
                        specialsX+=spareBoxMeasure.width+1;
                    }
                })

                // Enemy models

                let enemyModelsXCursor=enemyModelsX;
                printHeader(enemyModelsX,enemyModelsY,102.5,language.translate("printEnemies"),language.translate("printEnemiesNotes"));
                enemyModelsY+=5;
                for (let i=1;i<=ENEMYMODELSCOUNT;i++) {
                    P.cloneNodeBy(0,"enemyModel2",0,enemyModelsXCursor,enemyModelsY);
                    P.richPrint(ENEMYBOXFONT, enemyModelsXCursor+5.1,enemyModelsY+6.2,6.65,3.5,language.translate("printShield"));
                    P.richPrint(ENEMYBOXFONT, enemyModelsXCursor+11.65,enemyModelsY+6.2,11,3.5,language.translate("printHp"));
                    P.richPrint(ENEMYBOXFONT, enemyModelsXCursor+22.65,enemyModelsY+6.2,11,3.5,language.translate("printStrength"));
                    if (i%3==0) {
                        enemyModelsXCursor=enemyModelsX;
                        enemyModelsY+=enemyModelMeasure.height+ENEMYMODELSDISTANCE;
                    } else {
                        enemyModelsXCursor+=enemyModelMeasure.width+ENEMYMODELSDISTANCE;
                    }
                    
                }

                let label=P.cloneNodeBy(0,"sideNotes",0,ox,oy-0.5);
                label.childNodes[2].setAttribute("transform","rotate(-90)");
                label.childNodes[2].childNodes[0].innerHTML=footer;
            } else if (section.board) {
                for (let i=0;i<BOARDENEMIES;i++) {
                    P.cloneNodeBy(0,"healthTracker",0,ox,oy);
                    oy+=healthTrackerMeasure.height+BOARDENEMIESSPACING;
                }
                P.cloneNodeBy(0,"defenseTracker",0,ox,oy);
                oy+=healthTrackerMeasure.height+BOARDENEMIESSPACING;
                [
                    language.translate("printHp"),
                    language.translate("printHpXpMax"),
                    language.translate("printXp"),
                ].forEach(label=>{
                    P.cloneNodeBy(0,"numberTracker",0,ox,oy);
                    P.richPrint(
                        BOARDFONT,
                        ox,
                        oy,
                        healthTrackerMeasure.height-4,healthTrackerMeasure.height,label
                    );
                    oy+=healthTrackerMeasure.height+BOARDENEMIESSPACING;
                })
            }
    });

}

}
