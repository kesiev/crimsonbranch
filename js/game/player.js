function Player(language,player,ui,seed,tutorialMode,onEnd) {

    const
        ENEMIESPRIORITIES={
            attack:0,
            range:1,
            heal:2,
            defense:3
        },
        ITEMSMETADATA={
            strength:[
                { label: language.translate("itemStrength0") },
                { label: language.translate("itemStrength1") },
                { label: language.translate("itemStrength2") },
                { label: language.translate("itemStrength3") },
                { label: language.translate("itemStrength4") },
                { label: language.translate("itemStrength5") }
            ],
            dexterity:[
                { label: language.translate("itemDexterity0") },
                { label: language.translate("itemDexterity1") },
                { label: language.translate("itemDexterity2") },
                { label: language.translate("itemDexterity3") },
                { label: language.translate("itemDexterity4") },
                { label: language.translate("itemDexterity5") }
            ],
            magic:[
                { label: language.translate("itemMagic0") },
                { label: language.translate("itemMagic1") },
                { label: language.translate("itemMagic2") },
                { label: language.translate("itemMagic3") },
                { label: language.translate("itemMagic4") },
                { label: language.translate("itemMagic5") }
            ],
            vitality:[
                { label: language.translate("itemVitality0") },
                { label: language.translate("itemVitality1") },
                { label: language.translate("itemVitality2") },
                { label: language.translate("itemVitality3") },
                { label: language.translate("itemVitality4") },
                { label: language.translate("itemVitality5") }
            ]
        },
        ENEMIESMETADATA={
            attack:[
                { label: language.translate("enemyAttack0"), avatar:"attack" },
                { label: language.translate("enemyAttack1"), avatar:"attack" },
                { label: language.translate("enemyAttack2"), avatar:"attack" },
                { label: language.translate("enemyAttack3"), avatar:"attack" },
                { label: language.translate("enemyAttack4"), avatar:"attack" },
                { label: language.translate("enemyAttack5"), avatar:"attack" }
            ],
            range:[
                { label: language.translate("enemyRange0"), avatar:"range" },
                { label: language.translate("enemyRange1"), avatar:"range" },
                { label: language.translate("enemyRange2"), avatar:"range" },
                { label: language.translate("enemyRange3"), avatar:"range" },
                { label: language.translate("enemyRange4"), avatar:"range" },
                { label: language.translate("enemyRange5"), avatar:"range" }
            ],
            defense:[
                { label: language.translate("enemyDefense0"), avatar:"defense" },
                { label: language.translate("enemyDefense1"), avatar:"defense" },
                { label: language.translate("enemyDefense2"), avatar:"defense" },
                { label: language.translate("enemyDefense3"), avatar:"defense" },
                { label: language.translate("enemyDefense4"), avatar:"defense" },
                { label: language.translate("enemyDefense5"), avatar:"defense" }
            ],
            heal:[
                { label: language.translate("enemyHeal0"), avatar:"heal" },
                { label: language.translate("enemyHeal1"), avatar:"heal" },
                { label: language.translate("enemyHeal2"), avatar:"heal" },
                { label: language.translate("enemyHeal3"), avatar:"heal" },
                { label: language.translate("enemyHeal4"), avatar:"heal" },
                { label: language.translate("enemyHeal5"), avatar:"heal" }
            ]
        },
        TUTORIALMAP={
            heroClass:0,
            heroStartingPoints:0,
            specialMoves:{
                attack:0,
                range:0,
                heal:0,
                defense:0
            },
            evilName:language.translate("tutorialTheGreatEvil"),
            path:[
                { x:0, y:0, skill:{heal:1}, direction:{x:1, y:0, type:2}},
                { x:0, y:0, skill:{range:1}, direction:{x:0, y:1, type:1}},
                { x:0, y:1, skill:{attack:1}, direction:{x:0, y:2, type:0}},
                { x:0, y:1, skill:{defense:1}, direction:{x:1, y:1, type:3}},
                { x:0, y:2, skill:{attack:1}, direction:{x:0, y:3, type:0}},
                { x:0, y:2, skill:{attack:1}, direction:{x:1, y:2, type:0}, deadEnd:true},
                { x:5, y:5, skill:{defense:1}, direction:{x:4, y:5, type:3}},
                { x:4, y:5, skill:{defense:1}, direction:{x:4, y:4, type:3}},
            ],
            pearls:[
                {x:0,y:0},
                {x:3,y:2},
                {x:2,y:4},
                {x:4,y:5}
            ],
            specials:[
                {x:1,y:1}
            ]
        },
        TUTORIALBORDER=2,
        TUTORIALMARGIN=10,
        TUTORIALSPACING=5,
        TUTORIALMARGIN2=TUTORIALMARGIN*2;

    function rollDie() {
        if (tutorialMode && tutorialDice.length)
            return tutorialDice.shift();
        return 1+Math.floor(Math.random()*6);
    }

    // Game logic

    function isCellInGrid(x,y) {
        return (x>=0)&&(x<data.width)&&(y>=0)&&(y<data.height);
    }

    function getCell(x,y) {
        if (isCellInGrid(x,y))
            return data.grid[y]?data.grid[y][x]:false;
        else
            return false;
    }

    function killPlayer() {
        player.playAudio(player.audio.die);
        playerPosition=0;
        playerStats.health.value=playerStats.health.max;
        updateStats();
        endCombatUi(true);
    }

    function loseHp(amount) {
        playerStats.health.value-=amount;
        player.playAudio(player.audio.wound);
        if (playerStats.health.value<=0) {
            playerStats.health.value=0;
            killPlayer();
            return true;
        } else
            updateStats();
    }

    function gainHp(amount) {
        player.playAudio(player.audio.heal);
        playerStats.health.value+=amount;
        if (playerStats.health.value>playerStats.health.max)
            playerStats.health.value = playerStats.health.max;
        updateStats();
    }

    function dealEnemyDamage(id,amount) {
        let
            enemy=playerPosition.enemies.list[id],
            result = {};
        enemy.health-=amount;
        if (playerPosition.enemies.list[id].health<=0) {
            player.playAudio(player.audio.kill);
            result.isDead=true;
            playerPosition.enemies.list.splice(id,1);
            let
                quality=Math.min(enemy.strength,data.time.length)-1,
                range=data.time[quality].range,
                stat=data.skills[enemy.skill].stat,
                statData=data.stats[stat];
            playerPosition.drop.push({
                icon:statData.icon,
                stat:stat,
                quality:quality+1,
                range:range,
                xp:enemy.strength,
                metadata:ITEMSMETADATA[statData.id][Math.min(quality,ITEMSMETADATA[statData.id].length-1)]
            });
            redrawField();
            if (playerPosition.enemies.list.length == 0 )
                result.isEnded = true;
        } else {
            result.isAlive = true;
            animateField();
        }
        return result;
    }
    
    function gainXp(amount) {
        player.playAudio(player.audio.xp);
        playerStats.xp.value+=amount;
        if (playerStats.xp.value>=playerStats.xp.max) {
            if (playerStats.level.value<data.maxLevel) {
                showMessage(1,language.translate("uiLevelUp"),"levelup");
                player.playAudio(player.audio.levelup);
                playerStats.health.max+=data.growthRatio;
                playerStats.points.value+=data.pointsPerLevel;
                playerStats.level.value++;
                playerStats.xp.value=0;
                playerStats.xp.max+=data.growthRatio;
            } else playerStats.xp.value=playerStats.xp.max;
            updateSkillPoints();
        }
        updateStats();
    }

    function getCellActions(cell) {
        let actions=[];
        for (let k in cell.skill)
            for (let i=0;i<cell.skill[k];i++)
                actions.push(k);
        if (cell.specials)
            for (let i=0;i<cell.specials;i++)
                actions.push("special");
        return actions;
    }

    function isConnectionPurchasable(fromcell,connection) {
        return fromcell.owned || connection.toCell.owned;
    }

    function cellIsInItem(cell,item) {
        return (
            (
                (cell.x>=item.s1-1) &&
                (cell.x<=item.s1-2+item.range[0]) &&
                (cell.y>=item.s2-1) &&
                (cell.y<=item.s2-2+item.range[1])
            )||(
                (cell.x>=item.s2-1) &&
                (cell.x<=item.s2-2+item.range[0]) &&
                (cell.y>=item.s1-1) &&
                (cell.y<=item.s1-2+item.range[1])
            )
        )
    }

    function unequipItem(stat) {
        let
            oldItem=playerInventory[stat];
        if (oldItem.item) {
            if (oldItem.item.atDirection !== undefined) {
                let direction=data.directions[oldItem.item.atDirection];
                direction.equipped=false;
                direction.cell1.equipped--;
                direction.cell2.equipped--;
            }
            oldItem.item=0;
            updateInventory();
            updateSkillPoints();
        }
    }

    function calculateAttack() {
        let attack=0;
        playerPosition.enemies.list.forEach(enemy=>{
            attack+=enemy.strength;
        });
        return attack;
    }

    function calculateDefense() {
        return playerPosition.action.defense;
    }

    function calculateHeal() {
        return playerPosition.action.heal;
    }

    function calculateEnemyHeal() {
        let heal=0;
        playerPosition.enemies.list.forEach(enemy=>{
            if (enemy.skill=="heal")
                heal+=enemy.strength;
        });
        return heal;
    }

    function calculateDamage() {
        let damage=calculateAttack()-calculateDefense();
        return damage > 0 ? damage : 0;
    }

    function performAction(id) {
        switch (id) {
            case "special":{
                // Find the 6 die
                let
                    specialSkill = playerPosition.specialReady,
                    diceSet = playerPosition.dice[specialSkill],
                    sixDice = -1;
                if (diceSet)
                    sixDice = diceSet.indexOf(6);
                // If any...
                if (sixDice != -1) {
                    let special=data.specials[playerPosition.specialReady];
                    playerPosition.action[specialSkill]-=6;
                    playerPosition.specialReady=0;
                    playerPosition.diceLeft++;
                    diceSet.splice(sixDice,1);
                    player.playAudio(player.audio.spell);
                    switch (special.id) {
                        case "heal":{
                            gainHp(special.heal);
                            break;
                        }
                        case "removedefense":{
                            playerPosition.enemies.list.forEach(enemy=>{
                                if (!special.to||(special.to.indexOf(enemy.skill)!=-1))
                                    enemy.defended=false;
                            });
                            updateField();
                            break;
                        }
                        case "dealdamage":{
                            for (let i=0;i<playerPosition.enemies.list.length;i++)
                                if (!special.to||(special.to.indexOf(playerPosition.enemies.list[i].skill)!=-1))
                                    if (dealEnemyDamage(i,special.damage).isDead)
                                        i--;
                            break;
                        }
                    }
                }
                break;
            }
            default:{
                player.playAudio(player.audio[id]);
                if (playerPosition.dicePosition == "neutral") {
                    playerPosition.dicePosition = id;
                    playerPosition.dice[id].push(playerPosition.diceValue);
                    playerPosition.action[id]+=playerPosition.diceValue;
                } else if (playerPosition.dicePosition == id) {
                    playerPosition.diceValue++;
                    playerPosition.action[id]++;
                    playerPosition.dice[id][playerPosition.dice[id].length-1]=playerPosition.diceValue;
                } else {
                    let dice=playerPosition.dice[playerPosition.dicePosition].pop();
                    playerPosition.action[playerPosition.dicePosition]-=dice;
                    playerPosition.dice[id].push(dice);
                    playerPosition.dicePosition = id;
                    playerPosition.action[id]+=dice;
                }
                if (playerPosition.diceValue >= 6) {
                    playerPosition.specialReady=playerPosition.dicePosition;
                    if (playerPosition.diceLeft) {
                        playerPosition.diceLeft--;
                        playerPosition.dicePosition="neutral";
                        playerPosition.diceValue=rollDie();
                        playerPosition.diceRolled=true;
                        player.playAudio(player.audio.diceroll);
                        showMessage(0,language.translate("uiNewDice"));
                    } else
                        setActionMode();
                }
                break;
            }
        }
    }
    
    function equipItem(item) {
        itemPosition = item;
        itemPosition.isEquipping = true;
        updateInventory();
        updateTree();
        updateSkillPoints();
    }

    function passTime() {
        playerStats.time.value++;
        if (playerStats.time.value>=playerStats.time.max) {
            if (playerStats.time.step<data.time.length-1) {
                playerStats.time.step++;
                let time=data.time[playerStats.time.step];
                playerStats.enemyRange.range=time.range;
                playerStats.time.max=time.duration;
                playerStats.time.value=0;
                playerStats.time.duration=0;
            } else playerStats.time.value=playerStats.time.max;
        }
        updateStats();
    }

    function activateCell(x,y) {
        let
            cell=getCell(x,y),
            cellActions=getCellActions(cell);
        eventTreeLeave();
        playerPosition.cells.push(cell);
        if (cellActions.length == 1) {
            treePosition=0;
            dicePreview=0;
            performAction(cellActions[0]);
            updateTree();
            updateDiceSlot();
            animateField();
        } else {
            skillSelector=cellActions;
            skillSelectorMandatory=true;
            showSkillSelector();
        }
    }

    function getJoin(direction) {
        if (!direction.owned) {
            player.playAudio(player.audio.skillpoint);
            direction.owned=true;
            direction.cell1.owned=true;
            direction.cell2.owned=true;
            playerStats.points.value--;
            eventTreeJoinLeave();
            treeJoinPosition=0;
            for (let k in direction.stats)
                playerSheet[k]++;
            updateTree();
            updateSkillPoints();
            if (statsOpened) redrawCharacterSheet();
        }
    }

    function performCellAction(skillId) {
        let skill = skillSelector[skillId];
        skillSelector.splice(skillId,1);
        skillSelectorMandatory=false;
        eventSkillLeave();
        dicePreview=0;
        performAction(skill);
        updateDiceSlot();
        animateField();
        if (!skillSelector.length)
            eventSkillDoneClick();
        else
            updateSkillSelector();
    }

    function discardItem() {
        eventDiscardItemLeave();
        gainXp(1);
        itemPosition=0;
        updateSkillPoints();
        updateTree();
        updateInventory();
        animateField();
        checkEndContext();
        if (statsOpened) {
            redrawCharacterSheet();
            enableStats();
        }
    }

    function reequipItem(itemId) {
        let
            item=playerInventory[itemId],
            toEquip=item.item;
        if (item.item) {
            player.playAudio(player.audio.unequip);
            unequipItem(itemId);
            equipItem(toEquip);
            clearHintboxSentence(1);
            if (statsOpened) {
                redrawCharacterSheet();
                disableStats();
            }
        }
    }

    function removeEnemyDefense(enemyId,stat) {
        if (playerPosition.enemies.list[enemyId].defended && (playerPosition.action[stat]>=playerPosition.enemyDefense)) {
            player.playAudio(player.audio.breakshield);
            playerPosition.enemies.list[enemyId].defended=false;
            playerPosition.action[stat]-=playerPosition.enemyDefense;
            redrawField();
            setActionMode();
        }
    }

    function identifyItem(dropId) {
        let
            drop = playerPosition.drop[dropId];

        player.playAudio(player.audio.pick);
        player.playAudio(player.audio.diceroll);
        drop.s1=rollDie();
        drop.s2=rollDie();

        drop.isEquipping=true;
        itemPosition=drop;
        playerPosition.drop.splice(dropId,1);

        eventDropLeave();
        redrawField();
        updateTree();
        updateSkillPoints();
        updateInventory();
        moreClick();
    }

    function gainPearl() {
        if (pearlsLeft) {
            player.playAudio(player.audio.pick);
            pearlsLeft--;
            if (pearlsLeft<0) pearlsLeft=0;
            if (pearlsLeft==0) evilAvailable=true;
        }
    }

    function xpItem(dropId) {
        let drop = playerPosition.drop[dropId];
        player.playAudio(player.audio.pick);
        eventDropXpLeave();
        gainXp(drop.xp);
        playerPosition.drop.splice(dropId,1);
        if (drop.pearl) {
            playerPosition.cell.pearls--;
            gainPearl();
            updateStats();
            redrawTree();
            redrawMap();
            hideMap();
        }
        redrawField();
        checkEndContext();
    }

    // --- Game flow

    function startBattle(x,y,width,height,isevil) {
        passTime();
        eventMapLeave();
        // Visit the selected position
        let enemies=getEnemyArea(x,y,width,height);
        enemies.list.forEach(enemy=>{
            if (isevil)
                enemy.metadata={ label:data.bossName, avatar:"evil" };
            else
                enemy.metadata=ENEMIESMETADATA[enemy.skill][Math.min(enemy.strength,ENEMIESMETADATA[enemy.skill].length)-1];
            enemy.priority=ENEMIESPRIORITIES[enemy.skill];
        });
        enemies.list.sort((a,b)=>{
            if (a.priority < b.priority) return -1;
            else if (a.priority > b.priority) return 1;
            else if (a.strength > b.strength) return -1;
            else if (a.strength < b.strength) return 1;
            else return 0;
        });
        playerPosition={
            isEvil:isevil,
            cell:getCell(x,y),
            done:false,
            enemies:enemies,
            attacking:false,
            drop:[]
        };
        for (let i=0;i<playerPosition.cell.pearls;i++)
            playerPosition.drop.push({icon:"pearl",pearl:true,skills:playerPosition.enemies.skills,quality:playerPosition.enemies.size,xp:playerPosition.enemies.size});
        if (isevil) {
            player.playAudio(player.audio.roar);
            player.playMusic(player.audio.bossfight);
        } else {
            player.playMusic(player.audio.ingame);
            player.playAudio(player.audio.enter);
        }
        prepareNextTurn();
        hideMap();
        updateCombatUi();
        disableStats();
    }

    function setActionMode() {
        playerPosition.phase=1;
        hideSkillSelector();
        updateDiceSlot();
        updateTree();
        setHintboxTopic(language.translate("uiPhaseFight"));
        setHintboxSentence(0,language.translate("uiPhaseFightDescription"));
    }

    function pass() {
        let
            damage=calculateDamage(),
            heal=calculateHeal(),
            enemyHeal=calculateEnemyHeal();
        if (damage && loseHp(damage))
            return;
        if (heal)
            gainHp(heal);
        if (playerPosition.enemies.list.length == 0)
            endBattle();
        else {
            if (enemyHeal)
                playerPosition.enemies.list.forEach(enemy=>{
                    enemy.health+=enemyHeal;
                    if (enemy.health>enemy.strength)
                        enemy.health=enemy.strength;
                })
            prepareNextTurn();
            updateCombatUi();
        }
    }

    function attackEnemy(enemyId,stat,amount) {
        if ((!playerPosition.enemies.list[enemyId].defended || !playerPosition.enemyDefense) && (playerPosition.action[stat]>=amount)) {
            playerPosition.action[stat]-=amount;
            let attack=dealEnemyDamage(enemyId,1);
            player.playAudio(player.audio.hit);
            if (!attack.isEnded)
                setActionMode();
            updateDiceSlot();
        }
    }

    function checkEndContext() {
        if (!playerPosition.done && (playerPosition.enemies.list.length == 0) && (playerPosition.drop.length ==0)) {
            playerPosition.done=true;
            endCombatUi();
            return true;
        }
    }

    function endBattle() {
        player.playAudio(player.audio.loot);
        playerPosition.phase=10;
        hideSkillSelector();
        setHintboxTopic(language.translate("uiPhaseLoot"));
        setHintboxSentence(0,language.translate("uiPhaseLootDescription"));
        updateDiceSlot();
        updateTree();
        redrawField();
        updateInventory();
        checkEndContext();
    }

    function gameEnd() {
        gameRunning=false;
        ui.removeEvent(window,"resize",eventWindowResize);
        ui.removeEvent(window,"keydown",eventWindowKeydown);
        player.stopMusic();
        ui.fadeOutDisplay(onEnd);
    }

    // --- Turn
    
    function prepareNextTurn() {
        player.playAudio(player.audio.diceroll);
        playerPosition.played=false;
        playerPosition.diceValue=rollDie();
        playerPosition.diceRolled=true;
        playerPosition.dicePosition="neutral";
        playerPosition.diceLeft=1;
        playerPosition.specialReady=0;
        playerPosition.dice={};
        playerPosition.action={};
        playerPosition.cells=[];
        playerPosition.phase=0;
        playerPosition.enemyDefense=0;
        for (let k in data.skills) {
            playerPosition.dice[k]=[];
            playerPosition.action[k]=0;
        }
        playerPosition.enemies.list.forEach(enemy=>{
            if (enemy.skill=="defense")
                playerPosition.enemyDefense+=enemy.strength;
            else
                enemy.defended=true;
        });
        setHintboxTopic(language.translate("uiPhasePrepare"),language.translate("uiPrepare"));
        setHintboxSentence(0,language.translate("uiPhasePrepareDescription"));
    }

    // --- Enemies

    function getEnemy(x,y,ox,oy,ow,oh,submap,skills,enemy) {
        let
            submapx=x-ox,
            submapy=y-oy;
        if (
            // In-map
            (x>=ox)&&(x<ox+ow)&&(y>=oy)&&(y<oy+oh)&&
            // Not in global map
            (
                !submap[submapy]||
                !submap[submapy][submapx]
            ) &&
            // Not in enemy map
            (!enemy||(
                !enemy.map[submapy] ||
                !enemy.map[submapy][submapx]
            ))
        ) {
            let
                keepOn=false,
                cell=getCell(x,y),
                skill=0,
                skillsCount=0;
            for (let k in cell.skill) {
                skill=k;
                skillsCount++;
            }
            if (cell) {
                if (enemy) {
                    for (let k in cell.skill)
                        if (enemy.cell.skill[k]) {
                            enemy.health++;
                            enemy.strength++;
                            keepOn=true;
                        };
                } else if (skillsCount == 1) {
                    if (skills.indexOf(skill)==-1) skills.push(skill);
                    enemy={skill:skill, cell:cell,health:1,strength:1,map:[]};
                    keepOn=true;
                }
            }
            if (keepOn) {
                if (skillsCount==1) {
                    if (!submap[submapy]) submap[submapy]=[];
                    submap[submapy][submapx]=true;
                }
                if (!enemy.map[submapy]) enemy.map[submapy]=[];
                enemy.map[submapy][submapx]=true;
                getEnemy(x-1,y,ox,oy,ow,oh,submap,skills,enemy);
                getEnemy(x+1,y,ox,oy,ow,oh,submap,skills,enemy);
                getEnemy(x,y-1,ox,oy,ow,oh,submap,skills,enemy);
                getEnemy(x,y+1,ox,oy,ow,oh,submap,skills,enemy);
            }
        }
        return enemy;
    }
        
    function getEnemyArea(x,y,w,h) {
        
        if (x+w>=data.width)
            w=data.width-x;

        if (y+h>=data.height)
            h=data.height-y;

        let
            areasize=w*h,
            enemies=[],
            submap=[],
            skills=[];
        for (let ex=0;ex<w;ex++)
            for (let ey=0;ey<h;ey++) {
                let enemy=getEnemy(x+ex,y+ey,x,y,w,h,submap,skills);
                if (enemy)
                    enemies.push(enemy);
            }
        return {
            skills:skills,
            size:areasize,
            list:enemies
        };
    }

    // --- Logic helpers
    
    function coordIsInRange(x,y,ox,oy,range) {
        return (
            (
                (x-ox>=0) &&
                (x-ox<range[0]) &&
                (y-oy>=0) &&
                (y-oy<range[1])
            )
        )
    }

    // Grid printer

    function printDirection(prefix,data,jointsymbols,cell,direction) {
        let
            connectionData=cell.connections[direction],
            id=connectionData?prefix+"d"+connectionData.direction.id:"none",
            html="<div _id='"+(connectionData?connectionData.direction.id:"")+"' id='"+id+"' class='"+prefix+" tablecell join "+direction+" ";
        if (connectionData) {
            html+=" valid";
            if (connectionData.direction.isCrossPath)
                html+=" crosspath";
            else
                html+=" normal";
            html+="'><div class='symbols'>";
            if (jointsymbols)
                data.stats.forEach(stat=>{
                    html+=repeatSymbol(printGlyph(stat.icon),connectionData.direction.stats[stat.id]);
                });
            else
                html+="&nbsp;";
            html+="</div>";
        } else html+=" none'>&nbsp;";
        html+="</div>";
        return html;
    }

    function repeatSymbol(symbol,times) {
        let out="";
        for (let i=0;i<times;i++)
            out+="<span class='symbol'>"+symbol+"</span>";
        return out;
    }

    function printGrid(prefix,data,jointsymbols,extras) {
        let
            grid=data.grid,
            html="<div id='"+prefix+"' class='"+prefix+" grid'>";
        for (let y=0;y<data.height;y++) {
            html+="<div class='tablerow cells'>";
            for (let x=0;x<data.width;x++) {
                let cell=getCell(x,y);
                if (x) html+=printDirection(prefix,data,jointsymbols,cell,"left");
                html+="<div _x='"+x+"' _y='"+y+"' id='"+prefix+"c"+x+"_"+y+"' class='"+prefix+" tablecell cell ";
                if (cell.start)
                    html+=" start";
                else if (cell.isDeadEnd)
                    html+=" deadend";
                else
                    html+=" normal";
                html+="'><div class='symbols'>";
                if (cell.skill)
                    for (let k in data.skills)
                        html+=repeatSymbol(printGlyph(data.skills[k].icon),cell.skill[k]);
                html+=repeatSymbol(printGlyph("pearl"),cell.pearls);
                html+=repeatSymbol(printGlyph("special"),cell.specials);
                html+="</div></div>";
            }
            html+="</div>";
            if (y<data.height-1) {
                html+="<div class='tablerow joints'>";
                for (let x=0;x<data.width;x++)
                    html+=printDirection(prefix,data,jointsymbols,getCell(x,y),"down")+(x<data.width-1?"<div class='tablecell corner'>&nbsp;</div>":"");
                html+="</div>";
            }
        }
        if (extras) html+=extras;
        html+="</div>";
       return html;
    }

    // Global UI methods

    // --- General

    function setButton(button,condition,onclick,onhover,onleave) {
        if (condition) {
            ui.setClassByNode(button,"button enabled");
            button.onclick=onclick;
            button.onmouseover=onhover;
            button.onmouseleave=onleave;
        } else {
            ui.setClassByNode(button,"button disabled");
            button.onclick=0;
            button.onmouseover=0;
            button.onmouseleave=0;
        }
    }

    // --- Glyph rendering

    function printGlyph(icon,type) {
        return "<div class='glyph' style='background-image:url(\"images/"+icon+".svg\")'>#</div>";
    }

    // --- Screen resize

    function resizeScreen() {
        if (gameRunning && doResize) {
            doResize--;
            let
                screenWidth=document.body.clientWidth,
                screenHeight=document.body.clientHeight;

            mobileVersion=(screenWidth<940)||(screenHeight<800);

            let
                grid=document.getElementById("map"),
                tree=document.getElementById("tree"),
                mapTopMargin=mobileVersion ? screenHeight*0.14 : 70,
                mapBottomMargin=mobileVersion ? 270 : 260,
                inventoryMargin=mobileVersion ? 305 : 420,
                treeWidthRatio=mobileVersion ? 1.1 : 2.5,
                mapSize=Math.min(screenWidth,screenHeight-mapTopMargin-mapBottomMargin),
                treeSize=Math.min(screenWidth/treeWidthRatio,screenHeight-inventoryMargin),
                mapLeftMargin=(screenWidth-mapSize)/2;

            grid.style.left=mapLeftMargin+"px";
            grid.style.top=mapTopMargin+"px";
            grid.style.width=mapSize+"px";
            grid.style.height=mapSize+"px";
            tree.style.width=treeSize+"px";
            tree.style.height=treeSize+"px";
            resizeTutorial();
            if (doResize)
                resizeTimer=setTimeout(resizeScreen,500);
            else
                resizeTimer=0;

            updateMoreButton();
        }
    }

    function eventWindowResize() {
        doResize=10;
        if (!resizeTimer)
            resizeScreen();
    }

    function eventWindowKeydown(e) {
        if (tutorialMode && (e.keyCode == 13)) {
            tutorialNext();
        }
    }

    function updateMoreButton() {
        if (mobileVersion) {
            if (moreButtonShow) {
                if (moreButtonMode) {
                    rightPanel.hide();
                    leftPanel.show();
                } else {
                    rightPanel.show();
                    leftPanel.hide();
                }
                moreButton.style.display="";
            } else
                moreButton.style.display="none";
        } else {
            moreButton.style.display="none";
            if (moreButtonShow) {
                rightPanel.show();
                leftPanel.show();
            }
        }
    }

    function showMoreButton() {
        moreButtonMode=0;
        moreButtonShow=true;
        updateMoreButton();
    }

    function hideMoreButton() {
        moreButtonShow=false;
        updateMoreButton();
    }

    function moreClick() {
        if (moreButtonShow)
            moreButtonMode=!moreButtonMode;
        if (mobileVersion) {
            player.playAudio(player.audio.beads);
            updateMoreButton();
        }
    }

    // --- Stats

    function disableStats() {
        charButton.style.display="none";
    }

    function enableStats() {
        charButton.style.display="";
    }

    function toggleStats() {
        if (tutorialMode) return;
        if (statsOpened)
            hideStats();
        else
            showStats();
    }

    function showStats() {
        if (!statsOpened) {
            player.playAudio(player.audio.open);
            statsOpened=true;
            showTree();
            showCharacterSheet();
            hideMap();
            showMoreButton();
        }
    }
    
    function hideStats() {
        if (statsOpened) {
            player.playAudio(player.audio.open);
            statsOpened=false;
            hideTree();
            hideCharacterSheet();
            showMap();
            hideMoreButton();
        }
    }

    function updateStats() {
        let
            pearlsLeftSide=Math.floor(pearlsLeft/2),
            pearlsRightSide=pearlsLeft-pearlsLeftSide;
        timeTopLabel.innerHTML=language.translate("uiDay");
        timeValue.innerHTML=playerStats.time.step+1;
        timeBottomLabel.innerHTML="<span class='flavourlabel'>"+language.translate("uiArea")+" </span>"+playerStats.enemyRange.range[0]+"&times;"+playerStats.enemyRange.range[1];
        timeGaugeValue.style.height=(((playerStats.time.value+1)/playerStats.time.max)*100)+"%";
        levelTopLabel.innerHTML=language.translate("uiLevel");
        levelBottomLabel.innerHTML=language.translate("uiMax")+" "+playerStats.health.max;
        levelValue.innerHTML=playerStats.level.value;
        hpGaugeBar.style.width=((playerStats.health.value/playerStats.health.max)*100)+"%";
        hpGaugeValue.innerHTML=playerStats.health.value+" "+language.translate("uiHp");
        xpGaugeBar.style.width=((playerStats.xp.value/playerStats.xp.max)*100)+"%";
        xpGaugeValue.innerHTML=playerStats.xp.value+" "+language.translate("uiXp");
        pearlDockLeft.innerHTML="";
        pearlDockRight.innerHTML="";
        for (let i=0;i<pearlsLeftSide;i++)
            pearlDockLeft.innerHTML+=printGlyph("pearl");
        for (let i=0;i<pearlsRightSide;i++)
            pearlDockRight.innerHTML+=printGlyph("pearl");
    }

    // --- Character Sheet

    function showCharacterSheet() {
        redrawCharacterSheet();
        leftPanel.show();
    }

    function redrawCharacterSheet() {
        clearContext();
        let html="<div class='header'><span class='name'>"+data.name+"<span class='role'>"+language.translate("uiThe")+" "+data.role+"</span></div>";
        data.stats.forEach((stat,id)=>{
            html+="<div class='stat'><div class='symbol'>"+printGlyph(stat.id)+"</div><div class='name'>"+language.translate("uiStat"+stat.label)+":</div><div class='value'>"+playerSheet[stat.id]+"</div><div class='bonus'>"+(playerInventory[id].item?"+1":"+0")+"</div></div>";
        })
        html+="<div class='tasksheader'>"+language.translate("uiMission")+"</div><div class='tasks";
        if (evilBeaten)
            html+=" cleared'>"+language.translate("uiWinMessage", { bossName: data.bossName }) +" "+ language.translate( finalScore == 1 ? "uiWinMessageSingle" : "uiWinMessageMultiple", { finalScore: finalScore} );
        else if (evilAvailable)
            html+="'>"+language.translate("uiImproveMessage", { bossName: data.bossName });
        else
            html+="'>"+language.translate( pearlsLeft == 1 ? "uiPearlLeftSingle" : "uiPearlLeftMultiple", { pearlsLeft: pearlsLeft, bossName:data.bossName } )
        html+="</div>";
        characterSheet.innerHTML=html;
        let button=ui.addNode(characterSheet,"div",{className:"button",innerHTML:language.translate("uiEndGame")});
        button.onclick=()=>{
            if (tutorialMode) return;
            player.playAudio(player.audio.beads);
            showTutorialBox(0,language.translate("uiEndGameConfirm"),[
                { label:language.translate("uiEndGameContinue"), callback:()=>{
                    player.playAudio(player.audio.beads);
                    hideTutorialBox();
                }  },
                { label:language.translate("uiEndGameQuit"), callback:()=>{
                    player.playAudio(player.audio.beads);
                    gameEnd();
                } },
            ]);
        }
    }

    function hideCharacterSheet() {
        leftPanel.hide();
    }

    // --- Skill tree
    
    function showTree() {
        rightPanel.show();
        updateTree();
    }

    function hideTree() {
        rightPanel.hide();
    }

    function redrawTree() {
        tree.innerHTML="<div class=treewrapper>"+printGrid("tree",data,true)+"</div>";
        updateTree();
        doResize++;
        resizeScreen();
    }

    function updateTree() {
        let
            isEquipping = itemPosition && itemPosition.isEquipping,
            range=playerStats.enemyRange.range,
            hoveringDirection=treeJoinPosition ? data.directions[treeJoinPosition.id] : 0,
            canPurchase=!skillSelector && playerStats.points.value;
        for (let y=0;y<data.height;y++)
            for (let x=0;x<data.width;x++) {

                let
                    cell=getCell(x,y);
                    className=treePosition&&(x==treePosition.x)&&(y==treePosition.y)?"selected":"",
                    isAvailable=cell.owned,
                    isSelecting=!skillSelector && playerPosition && (playerPosition.phase == 0),
                    isActive= isSelecting && (playerPosition.cells.indexOf(cell)!=-1),
                    isFirstSelection = isSelecting && !playerPosition.cells.length,
                    isSelectable=isSelecting && ( isFirstSelection ? cell.start : false);

                for (let k in cell.connections) {
                    let
                        connection=cell.connections[k],
                        direction=connection.direction,
                        isItemSelecting=itemPosition && direction.stats[data.stats[itemPosition.stat].id] && cellIsInItem(cell,itemPosition) && cellIsInItem(connection.toCell,itemPosition),
                        isDestinationActive = isSelecting && (playerPosition.cells.indexOf(connection.toCell)!=-1),
                        defaultClassName;

                    if (!isAvailable && direction.equipped && connection.toCell.owned)
                        isAvailable=true;

                    if (direction.owned || direction.equipped) {
                        if (isActive || isDestinationActive) {
                            // It has a connected exhausted node, so it's selectable
                            setTreeJointClass(cell.connections[k].direction.id,"exhausted");
                        } else {
                            // The node is just owned or equipped.
                            setTreeJointClass(cell.connections[k].direction.id,direction.owned ? "owned" : "equipped");
                        }
                        if (isDestinationActive)
                            isSelectable=true;
                    } else if (isEquipping) {
                        if (isItemSelecting)
                            setTreeJointClass(cell.connections[k].direction.id,"selectable",eventTreeEquipClick,eventTreeEquipHover,eventTreeEquipLeave);
                        else 
                            setTreeJointClass(cell.connections[k].direction.id,"disabled");
                    } else if (canPurchase && isConnectionPurchasable(cell,connection)) {
                        setTreeJointClass(cell.connections[k].direction.id,(hoveringDirection === connection.direction ? "selecting" : "")+" selectable",eventTreeJoinClick,eventTreeJoinHover,eventTreeJoinLeave);
                    } else
                        setTreeJointClass(cell.connections[k].direction.id,"disabled"+(isItemSelecting ? " selecting" : ""));
                    
                }

                let
                    defaultClassName=isAvailable ? (isActive ? "exhausted" : "") : (hoveringDirection.cell1 == cell || hoveringDirection.cell2 == cell) ? "selecting" : "disabled";

                if (itemPosition && cellIsInItem(cell,itemPosition)) defaultClassName+=" selecting";

                if (isAvailable && isSelecting && isSelectable && !isActive)
                    setTreeCellClass(x,y,className+" selectable",eventTreeClick,eventTreeHover,eventTreeLeave);
                else
                    setTreeCellClass(x,y,className+" "+defaultClassName);
               
            }
    }

    // --- Skill points box

    function updateSkillPoints() {
        if (itemPosition && itemPosition.isEquipping) {
            unequipButton.style.display="";
            pointsLeft.style.display="none";
            unequipButton.innerHTML=language.translate("uiDiscardItem", { glyph:printGlyph(data.stats[itemPosition.stat].icon) });
            unequipButton.onclick=eventDiscardItemClick;
            unequipButton.onmouseover=eventDiscardItemHover;
            unequipButton.onmouseleave=eventDiscardItemLeave;
        } else {
            unequipButton.style.display="none";
            pointsLeft.style.display="";
            pointsLeft.innerHTML=playerStats.points.value ? language.translate(playerStats.points.value == 1 ? "uiSkillPointsLeftSingle" : "uiSkillPointsLeftMultiple", { value: playerStats.points.value }) : language.translate("uiNoSkillPointsLeft");
            if (treeJoinPosition)
                ui.setClassByNode(pointsLeft,"selecting");
            else
                ui.setClassByNode(pointsLeft);
        }
    }

    // --- Left panel

    function showContext() {
        leftPanel.show();
    }

    function hideContext() {
        leftPanel.hide();
    }

    function clearContext() {
        enemiesBar.innerHTML="";
        dropBar.innerHTML="";
        characterSheet.innerHTML="";
    }

    // --- Map

    function hideMap() {
        mapPosition=0;
        for (let y=0;y<data.height;y++)
            for (let x=0;x<data.width;x++) {
                let cell=getCell(x,y);
                setMapCellClass(x,y,"disabled");
                for (let k in cell.connections)
                    setMapJointClass(cell.connections[k].direction.id,"disabled");
            }
        if (evilAvailable) {
            let evilTile=document.getElementById("evil");
            ui.setClassByNode(evilTile,"")
            evilTile.onmouseenter=0;
            evilTile.onmouseleave=0;
            evilTile.onclick=0;
        }

    }

    function showMap(playerdied,isevil) {
        updateMap();
        if (!tutorialMode) {
            setHintboxTopic(language.translate("uiPhaseExplore"), playerdied ? language.translate("uiYouDied") : ( isevil ? language.translate("uiYouWin") : 0), playerdied ? "dead" : ( isevil ? "win"  : 0));
            setHintboxSentence(0,language.translate("uiPhaseExploreDescription"));
            if (!evilBeaten && isevil && !playerdied) {
                evilBeaten=true;
                // Calculate final score
                finalScore = (data.maxLevel-playerStats.level.value) + (playerStats.time.max-playerStats.time.value);
                for (let i=playerStats.time.step+1;i<data.time.length;i++)
                    finalScore+=data.time[i].duration;

                showStats();
            }
        }
    }

    function updateMap() {
        let range=playerStats.enemyRange.range;
        for (let y=0;y<data.height;y++)
            for (let x=0;x<data.width;x++) {
                let
                    cell=getCell(x,y),
                    isCurrentPosition=playerPosition && (cell === playerPosition.cell),
                    className=(mapPosition&&(mapPosition.evil||((x==mapPosition.x)&&(y==mapPosition.y)))?"selected":"")+( isCurrentPosition ? " currentposition" : ""),
                    isAvailable=false;

                if (playerPosition)
                    isAvailable = ((playerPosition.cell.isDeadEnd || playerPosition.cell.start) && cell.start) || (cell.directions.indexOf(playerPosition.cell)!=-1);
                else
                    isAvailable=cell.start;

                if (mapPosition&&(mapPosition.evil || coordIsInRange(x,y,mapPosition.x,mapPosition.y,range)))
                    className+=" selecting";

                if (isAvailable) {
                    setMapCellClass(x,y,className+" selectable",eventMapClick,eventMapHover,eventMapLeave);
                } else {
                    setMapCellClass(x,y,className+( isCurrentPosition ? " currentposition" : " disabled" ));
                }
                for (let k in cell.connections)
                    setMapJointClass(cell.connections[k].direction.id,"disabled");
            }
        if (evilAvailable) {
            let evilTile=document.getElementById("evil");
            ui.setClassByNode(evilTile,"selectable "+(mapPosition && mapPosition.evil ? "selecting" : ""));
            evilTile.onmouseenter=eventEvilHover;
            evilTile.onmouseleave=eventEvilLeave;
            evilTile.onclick=eventEvilClick;
        }
    }

    function redrawMap() {
        let
            html=printGrid("map",data,false,evilAvailable ? "<div id='evil' class='evil'><div class='icon'></div></div>" : "");
        container.setHtml(html);
        doResize++;
        resizeScreen();
    }

    // --- Battle field

    function redrawField() {
        clearContext();
        playerPosition.enemies.list.forEach(enemy=>{
            let
                enemyBox=ui.addNode(enemiesBar,"div",{className:"enemy"}),
                enemyAvatar=ui.addNode(enemyBox,"div",{className:"avatar"}),
                enemyHealthBar=ui.addNode(enemyAvatar,"div",{className:"gauge"}),
                enemyHealthValue=ui.addNode(enemyHealthBar,"div",{className:"value"}),
                enemyHealth=ui.addNode(enemyAvatar,"div",{className:"health"}),
                enemyImage=ui.addNode(enemyAvatar,"div",{className:"image"}),
                enemyStrength=ui.addNode(enemyAvatar,"div",{className:"strength",innerHTML:printGlyph(data.skills[enemy.skill].icon)+enemy.strength}),
                enemyDefense=ui.addNode(enemyAvatar,"div",{className:"defense"}),
                enemyHeader=ui.addNode(enemyBox,"div",{className:"header"}),
                enemyButtons=ui.addNode(enemyBox,"div",{className:"buttons"});

            enemyImage.style.backgroundImage="url('images/portraits/"+enemy.metadata.avatar+".png')";
            enemy.strengthNode=enemyStrength;
            enemy.avatarNode=enemyAvatar;
            enemy.enemyNode=enemyBox;
            enemy.headerNode=enemyHeader;
            enemy.healthNode=enemyHealth;
            enemy.healthValueNode=enemyHealthValue;
            enemy.defenseNode=enemyDefense;
            enemy.buttonsNode=enemyButtons;
        })
        playerPosition.drop.forEach(drop=>{
            let
                dropBox=ui.addNode(dropBar,"div",{className:"drop"}),
                dropAvatar=ui.addNode(dropBox,"div",{className:"avatar"}),
                dropIcon=ui.addNode(dropAvatar,"div",{className:"icon",innerHTML:printGlyph(drop.icon)}),
                dropQuality=ui.addNode(dropAvatar,"div",{className:"quality",innerHTML:drop.quality}),
                dropHeader=ui.addNode(dropBox,"div",{className:"header"}),
                dropButtons=ui.addNode(dropBox,"div",{className:"buttons"});

            drop.dropNode=dropBox;
            drop.headerNode=dropHeader;
            drop.qualityNode=dropQuality;
            drop.buttonsNode=dropButtons;
        });
        playerPosition.passNode=ui.addNode(enemiesBar,"div",{className:"pass button"});
        updateField();
    }
    
    function updateField() {
        playerPosition.enemies.list.forEach((enemy,enemyId)=>{
            enemy.buttonsNode.innerHTML="";
            if (enemy.defended && playerPosition.enemyDefense) {
                enemy.defenseNode.innerHTML=printGlyph("enemydefense")+playerPosition.enemyDefense;
                enemy.defenseNode.style.display = "";
                enemy.removeDefenseAttackNode=ui.addNode(enemy.buttonsNode,"div",{className:"button",innerHTML:"-"+playerPosition.enemyDefense+printGlyph(data.skills.attack.icon)+": "+printGlyph("losedefense")});
                enemy.removeDefenseRangeNode=ui.addNode(enemy.buttonsNode,"div",{className:"button",innerHTML:"-"+playerPosition.enemyDefense+printGlyph(data.skills.range.icon)+": "+printGlyph("losedefense")});
                enemy.removeDefenseAttackNode.enemyId = enemy.removeDefenseRangeNode.enemyId = enemyId;
                enemy.removeDefenseAttackNode.stat = "attack";
                enemy.removeDefenseRangeNode.stat = "range";
            } else {
                enemy.defenseNode.style.display = "none";
                switch (enemy.skill) {
                    case "attack":{
                        enemy.attackAttackNode=ui.addNode(enemy.buttonsNode,"div",{className:"button",innerHTML:"-1"+printGlyph(data.skills.attack.icon)+": 1"+printGlyph("wound")});
                        enemy.attackAttackNode.amount=1;
                        enemy.attackRangeNode=ui.addNode(enemy.buttonsNode,"div",{className:"button",innerHTML:"-2"+printGlyph(data.skills.range.icon)+": 1"+printGlyph("wound")});
                        enemy.attackRangeNode.amount=2;
                        break;
                    }
                    case "range":{
                        enemy.attackAttackNode=ui.addNode(enemy.buttonsNode,"div",{className:"button",innerHTML:"-2"+printGlyph(data.skills.attack.icon)+": 1"+printGlyph("wound")});
                        enemy.attackAttackNode.amount=2
                        enemy.attackRangeNode=ui.addNode(enemy.buttonsNode,"div",{className:"button",innerHTML:"-1"+printGlyph(data.skills.range.icon)+": 1"+printGlyph("wound")});
                        enemy.attackRangeNode.amount=1;
                        break;
                    }
                    default:{
                        enemy.attackAttackNode=ui.addNode(enemy.buttonsNode,"div",{className:"button",innerHTML:"-1"+printGlyph(data.skills.attack.icon)+": 1"+printGlyph("wound")});
                        enemy.attackAttackNode.amount=1;
                        enemy.attackRangeNode=ui.addNode(enemy.buttonsNode,"div",{className:"button",innerHTML:"-1"+printGlyph(data.skills.range.icon)+": 1"+printGlyph("wound")});
                        enemy.attackRangeNode.amount=1;
                    }
                }
                enemy.attackAttackNode.enemyId = enemy.attackRangeNode.enemyId = enemyId;
                enemy.attackAttackNode.stat = "attack";
                enemy.attackRangeNode.stat = "range";
            }
        });
        playerPosition.drop.forEach((drop,dropId)=>{
            drop.buttonsNode.innerHTML = "";
            if (drop.pearl) {
                drop.nodes=[];
                drop.skills.forEach(skill=>{
                    let button=ui.addNode(drop.buttonsNode,"div",{className:"button",innerHTML:printGlyph("pearl")+printGlyph("convert")+printGlyph(data.skills[skill].icon)});
                    button.skill=skill;
                    button.dropId=dropId;
                    drop.nodes.push(button);
                })
                drop.xpNode=ui.addNode(drop.buttonsNode,"div",{className:"button",innerHTML:printGlyph("losepearl")+", +"+drop.quality+language.translate("uiXp")});
                drop.xpNode.dropId=dropId;
            } else {
                drop.identifyNode=ui.addNode(drop.buttonsNode,"div",{className:"button",innerHTML:language.translate("uiIdentify")});
                drop.xpNode=ui.addNode(drop.buttonsNode,"div",{className:"button",innerHTML:"+"+drop.quality+language.translate("uiXp")});
                drop.identifyNode.dropId = drop.xpNode.dropId = dropId;
            }
        });
        animateField();
    }

    function animateField(preview) {
        let
            isUnlocked = !skillSelector,
            isFree= isUnlocked && (!itemPosition || !itemPosition.isEquipping),
            battleOver = playerPosition.phase == 10,
            canPickDrop=isFree && battleOver;
            
        playerPosition.enemies.list.forEach((enemy,enemyId)=>{
            let header=enemy.metadata.label+" ("+language.translate("uiStrength")+": "+enemy.strength+", "+language.translate("uiHp")+": "+enemy.health+"/"+enemy.strength;
            if (enemy.defended && playerPosition.enemyDefense) {
                header+=", "+language.translate("uiDefense")+": "+playerPosition.enemyDefense;
                [
                    [ "attack", enemy.removeDefenseAttackNode, eventUseAttackHover, eventUseAttackLeave ],
                    [ "range", enemy.removeDefenseRangeNode, eventUseRangeHover, eventUseRangeLeave ]
                ].forEach(stat=>{
                    setButton(stat[1],isFree && (playerPosition.action[stat[0]]>=playerPosition.enemyDefense),eventRemoveEnemyDefense,stat[2],stat[3]);
                })
            } else {
                setButton(enemy.attackAttackNode,isFree && (playerPosition.action["attack"]>=enemy.attackAttackNode.amount),eventEnemyAttack,eventUseAttackHover, eventUseAttackLeave );
                setButton(enemy.attackRangeNode,isFree && (playerPosition.action["range"]>=enemy.attackRangeNode.amount),eventEnemyAttack,eventUseRangeHover, eventUseRangeLeave);
            }
            enemy.headerNode.innerHTML = header+")";
            enemy.healthNode.innerHTML = enemy.health;
            enemy.healthValueNode.style.width = ((enemy.health/enemy.strength)*100)+"%";
        });
        playerPosition.drop.forEach(drop=>{
            if (drop.pearl) {
                drop.headerNode.innerHTML="Pearl";
                drop.nodes.forEach(node=>{
                    setButton(node,canPickDrop,eventPearlPick,eventPearlHover,eventPearlLeave);
                });
                setButton(drop.xpNode,canPickDrop,eventDropXp,eventPearlXpHover,eventPearlXpLeave);
            } else {
                drop.headerNode.innerHTML=drop.metadata.label+" ("+language.translate("uiQuality")+": "+drop.quality+")";
                setButton(drop.identifyNode,canPickDrop,eventDropClick,eventDropHover,eventDropLeave);
                setButton(drop.xpNode,canPickDrop,eventDropXp,eventDropXpHover,eventDropXpLeave);
            }
        });

        if (battleOver)
            playerPosition.passNode.style.display="none";
        else {
            let text;

            playerPosition.passNode.style.display="";
            setButton(playerPosition.passNode,isUnlocked,eventPassClick,eventPassHover,eventPassLeave);

            if (playerPosition.enemies.list.length)
                text=language.translate("uiPassEnemyTurn");
            else
                text=language.translate("uiEndBattle");

            let
                sentence=[],
                damage=calculateDamage(),
                heal=calculateHeal(),
                enemyHeal=calculateEnemyHeal();

            if (damage)
                sentence.push("-"+damage+" "+language.translate("uiHp"));

            if (heal)
                sentence.push("+"+heal+" "+language.translate("uiHp"));

            if (enemyHeal)
                sentence.push(language.translate("uiAllEnemiesGainHp", { enemyHeal:enemyHeal }));

            playerPosition.passNode.innerHTML=text+(sentence.length?" ("+sentence.join(", ")+")":"");

        }
            

    }

    // --- Dice slots

    function updateDiceSlot() {
        switch (playerPosition ? playerPosition.phase : 0) {
            case 0:{
                // Skill tree management
                let
                    previewIsSpecial = dicePreview == "special",
                    diceIsNeutral = playerPosition && (playerPosition.dicePosition == "neutral"),
                    specialReady = playerPosition.specialReady,
                    keepValue = diceIsNeutral || (playerPosition.dicePosition!=dicePreview),
                    diceValue = playerPosition.diceValue + ( keepValue ? 0 : 1 );
                if (diceIsNeutral) {
                    dicePositions.neutral.style.display="";
                    dicePositions.neutral.innerHTML=playerPosition.diceValue;
                    if (dicePreview && !previewIsSpecial) dicePositions.neutral.className="slot leaving";
                    else if (playerPosition.diceRolled) {
                        playerPosition.diceRolled=false;
                        dicePositions.neutral.className="slot rolling";
                    } else dicePositions.neutral.className="slot";
                } else
                    dicePositions.neutral.style.display="none";
                if (dicePreview && (diceValue == 6))
                    if (specialReady)
                        specialReady = 0;
                    else
                        specialReady = dicePreview;
                for (let k in data.skills) {
                    let
                        id=-1,
                        isSpecialSkill = k == specialReady,
                        isPreviewSpecial = isSpecialSkill && previewIsSpecial;
                    actionPositions[k].style.display="none";
                    if (playerPosition)
                        playerPosition.dice[k].forEach(dice=>{
                            id++;
                            dicePositions[k][id].style.display="";
                            dicePositions[k][id].innerHTML=dice;
                            if (isPreviewSpecial && ( dice == 6) )
                                dicePositions[k][id].className="slot selecting leaving";
                            else
                                dicePositions[k][id].className="slot";
                        });
                    if (dicePreview)
                        if (dicePreview == k)
                            if (diceIsNeutral || (playerPosition.dicePosition!=k)) {
                                id++;
                                dicePositions[k][id].style.display="";
                                dicePositions[k][id].innerHTML=playerPosition.diceValue;
                                dicePositions[k][id].className="slot adding";
                            } else {
                                dicePositions[k][id].innerHTML=playerPosition.diceValue+1;
                                dicePositions[k][id].className="slot raising";
                            }
                        else if (!previewIsSpecial && !diceIsNeutral && (playerPosition.dicePosition == k))
                            dicePositions[k][id].className="slot leaving";
                    ui.setClassByNode(actionLabels[k].icon,id>-1 ? ( isPreviewSpecial ? "selecting" : "" ) : "disabled");
                    for (id++;id<2;id++)
                        dicePositions[k][id].style.display="none";
                    ui.setClassByNode(actionLabels[k].special,isSpecialSkill ? ( previewIsSpecial ? "selecting" : "" ) : "disabled");
                }
                break;
            }
            case 1:{
                // Performing action
                dicePositions.neutral.style.display="none";
                for (let k in data.skills) {
                    for (id=0;id<2;id++)
                        dicePositions[k][id].style.display="none";
                    if (playerPosition.action[k]>0) {
                        ui.setClassByNode(actionLabels[k].icon,"");
                        actionPositions[k].style.display="block";
                        actionPositions[k].innerHTML=playerPosition.action[k];
                    } else {
                        ui.setClassByNode(actionLabels[k].icon,"disabled");
                        actionPositions[k].style.display="none";
                    }
                    ui.setClassByNode(actionLabels[k].special,"disabled");
                }
                break;
            }
            case 10:{
                // Battle ended
                dicePositions.neutral.style.display="none";
                for (let k in data.skills) {
                    for (id=0;id<2;id++)
                        dicePositions[k][id].style.display="none";
                    actionPositions[k].style.display="none";
                    ui.setClassByNode(actionLabels[k].icon,"disabled");
                    ui.setClassByNode(actionLabels[k].special,"disabled");
                }
                break;
            }
        }
        
    }

    // --- Inventory

    function updateInventory() {
        let selectable=(!playerPosition || (playerPosition.phase>=10)) && (!itemPosition || !itemPosition.isEquipping);
        playerInventory.forEach((item,itemId)=>{
            if (item.item) {
                ui.setClassByNode(item.node,selectable ? "selectable" + ( itemPosition === item.item ? " selecting" : "" ) : "");
                item.itemTypeNode.style.display="";
                item.itemTypeNode.innerHTML=item.item.s1+"/"+item.item.s2;
                item.itemQualityNode.style.display="";
                item.itemQualityNode.innerHTML=item.item.quality;
            } else {
                ui.setClassByNode(item.node,"disabled");
                item.itemTypeNode.style.display="none";
                item.itemQualityNode.style.display="none";
            }
            if (item.item && selectable) {
                item.node.onmouseover=eventItemHover;
                item.node.onmouseleave=eventItemLeave;
                item.node.onclick=eventItemClick;
            } else {
                item.node.onmouseleave=0;
                item.node.onmouseover=0;
                item.node.onclick=0;
            }
        });
    }

    // --- Pop-up message

    function showMessage(id,text,messageclass) {
        let message=messages[id];
        if (!messageclass) messageclass="";
        if (message.timeout) clearTimeout(message.timeout);
        message.element.node.innerHTML=text;
        message.element.node.className="messages";
        message.timeout=setTimeout(function(){
            message.element.node.className="messages appear "+messageclass+" "+message.id;
        },250)
    }

    // --- Combat UI (meta)
    
    function updateCombatUi() {
        showTree();
        showContext();
        updateDiceSlot();
        redrawField();
        updateInventory();
        showMoreButton();
    }

    function endCombatUi(playerdied) {
        player.playMusic(player.audio.ingame);
        hideTree();
        hideContext();
        updateDiceSlot();
        showMap(playerdied,playerPosition.isEvil);
        enableStats();
        hideMoreButton();
    }

    // --- Skill Selector

    function updateSkillSelector() {
        skillSelectorBoxIcons.innerHTML="";
        skillSelectorButtons=[];
        skillSelector.forEach((skill,id)=>{
            let
                cell=ui.addNode(skillSelectorBoxIcons,"div",{ className:"skill selectable"}),
                symbols=ui.addNode(cell,"div",{className:"symbols"});
            cell.onclick=eventSkillClick;
            cell.onmouseover=eventSkillHover;
            cell.onmouseleave=eventSkillLeave;
            cell.skillId=id;
            switch (skill) {
                case "special":{
                    symbols.innerHTML=printGlyph("special");
                    break;
                }
                default:{
                    symbols.innerHTML=printGlyph(data.skills[skill].icon);
                    break;
                }
            }
            skillSelectorButtons.push(cell);
        })
        setButton(skillSelectorBoxButton,!skillSelectorMandatory,eventSkillDoneClick,eventSkillDoneHover,eventSkillDoneLeave)
    }

    function hideSkillSelector() {
        skillSelector=0;
        skillSelectorBox.style.display="none";
        updateTree();
        animateField();
    }

    function showSkillSelector() {
        player.playAudio(player.audio.open);
        updateTree();
        skillSelectorBoxMessage.innerHTML=language.translate("uiSelectSymbol");
        skillSelectorBoxIcons.innerHTML="";
        skillSelectorBox.style.display="";
        updateSkillSelector();
        animateField();
    }

    // --- Hintbox

    function updateHintbox() {
        let pieces=[];
        
        if (hintBoxData.topic !== undefined)
            pieces.push("<b>"+hintBoxData.topic+"</b>");

        if (hintBoxData.sentences) {
            hintBoxData.sentences.sort((a,b)=>{
                if (a.priority<b.priority)
                    return -1;
                else if (a.priority>b.priority)
                    return 1;
                else return 0;
            });
            hintBoxData.sentences.forEach(sentence=>{
                pieces.push(sentence.text);
            })
        }
        hintBox.innerHTML=pieces.join(" &dash; ");
    }

    function setHintboxTopic(topic,message,messageclass) {
        if (topic) {
            let show = !!message;
            if (topic != hintBoxData.topic) {
                show = true;
                hintBoxData.topic=topic;
            }
            if (show) showMessage(0,message || topic.toUpperCase(),messageclass);
        } else
            delete hintBoxData.topic;
        hintBoxData.sentences.length=0;
        updateHintbox();
    }

    function setHintboxSentence(priority,text) {
        hintBoxData.sentences.push({priority:priority,text:text});
        updateHintbox();
    }

    function clearHintboxSentence(priority) {
        hintBoxData.sentences=hintBoxData.sentences.filter(sentence=>sentence.priority!=priority);
        updateHintbox();
    }

    // --- Tutorial box

    function resizeTutorial() {
        if (tutorialMode && tutorialBox && tutorialBox.at) {
            let node=tutorialBox.at();
            if (node) {
            
                node.scrollIntoView();

                let
                    screenWidth=document.body.clientWidth,
                    atRect=node.getBoundingClientRect(),
                    tutorialRect=tutorialBox.box.getBoundingClientRect(),
                    markerLeft=atRect.left-TUTORIALMARGIN,
                    markerTop=atRect.top-TUTORIALMARGIN,
                    markerWidth=atRect.width+TUTORIALMARGIN2-TUTORIALBORDER,
                    markerHeight=atRect.height+TUTORIALMARGIN2-TUTORIALBORDER,
                    boxTop=markerTop-TUTORIALMARGIN-tutorialRect.height,
                    boxBottom=markerTop+markerHeight+TUTORIALMARGIN,
                    boxRight=markerLeft+markerWidth-tutorialRect.width+TUTORIALBORDER,
                    boxLeft=markerLeft;

                if (boxRight+tutorialRect.width>screenWidth-TUTORIALSPACING)
                    boxRight=screenWidth-TUTORIALSPACING-tutorialRect.width;
                if (boxRight<TUTORIALSPACING)
                    boxRight=TUTORIALSPACING;
                if (boxLeft+tutorialRect.width>screenWidth-TUTORIALSPACING)
                    boxLeft=screenWidth-TUTORIALSPACING-tutorialRect.width;
                if (boxLeft<TUTORIALSPACING)
                    boxLeft=TUTORIALSPACING;

                tutorialBox.marker.style.left=markerLeft+"px";
                tutorialBox.marker.style.top=markerTop+"px";
                tutorialBox.marker.style.width=markerWidth+"px";
                tutorialBox.marker.style.height=markerHeight+"px";
                if (boxTop<TUTORIALBORDER)
                    tutorialBox.box.style.top=boxBottom;
                else
                    tutorialBox.box.style.top=boxTop;
                if (boxRight<TUTORIALBORDER)
                    tutorialBox.box.style.left=boxLeft;
                else
                    tutorialBox.box.style.left=boxRight;

            }

        }
    }

    function hideTutorialBox() {
        if (tutorialBox) {
            tutorialBox.marker.parentNode.removeChild(tutorialBox.marker);
            tutorialBox.box.parentNode.removeChild(tutorialBox.box);
            tutorialBox=0;
        }
    }

    function showTutorialBox(at,text,buttonslist) {
        hideTutorialBox();
        if (at) {
            tutorialBox={
                at:at,
                box:ui.addNode(ui.display,"div",{ className:"tutorial context box" }),
                marker:ui.addNode(ui.display,"div",{ className:"tutorial marker" })
            };
        } else {
            let container=ui.addNode(ui.display,"div",{ className:"tutorial fullscreen" });
            tutorialBox={
                at:at,
                box:ui.addNode(container,"div",{ className:"tutorial full box" }),
                marker:container
            };
        }
        let
            content=ui.addNode(tutorialBox.box,"div",{ className:"content" }),
            buttons=ui.addNode(tutorialBox.box,"div",{ className:"buttons" });
        content.innerHTML=text;
        buttonslist.forEach(button=>{
            let node=ui.addNode(buttons,"div",{ className:"button", innerHTML:button.label });
            node.onclick=button.callback;
        });
        resizeTutorial();
    }

    // --- Tutorial flow

    function tutorialNextThen() {
        let
            step=TUTORIAL[tutorialStep],
            node=step.at,
            wait=step.wait||100,
            buttonslist=[
                { label:language.translate("tutorialEnd"), callback:gameEnd },
                { label:language.translate("tutorialNext"), callback:tutorialNext }
            ];
        if (step.execute) step.execute();
        setTimeout(()=>{
            if (tutorialDebugging)
                if (!step.tutorialDebugging)
                    tutorialNext();
                else {
                    tutorialDebugging=false;
                    showTutorialBox(node,step.text,buttonslist);
                }
            else
                showTutorialBox(node,step.text,buttonslist);
            tutorialWait=false;
        },tutorialDebugging ? 1 : wait);
    }

    function tutorialNext() {
        if (tutorialWait) return;
        tutorialWait=true;
        player.playAudio(player.audio.beads);
        hideTutorialBox();
        tutorialStep++;
        let step=TUTORIAL[tutorialStep];
        if (step) {
            if (step.clickMore) {
                if (step.clickMore) moreClick();
                if (mobileVersion)
                    setTimeout(()=>{
                        tutorialNextThen()
                    },700);
                else
                    tutorialNextThen();
            } else
                tutorialNextThen();
        } else gameEnd();
    }

    // --- Map cell setters

    function setMapCellClass(x,y,c,click,over,leave) {
        let node=ui.setClass("mapc"+x+"_"+y,c);
        if (node) {
            node.onclick=click;
            node.onmouseover=over;
            node.onmouseleave=leave;
        }
        
    }

    function setMapJointClass(id,c,click,over,leave) {
        let node=ui.setClass("mapd"+id,c,click,over,leave);
        if (node) {
            node.onclick=click;
            node.onmouseover=over;
            node.onmouseleave=leave;
        }
    }

    // --- Tree cell setters

    function setTreeCellClass(x,y,c,click,over,leave) {
        let node=ui.setClass("treec"+x+"_"+y,c);
        if (node) {
            node.onclick=click;
            node.onmouseover=over;
            node.onmouseleave=leave;
        }
        
    }

    function setTreeJointClass(id,c,click,over,leave) {
        let node=ui.setClass("treed"+id,c,click,over,leave);
        if (node) {
            node.onclick=click;
            node.onmouseover=over;
            node.onmouseleave=leave;
        }
    }

    // Events

    // --- Map cell events

    function eventEvilHover() {
        if (tutorialMode) return;
        mapPosition={evil:true};
        updateMap();
        setHintboxSentence(1,language.translate("uiSelectToChallenge", { bossName:data.bossName }));
        ui.setClassByNode(timeBox,"selecting");
    }

    function eventEvilLeave() {
        if (tutorialMode) return;
        eventMapLeave();
    }

    function eventEvilClick() {
        if (tutorialMode) return;
        startBattle(0,0,data.grid[0].length,data.grid.length,true);
    }

    function eventMapLeave() {
        if (mapPosition) {
            mapPosition=0;
            updateMap();
            ui.setClassByNode(timeBox,"");
            ui.setClassByNode(pearlDockLeft,"");
            ui.setClassByNode(pearlDockRight,"");
            clearHintboxSentence(1);
        }
    }

    function eventMapHover() {
        if (tutorialMode) return;
        let
            x=this.getAttribute("_x")*1,
            y=this.getAttribute("_y")*1;
        if (!mapPosition) mapPosition={};
        if ((mapPosition.x!=x)||(mapPosition.y!=y)) {
            mapPosition.x=x;
            mapPosition.y=y;
            updateMap();
            setHintboxSentence(1,language.translate("uiSelectToEnter"));
            ui.setClassByNode(timeBox,"selecting");
            if (data.grid[y][x].pearls) {
                ui.setClassByNode(pearlDockLeft,"selecting");
                ui.setClassByNode(pearlDockRight,"selecting");
            }

        }
    }

    function eventMapLeave() {
        if (tutorialMode) return;
        if (mapPosition) {
            mapPosition=0;
            updateMap();
            ui.setClassByNode(timeBox,"");
            ui.setClassByNode(pearlDockLeft,"");
            ui.setClassByNode(pearlDockRight,"");
            clearHintboxSentence(1);
        }
    }

    function eventMapClick() {
        if (tutorialMode) return;
        let
            x=this.getAttribute("_x")*1,
            y=this.getAttribute("_y")*1;
        startBattle(x,y,playerStats.enemyRange.range[0],playerStats.enemyRange.range[1]);
    }

    // --- Tree cell events

    function eventTreeHover() {
        if (tutorialMode) return;
        let
            x=this.getAttribute("_x")*1,
            y=this.getAttribute("_y")*1,
            cell=getCell(x,y),
            cellActions=getCellActions(cell)
        if (!treePosition) treePosition={};
        if ((treePosition.x!=x)||(treePosition.y!=y)) {
            treePosition.x=x;
            treePosition.y=y;
            if (cellActions.length==1)
                dicePreview=cellActions[0];
            updateTree();
            updateDiceSlot();
            animateField(true);
            setHintboxSentence(1,language.translate("uiSelectToActivate"));
        }
    }

    function eventTreeLeave() {
        if (tutorialMode) return;
        if (treePosition) {
            treePosition=0;
            dicePreview=0;
            updateTree();
            updateDiceSlot();
            animateField();
            clearHintboxSentence(1);
        }
    }

    function eventTreeClick() {
        if (tutorialMode) return;
        activateCell(this.getAttribute("_x")*1,this.getAttribute("_y")*1);
    }

    function eventTreeJoinHover() {
        if (tutorialMode) return;
        let
            id=this.getAttribute("_id");
        if (!treeJoinPosition) treeJoinPosition={};
        if (treeJoinPosition.id!=id) {
            treeJoinPosition.id=id;
            updateTree();
            updateSkillPoints();
            setHintboxSentence(1,language.translate("uiSelectToPay"));
        }
    }

    function eventTreeJoinLeave() {
        if (tutorialMode) return;
        if (treeJoinPosition) {
            treeJoinPosition=0;
            updateTree();
            updateSkillPoints();
            clearHintboxSentence(1);
        }
    }

    function eventTreeJoinClick() {
        if (tutorialMode) return;
        let
            id=this.getAttribute("_id"),
            direction=data.directions[treeJoinPosition.id];
        getJoin(direction);
    }

    // --- Skill selector events
    
    function eventSkillHover() {
        if (tutorialMode) return;
        let
            skillId = this.skillId,
            skill = skillSelector[skillId];

        dicePreview=skill;
        updateDiceSlot();
        animateField(true);
        setHintboxSentence(1,language.translate("uiSelectToActivateSkill"));
    }

    function eventSkillLeave() {
        if (tutorialMode) return;
        dicePreview=0;
        updateDiceSlot();
        animateField();
        clearHintboxSentence(1);
    }

    function eventSkillClick() {
        if (tutorialMode) return;
        performCellAction(this.skillId);
    }

    function eventSkillDoneHover() {
        if (tutorialMode) return;
        setHintboxSentence(1,language.translate("uiSelectToEndActivation"));
    }

    function eventSkillDoneLeave() {
        if (tutorialMode) return;
        clearHintboxSentence(1);
    }

    function eventSkillDoneClick() {
        if (tutorialMode) return;
        player.playAudio(player.audio.open);
        eventSkillDoneLeave();
        hideSkillSelector();
    }

    // --- Equipment events

    function eventTreeEquipHover() {
        if (tutorialMode) return;
        setHintboxSentence(1,language.translate("uiSelectToEquip"));
    }

    function eventTreeEquipLeave() {
        if (tutorialMode) return;
        clearHintboxSentence(1)
    }

    function equipItemJoint(id) {
        let direction=data.directions[id];
        player.playAudio(player.audio.equip);
        unequipItem(itemPosition.stat);
        itemPosition.atDirection=id;
        itemPosition.isEquipping=false;
        direction.equipped=true;
        direction.cell1.equipped++;
        direction.cell2.equipped++;
        playerInventory[itemPosition.stat].item=itemPosition;
        itemPosition=0;
        eventTreeEquipLeave();
        updateInventory();
        updateTree();
        updateSkillPoints();
        animateField();
        checkEndContext();
        if (statsOpened) {
            redrawCharacterSheet();
            enableStats();
        }
        
    }

    function eventTreeEquipClick() {
        if (tutorialMode) return;
        equipItemJoint(this.getAttribute("_id"));
    }

    // --- Pass button events
  
    function eventPassHover() {
        if (tutorialMode) return;
        ui.setClassByNode(hpGauge,"selecting");
        setHintboxSentence(1,language.translate("uiSelectToPass"));
    }

    function eventPassLeave() {
        if (tutorialMode) return;
        ui.setClassByNode(hpGauge,"");
        clearHintboxSentence(1);
    }

    function eventPassClick() {
        if (tutorialMode) return;
        eventPassLeave();
        pass();
    }

    // --- Discard item button

    function eventDiscardItemHover() {
        if (tutorialMode) return;
        setHintboxSentence(1,language.translate("uiSelectToDiscard"));
    }

    function eventDiscardItemLeave() {
        if (tutorialMode) return;
        clearHintboxSentence(1);
    }

    function eventDiscardItemClick() {
        if (tutorialMode) return;
        discardItem();
    }

    // --- Inventory item events

    function eventItemHover() {
        if (tutorialMode) return;
        let
            itemId=this.itemId,
            item=playerInventory[itemId];
        setHintboxSentence(1,language.translate("uiSelectToReEquip"));
        if (item.item && (item.item !== itemPosition)) {
            itemPosition = item.item;
            updateInventory();
            updateTree();
        }
    }

    function eventItemLeave() {
        if (tutorialMode) return;
        if (itemPosition) {
            clearHintboxSentence(1);
            itemPosition = 0;
            updateInventory();
            updateTree();
        }
    }

    function eventItemClick() {
        if (tutorialMode) return;
        reequipItem(this.itemId);
    }

    // --- Enemy attacking events

    function eventRemoveEnemyDefense() {
        if (tutorialMode) return;
        let
            enemyId=this.enemyId,
            stat=this.stat;
        eventUseAttackLeave();
        eventUseRangeLeave();
        removeEnemyDefense(enemyId,stat);
    }

    function eventEnemyAttack() {
        if (tutorialMode) return;
        let
            enemyId=this.enemyId,
            stat=this.stat,
            amount=this.amount;

        eventUseAttackLeave();
        eventUseRangeLeave();
        attackEnemy(enemyId,stat,amount);
    }

    function eventUseAttackHover() {
        if (tutorialMode) return;
        ui.setClassByNode(actionDicesBox.attack,"selecting");
        setHintboxSentence(1,language.translate("uiSelectToAttack"))
    }

    function eventUseAttackLeave() {
        if (tutorialMode) return;
        ui.setClassByNode(actionDicesBox.attack,"");
        clearHintboxSentence(1);
    }

    function eventUseRangeHover() {
        if (tutorialMode) return;
        ui.setClassByNode(actionDicesBox.range,"selecting");
        setHintboxSentence(1,language.translate("uiSelectToRange"))
    }

    function eventUseRangeLeave() {
        if (tutorialMode) return;
        ui.setClassByNode(actionDicesBox.range,"");
        clearHintboxSentence(1);
    }

    // --- Enemy drop events

    function eventDropHover() {
        if (tutorialMode) return;
        setHintboxSentence(1,language.translate("uiSelectToIdentify"));
    }

    function eventDropLeave() {
        if (tutorialMode) return;
        clearHintboxSentence(1);
    }

    function eventDropClick() {
        if (tutorialMode) return;
        identifyItem(this.dropId);
    }

    function eventDropXpHover() {
        if (tutorialMode) return;
        ui.setClassByNode(xpGauge,"selecting");
        setHintboxSentence(1,language.translate("uiSelectToTurnXp"));
    }

    function eventDropXpLeave() {
        if (tutorialMode) return;
        ui.setClassByNode(xpGauge,"");
        clearHintboxSentence(1);
    }
    
    function eventDropXp() {
        if (tutorialMode) return;
        xpItem(this.dropId);
    }

    // --- Pearl events

    function eventPearlHover() {
        if (tutorialMode) return;
        treePosition={x:playerPosition.cell.x,y:playerPosition.cell.y};
        setHintboxSentence(1,language.translate("uiSelectToPearlEngrave"));
        updateTree();
    }

    function eventPearlXpHover() {
        if (tutorialMode) return;
        treePosition={x:playerPosition.cell.x,y:playerPosition.cell.y};
        ui.setClassByNode(xpGauge,"selecting");
        setHintboxSentence(1,language.translate("uiSelectToPearlXp"));
        updateTree();
    }

    function eventPearlXpLeave() {
        if (tutorialMode) return;
        treePosition=0;
        ui.setClassByNode(xpGauge,"");
        clearHintboxSentence(1);
        updateTree();
    }

    function eventPearlLeave() {
        if (tutorialMode) return;
        treePosition=0;
        clearHintboxSentence(1);
        updateTree();
    }

    function eventPearlPick() {
        if (tutorialMode) return;
        let
            dropId = this.dropId,
            skill = this.skill;
        playerPosition.drop.splice(dropId,1);
        playerPosition.cell.pearls--;
        gainPearl();
        if (!playerPosition.cell.skill[skill]) playerPosition.cell.skill[skill]=0;
        playerPosition.cell.skill[skill]++;
        eventPearlLeave();
        updateStats();
        redrawField();
        redrawTree();
        redrawMap();
        hideMap();
        checkEndContext();
    }

    // Global variables

    let
        gameRunning=true,
        game=new Generator(language, seed, tutorialMode ? TUTORIALMAP : 0),
        data=game.getData(),
        tutorialDebugging=false,
        tutorialBox,
        tutorialDice=[],
        tutorialWait=false,
        tutorialStep=-1,
        resizeTimer=0,
        doResize,
        mapPosition,
        treePosition,
        dicePreview,
        treeJoinPosition,
        itemPosition,
        playerPosition,
        pearlsLeft=data.pearlCount,
        evilAvailable=false,
        evilBeaten=false,
        finalScore=0,
        skillSelector,
        skillSelectorMandatory,
        statsOpened=0,
        dicePositions={},
        actionPositions={},
        actionBoxes={},
        actionDicesBox={},
        actionLabels={},
        hintBoxData={sentences:[]}
        playerSheet={};
        playerStats={
            time:{ icon:"", value:0, max:data.time[0].duration, step:0 },
            enemyRange:{ icon:"", range:data.time[0].range },
            xp:{ icon:"", value:0, max:data.startingXpHp },
            level:{ icon:"", value:1 },
            points:{ icon:"", value:data.startingPoints },
            health:{ icon:"", value:data.startingXpHp, max:data.startingXpHp }
        },
        playerInventory=[],
        skillSelectorButtons=[],
        moreButtonMode=0,
        mobileVersion=false,
        moreButtonShow=false;

    // Global UI elements

    let
        pearlDockLeft,
        pearlDockRight,
        hintBox,
        container,
        timeContainer,
        timeGauge,
        timeGaugeValue,
        timeBox,
        timeTopLabel,
        timeValue,
        timeBottomLabel,
        bottomPanel,
        topBar,
        messages=[],
        charButton,
        moreButton,
        hpGauge,
        hpGaugeBar,
        hpGaugeValue,
        xpGauge,
        xpGaugeBar,
        xpGaugeValue,
        levelBox,
        levelValue,
        levelTopLabel,
        levelBottomLabel,
        leftSkillBox,
        rightSkillBox,
        newDiceBox,
        rightPanel,
        tree,
        skillSelectorBox,
        skillSelectorBoxMessage,
        skillSelectorBoxIcons,
        skillSelectorBoxButton,
        pointsLeft,
        unequipButton,
        inventory,
        leftPanel,
        enemiesBar,
        dropBar,
        characterSheet;

    const TUTORIAL=[
        {
            text:language.translate("tutorialIntro0")
        },{
            text:language.translate("tutorialIntro1")
        },{
            text:language.translate("tutorialIntro2")
        },{
            execute:()=>{
                bottomPanel.frame.style.display="";
            },
            at:()=>bottomPanel.frame,
            text:language.translate("tutorialHeroOverview0")
        },{
            at:()=>hpGauge,
            text:language.translate("tutorialHeroOverview1")
        },{
            at:()=>xpGauge,
            text:language.translate("tutorialHeroOverview2")
        },{
            at:()=>levelBox,
            text:language.translate("tutorialHeroOverview3")
        },{
            at:()=>levelBottomLabel,
            text:language.translate("tutorialHeroOverview4")
        },{
            at:()=>levelBottomLabel,
            text:language.translate("tutorialHeroOverview5")
        },{
            at:()=>leftSkillBox,
            text:language.translate("tutorialHeroOverview6")
        },{
            at:()=>rightSkillBox,
            text:language.translate("tutorialHeroOverview7")
        },{
            execute:()=>{
                charButton.style.display="";
            },
            at:()=>charButton,
            text:language.translate("tutorialHeroOverview8")
        },{
            wait:500,
            execute:()=>{
                showStats();
            },
            at:()=>document.getElementsByClassName('treewrapper')[0],
            text:language.translate("tutorialHeroOverview9")
        },{
            at:()=>document.getElementById('treec0_5'),
            text:language.translate("tutorialHeroOverview10")
        },{
            at:()=>leftSkillBox,
            text:language.translate("tutorialHeroOverview11")
        },{
        at:()=>document.getElementById('treed0,4-0,5'),
            text:language.translate("tutorialHeroOverview12")
        },{
            at:()=>pointsLeft,
            text:language.translate("tutorialHeroOverview13")
        },{
            at:()=>inventory,
            text:language.translate("tutorialHeroOverview14")
        },{
            at:()=>document.getElementsByClassName('tasks')[0],
            clickMore:true,
            text:language.translate("tutorialHeroOverview15")
        },{
            wait:500,
            execute:()=>{
                hideStats();
                container.node.style.display="";
            },
            text:language.translate("tutorialMap0")
        },{
            at:()=>document.getElementById('mapc0_0'),
            text:language.translate("tutorialMap1")
        },{
            execute:()=>{
                timeContainer.node.style.display="";
            },
            at:()=>timeGauge,
            text:language.translate("tutorialMap2")
        },{
            at:()=>timeBottomLabel,
            text:language.translate("tutorialMap3")
        },{
            at:()=>document.getElementById('mapc0_0'),
            text:language.translate("tutorialMap4")
        },{
            at:()=>timeBottomLabel,
            text:language.translate("tutorialMap5")
        },{
            execute:()=>{
                document.getElementById('mapc0_0').className+=" selecting";
                document.getElementById('mapc0_1').className+=" selecting";
                document.getElementById('mapc1_1').className+=" selecting";
                document.getElementById('mapc1_0').className+=" selecting";
            },
            text:language.translate("tutorialMap6")
        },{
            execute:()=>{
                updateMap();
            },
            at:()=>document.getElementById('mapc5_0'),
            text:language.translate("tutorialMap7")
        },{
            execute:()=>{
                document.getElementById('mapc5_0').className+=" selecting";
                document.getElementById('mapc5_1').className+=" selecting";
            },
            text:language.translate("tutorialMap8")
        },{
            execute:()=>{
                updateMap();
                document.getElementById('mapc5_5').className+=" selecting";
            },
            at:()=>document.getElementById('mapc5_5'),
            text:language.translate("tutorialMap9")
        },{
            execute:()=>{
                updateMap();
            },
            at:()=>timeGauge,
            text:language.translate("tutorialMap10")
        },{
            at:()=>document.getElementById('mapc0_0'),
            text:language.translate("tutorialMap11")
        },{
            execute:()=>{
                pearlDockLeft.style.display="";
                pearlDockRight.style.display="";
            },
            at:()=>pearlDockLeft,
            text:language.translate("tutorialMap12")
        },{
            execute:()=>{
                document.getElementById('mapc0_0').className+=" selecting";
                document.getElementById('mapc0_1').className+=" selecting";
                document.getElementById('mapc1_1').className+=" selecting";
                document.getElementById('mapc1_0').className+=" selecting";
            },
            at:()=>document.getElementById('mapc0_0'),
            text:language.translate("tutorialMap13")
        },{
            wait:500,
            execute:()=>{
                tutorialDice=[2];
                startBattle(0,0,2,2)
            },
            text:language.translate("tutorialBattle0")
        },{
            clickMore:true,
            text:language.translate("tutorialBattle1")
        },{
            at:()=>playerPosition.enemies.list[0].enemyNode,
            text:language.translate("tutorialBattle2")
        },{
            at:()=>playerPosition.enemies.list[0].strengthNode,
            text:language.translate("tutorialBattle3")
        },{
            at:()=>playerPosition.enemies.list[0].healthNode,
            text:language.translate("tutorialBattle4")
        },{
            at:()=>playerPosition.enemies.list[0].defenseNode,
            text:language.translate("tutorialBattle5")
        },{
            at:()=>playerPosition.enemies.list[0].buttonsNode.childNodes[0],
            text:language.translate("tutorialBattle6")
        },{
            at:()=>actionBoxes.attack,
            text:language.translate("tutorialBattle7")
        },{
            at:()=>playerPosition.enemies.list[3].strengthNode,
            text:language.translate("tutorialBattle8")
        },{
            at:()=>playerPosition.enemies.list[2].strengthNode,
            text:language.translate("tutorialBattle9")
        },{
            at:()=>dropBar,
            text:language.translate("tutorialBattle10")
        },{
            text:language.translate("tutorialBattle11")
        },{
            at:()=>document.getElementsByClassName("newdice")[0].childNodes[0],
            clickMore:true,
            text:language.translate("tutorialBattle12")
        },{
            at:()=>document.getElementsByClassName('treewrapper')[0],
            text:language.translate("tutorialBattle13")
        },{
            execute:()=>{
                dicePreview="attack";
                updateDiceSlot();
            },
            at:()=>document.getElementById('treec0_0'),
            text:language.translate("tutorialBattle14")
        },{
            at:()=>document.getElementsByClassName('adding')[0],
            text:language.translate("tutorialBattle15")
        },{
            execute:()=>{
                dicePreview="range";
                updateDiceSlot();
            },
            at:()=>document.getElementById('treec0_5'),
            text:language.translate("tutorialBattle16")
        },{
            execute:()=>{
                dicePreview="heal";
                updateDiceSlot();
            },
            at:()=>document.getElementById('treec5_0'),
            text:language.translate("tutorialBattle17")
        },{
            execute:()=>{
                dicePreview="defense";
                updateDiceSlot();
            },
            at:()=>document.getElementById('treec5_5'),
            text:language.translate("tutorialBattle18")
        },{
            execute:()=>{
                activateCell(0,0);
            },
            at:()=>document.getElementById('treec0_0'),
            text:language.translate("tutorialBattle19")
        },{
            at:()=>actionBoxes.attack.getElementsByClassName("slot")[0],
            text:language.translate("tutorialBattle20")
        },{
            clickMore:true,
            at:()=>playerPosition.enemies.list[0].buttonsNode.childNodes[0],
            text:language.translate("tutorialBattle21")
        },{
            at:()=>playerPosition.enemies.list[3].buttonsNode.childNodes[0],
            text:language.translate("tutorialBattle22")
        },{
            text:language.translate("tutorialBattle23")
        },{
            clickMore:true,
            at:()=>document.getElementById('treec0_5'),
            text:language.translate("tutorialBattle24")
        },{
            at:()=>document.getElementById('treec0_1'),
            text:language.translate("tutorialBattle25")
        },{
            at:()=>document.getElementById('treed0,0-0,1'),
            text:language.translate("tutorialBattle26")
        },{
            execute:()=>{
                getJoin(data.directions[data.grid[0][0].connections.down.direction.id]);
            },
            at:()=>document.getElementById('treed0,0-0,1'),
            text:language.translate("tutorialBattle27")
        },{
            at:()=>document.getElementById('treec0_1'),
            text:language.translate("tutorialBattle28")
        },{
            at:()=>pointsLeft,
            text:language.translate("tutorialBattle29")
        },{
            execute:()=>{
                getJoin(data.directions[data.grid[1][0].connections.down.direction.id]);
                getJoin(data.directions[data.grid[2][0].connections.down.direction.id]);
            },
            at:()=>pointsLeft,
            text:language.translate("tutorialBattle30")
        },{
            at:()=>document.getElementById('treec0_2'),
            text:language.translate("tutorialBattle31")
        },{
            execute:()=>{
                activateCell(0,1);
            },
            at:()=>document.getElementById('treec0_1'),
            text:language.translate("tutorialBattle32")
        },{
            at:()=>playerPosition.enemies.list[0].buttonsNode.childNodes[1],
            text:language.translate("tutorialBattle33")
        },{
            execute:()=>{
                activateCell(0,2);
            },
            at:()=>document.getElementById('treec0_2'),
            text:language.translate("tutorialBattle34")
        },{
            execute:()=>{
                dicePreview="attack";
                updateDiceSlot();
            },
            at:()=>document.getElementById('treec0_3'),
            text:language.translate("tutorialBattle35")
        },{
            at:()=>document.getElementsByClassName('raising')[0],
            text:language.translate("tutorialBattle36")
        },{
            execute:()=>{
                activateCell(0,3);
            },
            at:()=>document.getElementById('treec0_3'),
            text:language.translate("tutorialBattle37")
        },{
            clickMore:true,
            at:()=>playerPosition.enemies.list[3].buttonsNode.childNodes[0],
            text:language.translate("tutorialBattle38")
        },{
            execute:()=>{
                attackEnemy(3,"attack",1);
            },
            text:language.translate("tutorialBattle39")
        },{
            at:()=>dropBar.childNodes[1],
            text:language.translate("tutorialBattle40")
        },{
            at:()=>playerPosition.passNode,
            text:language.translate("tutorialBattle41")
        },{
            at:()=>actionPositions.attack,
            text:language.translate("tutorialBattle42")
        },{
            at:()=>playerPosition.enemies.list[2].buttonsNode.childNodes[0],
            text:language.translate("tutorialBattle43")
        },{
            execute:()=>{
                removeEnemyDefense(2,"attack")
            },
            at:()=>playerPosition.enemies.list[2].buttonsNode.childNodes[0],
            text:language.translate("tutorialBattle44")
        },{
            execute:()=>{
                attackEnemy(2,"attack",1);
            },
            text:language.translate("tutorialBattle45")
        },{
            at:()=>dropBar.childNodes[2],
            text:language.translate("tutorialBattle46")
        },{
            at:()=>playerPosition.passNode,
            text:language.translate("tutorialBattle47")
        },{
            execute:()=>{
                tutorialDice=[6];
                pass();
            },
            at:()=>hpGauge,
            text:language.translate("tutorialBattle48")
        },{
            clickMore:true,
            at:()=>playerPosition.enemies.list[0].avatarNode,
            text:language.translate("tutorialBattle49")
        },{
            clickMore:true,
            at:()=>document.getElementsByClassName('treewrapper')[0],
            text:language.translate("tutorialBattle50")
        },{
            at:()=>document.getElementsByClassName("newdice")[0].childNodes[0],
            text:language.translate("tutorialBattle51")
        },{
            execute:()=>{
                tutorialDice=[3];
                activateCell(0,0);
            },
            at:()=>document.getElementById('treec0_0'),
            text:language.translate("tutorialBattle52")
        },{
            at:()=>document.getElementsByClassName("newdice")[0].childNodes[0],
            text:language.translate("tutorialBattle53")
        },{
            execute:()=>{
                activateCell(0,1);
            },
            at:()=>document.getElementById('treec0_1'),
            text:language.translate("tutorialBattle54")
        },{
            clickMore:true,
            at:()=>playerPosition.enemies.list[1].buttonsNode.childNodes[1],
            text:language.translate("tutorialBattle55")
        },{
            clickMore:true,
            execute:()=>{
                activateCell(0,2);
            },
            at:()=>document.getElementById('treec0_2'),
            text:language.translate("tutorialBattle56")
        },{
            execute:()=>{
                activateCell(0,3);
            },
            at:()=>document.getElementById('treec0_3'),
            text:language.translate("tutorialBattle57")
        },{
            clickMore:true,
            at:()=>playerPosition.enemies.list[0].buttonsNode.childNodes[0],
            text:language.translate("tutorialBattle58")
        },{
            execute:()=>{
                attackEnemy(0,"attack",1);
            },
            at:()=>playerPosition.enemies.list[0].buttonsNode.childNodes[0],
            text:language.translate("tutorialBattle59")
        },{
            execute:()=>{
                attackEnemy(0,"attack",2);
            },
            at:()=>playerPosition.passNode,
            text:language.translate("tutorialBattle60")
        },{
            execute:()=>{
                pass();
            },
            text:language.translate("tutorialLoot0")
        },{
            at:()=>playerPosition.drop[1].dropNode,
            text:language.translate("tutorialLoot1")
        },{
            at:()=>playerPosition.drop[1].qualityNode,
            text:language.translate("tutorialLoot2")
        },{
            at:()=>playerPosition.drop[1].identifyNode,
            text:language.translate("tutorialLoot3")
        },{
            at:()=>playerPosition.drop[1].xpNode,
            text:language.translate("tutorialLoot4")
        },{
            at:()=>playerPosition.drop[1].identifyNode,
            text:language.translate("tutorialLoot5")
        },{
            execute:()=>{
                tutorialDice=[4,5];
                identifyItem(1);
            },
            text:language.translate("tutorialLoot6")
        },{
            at:()=>document.getElementById('treec3_4'),
            text:language.translate("tutorialLoot7")
        },{
            at:()=>document.getElementById('treec4_3'),
            text:language.translate("tutorialLoot8")
        },{
            at:()=>unequipButton,
            text:language.translate("tutorialLoot9")
        },{
            at:()=>document.getElementById('treed4,4-4,5'),
            text:language.translate("tutorialLoot10")
        },{
            execute:()=>{
                equipItemJoint("4,4-4,5");
            },
            at:()=>document.getElementById('treec4_4'),
            text:language.translate("tutorialLoot11")
        },{
            at:()=>document.getElementById('treed4,5-5,5'),
            text:language.translate("tutorialLoot12")
        },{
            at:()=>playerInventory[3].node,
            text:language.translate("tutorialLoot13")
        },{
            clickMore:true,
            at:()=>playerPosition.drop[1].xpNode,
            text:language.translate("tutorialLoot14")
        },{
            execute:()=>{
                xpItem(1);
            },
            at:()=>playerPosition.drop[1].xpNode,
            text:language.translate("tutorialLoot15")
        },{
            execute:()=>{
                xpItem(1);
            },
            at:()=>playerPosition.drop[1].xpNode,
            text:language.translate("tutorialLoot16")
        },{
            execute:()=>{
                xpItem(1);
            },
            at:()=>playerPosition.drop[0].dropNode,
            text:language.translate("tutorialLoot17")
        },{
            execute:()=>{
                treePosition={x:0,y:0};
                updateTree();
            },
            at:()=>playerPosition.drop[0].nodes[0],
            text:language.translate("tutorialLoot18")
        },{
            execute:()=>{
                treePosition=0;
                updateTree();
            },
            at:()=>playerPosition.drop[0].xpNode,
            text:language.translate("tutorialLoot19")
        },{
            tutorialDebugging:true,
            text:language.translate("tutorialPrepareLast0")
        },{
            clickMore:true,
            at:()=>playerInventory[3].node,
            text:language.translate("tutorialPrepareLast1")
        },{
            execute:()=>{
                reequipItem(3);
            },
            at:()=>unequipButton,
            text:language.translate("tutorialPrepareLast2")
        },{
            clickMore:true,
            execute:()=>{
                discardItem();
            },
            at:()=>playerPosition.drop[0].xpNode,
            text:language.translate("tutorialPrepareLast3")
        },{
            execute:()=>{
                xpItem(0)
            },
            text:language.translate("tutorialExits0")
        },{
            at:()=>levelBox,
            text:language.translate("tutorialExits1")
        },{
            at:()=>document.getElementById('mapc0_0'),
            text:language.translate("tutorialExits2")
        },{
            at:()=>document.getElementById('mapc0_1'),
            text:language.translate("tutorialExits3")
        },{
            at:()=>document.getElementById('mapc5_0'),
            text:language.translate("tutorialExits4")
        },{
            at:()=>document.getElementById('mapc1_2'),
            text:language.translate("tutorialExits5")
        },{
            execute:()=>{
                document.getElementById('mapc0_1').className+=" selecting";
                document.getElementById('mapc0_2').className+=" selecting";
                document.getElementById('mapc1_2').className+=" selecting";
                document.getElementById('mapc1_1').className+=" selecting";
            },
            at:()=>document.getElementById('mapc0_1'),
            text:language.translate("tutorialExits6")
        },{
            wait:500,
            execute:()=>{
                tutorialDice=[6,3];
                startBattle(0,1,2,2)
            },
            text:language.translate("tutorialSpecial0")
        },{
            at:()=>document.getElementById('treed0,1-1,1'),
            text:language.translate("tutorialSpecial1")
        },{
            execute:()=>{
                getJoin(data.directions[data.grid[1][0].connections.right.direction.id]);
            },
            at:()=>document.getElementById('treec0_0'),
            text:language.translate("tutorialSpecial2")
        },{
            execute:()=>{
                activateCell(0,0);
            },
            at:()=>document.getElementById('treec0_1'),
            text:language.translate("tutorialSpecial3")
        },{
            execute:()=>{
                activateCell(0,1);
            },
            at:()=>document.getElementById('treec1_1'),
            text:language.translate("tutorialSpecial4")
        },{
            execute:()=>{
                activateCell(1,1);
            },
            at:()=>skillSelectorBox,
            text:language.translate("tutorialSpecial5")
        },{
            at:()=>skillSelectorButtons[1],
            text:language.translate("tutorialSpecial6")
        },{
            at:()=>actionBoxes.attack,
            text:language.translate("tutorialSpecial7")
        },{
            at:()=>skillSelectorButtons[1],
            text:language.translate("tutorialSpecial8")
        },{
            clickMore:true,
            execute:()=>{
                performCellAction(1);
            },
            text:language.translate("tutorialSpecial9")
        },{
            at:()=>actionBoxes.attack,
            text:language.translate("tutorialSpecial10")
        },{
            clickMore:true,
            at:()=>skillSelectorButtons[0],
            text:language.translate("tutorialSpecial11")
        },{
            at:()=>skillSelectorBoxButton,
            text:language.translate("tutorialSpecial12")
        },{
            execute:()=>{
                endCombatUi();
            },
            text:language.translate("tutorialEnd0")
        },{
            execute:()=>{
                for (let y=0;y<6;y++)
                    for (let x=0;x<6;x++)
                        document.getElementById('mapc'+x+'_'+y).className+=" selecting";
            },
            text:language.translate("tutorialEnd1")
        },{
            text:language.translate("tutorialEnd2")
        },{
            text:language.translate("tutorialEnd3")
        }

    ];
    
    this.play=()=>{

        // Setup UI

        pearlDockLeft=ui.addNode(ui.display,"div",{className:"pearldock left"});
        pearlDockRight=ui.addNode(ui.display,"div",{className:"pearldock right"});
        hintBox=ui.addNode(ui.display,"div",{className:"hintbox"});
        container=ui.newContainer("mapcontainer");
        timeContainer=ui.newContainer("timecontainer");
        timeGauge=ui.addNode(timeContainer.node,"div",{className:"crowngauge"});
        timeGaugeValue=ui.addNode(timeGauge,"div",{className:"gaugevalue"});
        timeBox=ui.addNode(timeGauge,"div",{className:"time"});
        timeTopLabel=ui.addNode(timeBox,"div",{className:"toplabel"});
        timeValue=ui.addNode(timeBox,"div",{className:"value"});
        timeBottomLabel=ui.addNode(timeBox,"div",{className:"bottomlabel"});
        bottomPanel=ui.newPanel("bottom");
        topBar=bottomPanel.newBar("stats");
        messages=[
            { id:"first", element: ui.newContainer("messages first") },
            { id:"second", element: ui.newContainer("messages second") }
        ],
        charButton=ui.addNode(ui.display,"div",{className:"char button"});
        moreButton=ui.addNode(ui.display,"div",{className:"more button"});
        hpGauge=ui.addNode(topBar,"div",{className:"hp gauge"});
        hpGaugeBar=ui.addNode(hpGauge,"div",{className:"bar"});
        hpGaugeValue=ui.addNode(hpGauge,"div",{className:"value"});
        xpGauge=ui.addNode(topBar,"div",{className:"xp gauge"});
        xpGaugeBar=ui.addNode(xpGauge,"div",{className:"bar"});
        xpGaugeValue=ui.addNode(xpGauge,"div",{className:"value"});
        levelBox=ui.addNode(topBar,"div",{className:"level"});
        levelValue=ui.addNode(levelBox,"div",{className:"value"});
        levelTopLabel=ui.addNode(levelBox,"div",{className:"toplabel"});
        levelBottomLabel=ui.addNode(levelBox,"div",{className:"bottomlabel"});
        leftSkillBox=ui.addNode(topBar,"div",{className:"left skillbox"});
        rightSkillBox=ui.addNode(topBar,"div",{className:"right skillbox"});
        newDiceBox=ui.addNode(topBar,"div",{className:"newdice"});
        rightPanel=ui.newPanel("right");
        tree=rightPanel.newText();
        skillSelectorBox=rightPanel.newBar("skillselector");
        skillSelectorBoxMessage=ui.addNode(skillSelectorBox,"div", {className:"message"});
        skillSelectorBoxIcons=ui.addNode(skillSelectorBox,"div", {className:"icons"});
        skillSelectorBoxButton=ui.addNode(skillSelectorBox,"div", {className:"button",innerHTML:language.translate("uiDone")});
        pointsLeft=rightPanel.newBar("equipbox");
        unequipButton=rightPanel.newBar("unequip button");
        inventory=rightPanel.newBar("inventory");
        leftPanel=ui.newPanel("left");
        enemiesBar=leftPanel.newBar("enemies");
        dropBar=leftPanel.newBar("drops");
        characterSheet=leftPanel.newBar("sheet");
            
        dicePositions.neutral=ui.addNode(newDiceBox,"div",{className:"slot"});
        skillSelectorBox.style.display="none";
        messages.forEach(message=>{
            message.element.node.innerHTML="";
        })
        charButton.innerHTML=language.translate("uiStats");
        charButton.onclick=toggleStats;
        moreButton.innerHTML=language.translate("uiMore");
        moreButton.onclick=moreClick;

        bottomPanel.show();

        data.stats.forEach((stat,id)=>{
            let
                node=ui.addNode(inventory,"div",{className:"item"}),
                itemIcon=ui.addNode(node,"div",{className:"icon",innerHTML:printGlyph(stat.icon)}),
                itemType=ui.addNode(node,"div",{className:"type"}),
                itemQuality=ui.addNode(node,"div",{className:"quality"});
            node.itemId=id;
            playerInventory[id]={ node:node, itemIconNode:itemIcon, itemTypeNode:itemType, itemQualityNode:itemQuality }
            playerSheet[stat.id]=0;
        });

        [
            [ printGlyph("defense"), "defense", leftSkillBox ],
            [ printGlyph("attack"), "attack", leftSkillBox ],
            [ printGlyph("range"), "range", rightSkillBox ],
            [ printGlyph("heal"), "heal", rightSkillBox ],
        ].forEach(skill=>{
            let
                playerSpecial=data.specials[skill[1]],
                description=playerSpecial.description,
                skillBox=ui.addNode(skill[2],"div",{className:"skill"}),
                skillIcon=ui.addNode(skillBox,"div",{className:"icon",innerHTML:skill[0]}),
                skillLabel=ui.addNode(skillBox,"div",{className:"label"}),
                dicesBox=ui.addNode(skillBox,"div",{className:"dicesbox"});

            [
                [ /\{symbol attackSmallSymbol\}/g, printGlyph("attack") ],
                [ /\{symbol rangeSmallSymbol\}/g, printGlyph("range") ],
                [ /\{symbol defenseSmallSymbol\}/g, printGlyph("defense") ],
                [ /\{symbol healSmallSymbol\}/g, printGlyph("heal") ]
            ].forEach(replace=>{
                description=description.replace(replace[0],replace[1]);
            });
            skillLabel.innerHTML=description;

            dicePositions[skill[1]]=[];
            for (let i=0;i<2;i++) {
                let diceSlot=ui.addNode(dicesBox,"div",{className:"slot"});
                dicePositions[skill[1]].push(diceSlot);
            }
            actionBoxes[skill[1]]=skillBox;
            actionPositions[skill[1]]=ui.addNode(dicesBox,"div",{className:"actionslot"});
            actionDicesBox[skill[1]]=dicesBox;
            actionLabels[skill[1]]={
                icon:skillIcon,
                special:skillLabel
            }
            ui.setClassByNode(skillIcon,"disabled");
            ui.setClassByNode(skillLabel,"disabled");
        });

        // Game startup

        playerPosition=0;
        updateDiceSlot();
        updateStats();
        updateInventory();
        updateSkillPoints();
        redrawTree();
        redrawMap();

        if (tutorialMode) {

            container.node.style.display="none";
            timeContainer.node.style.display="none";
            pearlDockLeft.style.display="none";
            pearlDockRight.style.display="none";
            bottomPanel.frame.style.display="none";
            charButton.style.display="none";
            tutorialNext();

        } else {

            showMap();
        
        }

        doResize=10;
        ui.addEvent(window,"resize",eventWindowResize);
        ui.addEvent(window,"keydown",eventWindowKeydown);
        resizeScreen();
        player.playMusic(player.audio.ingame);
        ui.fadeInDisplay();
        
    }


}