function Generator(language,heroname,suggestions) {
    
    function generateStartingPoints(strong,weak,misc1,misc2) {
        return [
            // Standard
            [
                { x:0, y:0, thread:"all", startsWith:strong },
                { x:0, y:BOTTOM, thread:"all", startsWith:weak },
                { x:RIGHT, y:0, thread:"all", startsWith:misc1 },
                { x:RIGHT, y:BOTTOM, thread:"all", startsWith:misc2 }
            ],[
                { x:0, y:0, thread:"all", startsWith:strong },
                { x:0, y:BOTTOM, thread:"all", startsWith:weak },
                { x:RIGHT, y:0, thread:"all", startsWith:misc2 },
                { x:RIGHT, y:BOTTOM, thread:"all", startsWith:misc1 }
            ],[
                { x:0, y:0, thread:"all", startsWith:strong },
                { x:0, y:BOTTOM, thread:"all", startsWith:misc1 },
                { x:RIGHT, y:0, thread:"all", startsWith:weak },
                { x:RIGHT, y:BOTTOM, thread:"all", startsWith:misc2 }
            ],[
                { x:0, y:0, thread:"all", startsWith:strong },
                { x:0, y:BOTTOM, thread:"all", startsWith:misc2 },
                { x:RIGHT, y:0, thread:"all", startsWith:weak },
                { x:RIGHT, y:BOTTOM, thread:"all", startsWith:misc1 }
            ]
        ];

    }

    const
        SEEDROOT=0,
        WIDTH=6,
        HEIGHT=6,
        RIGHT=WIDTH-1,
        BOTTOM=HEIGHT-1,
        DELTADISTANCETOLLERANCE=3,
        MINJOINTS=2,
        POINTSPERLEVEL=2,
        STARTINGXPHP=8,
        GROWTHRATIO=2,
        STARTINGPOINTS=3,
        MAXLEVEL=30,
        RANGES=[[2,2],[2,3],[3,2],[3,3],[3,4],[4,3],[4,4],[4,5],[5,4],[5,5]],
        TIMESTEP=4,
        STATS=[
            { icon:"strength", label:"Strength", id:"strength", need:{strength:1} },
            { icon:"dexterity", label:"Dexterity", id:"dexterity", need:{dexterity:1} },
            { icon:"vitality", label:"Vitality", id:"vitality", need:{vitality:1} },
            { icon:"magic", label:"Magic", id:"magic", need:{magic:1} }
        ],
        SKILLS={
            attack:{ icon:"attack", stat:0 },
            range:{ icon:"range", stat:1 },
            heal:{ icon:"heal", stat:2 },
            defense:{ icon:"defense", stat:3 },
        },
        BASICTHREAD=[
            { need:{strength:1}, skills:[ [ { attack:1 } ] ] },
            { need:{dexterity:1}, skills:[ [ { range:1 } ] ] },
            { need:{vitality:1}, skills:[ [ { heal:1 } ] ] },
            { need:{magic:1}, skills:[ [ { defense:1 } ] ] }
        ],
        CLASSES=[
            {
                id:"warrior",
                label:language.translate("charWarrior"),
                startingPoints:generateStartingPoints(0,1,2,3),
                threads:{
                    all:BASICTHREAD
                },
                specials:{
                    attack:[
                        { 
                            id:"removedefense",
                            to:[ "range" ],
                            description:language.translate("charWarriorSkill0_0")
                        }
                    ],
                    range:[
                        { 
                            id:"heal",
                            heal:4,
                            description:language.translate("charWarriorSkill1_0")
                        }
                    ],
                    heal:[
                        { 
                            id:"dealdamage",
                            damage:6,
                            to:[ "attack" ],
                            description:language.translate("charWarriorSkill2_0")
                        }
                    ],
                    defense:[
                        { 
                            id:"dealdamage",
                            damage:2,
                            description:language.translate("charWarriorSkill3_0")
                        }
                    ]
                }
            },{
                id:"ranger",
                label:language.translate("charRanger"),
                startingPoints:generateStartingPoints(1,0,2,3),
                threads:{
                    all:BASICTHREAD
                },
                specials:{
                    attack:[
                        { 
                            id:"removedefense",
                            to:[ "attack" ],
                            description:language.translate("charRangerSkill0_0")
                        }
                    ],
                    range:[
                        { 
                            id:"heal",
                            heal:3,
                            description:language.translate("charRangerSkill1_0")
                        }
                    ],
                    heal:[
                        { 
                            id:"dealdamage",
                            damage:4,
                            to:[ "attack" ],
                            description:language.translate("charRangerSkill2_0")
                        }
                    ],
                    defense:[
                        { 
                            id:"removedefense",
                            damage:4,
                            to:[ "defense" ],
                            description:language.translate("charRangerSkill3_0")
                        }
                    ]
                }
            },{
                id:"wizard",
                label:language.translate("charWizard"),
                startingPoints:generateStartingPoints(2,3,0,1),
                threads:{
                    all:BASICTHREAD
                },
                specials:{
                    attack:[
                        { 
                            id:"removedefense",
                            to:[ "attack", "range" ],
                            description:language.translate("charWizardSkill0_0")
                        }
                    ],
                    range:[
                        { 
                            id:"heal",
                            heal:6,
                            description:language.translate("charWizardSkill1_0")
                        }
                    ],
                    heal:[
                        { 
                            id:"dealdamage",
                            damage:4,
                            to:[ "attack" ],
                            description:language.translate("charWizardSkill2_0")
                        }
                    ],
                    defense:[
                        { 
                            id:"dealdamage",
                            damage:4,
                            to:[ "range" ],
                            description:language.translate("charWizardSkill3_0")
                        }
                    ]
                }
            },{
                id:"paladin",
                label:language.translate("charPaladin"),
                startingPoints:generateStartingPoints(3,2,0,1),
                threads:{
                    all:BASICTHREAD
                },
                specials:{
                    attack:[
                        { 
                            id:"removedefense",
                            description:language.translate("charPaladinSkill0_0")
                        }
                    ],
                    range:[
                        { 
                            id:"dealdamage",
                            damage:6,
                            to:[ "range" ],
                            description:language.translate("charPaladinSkill1_0")
                        }
                    ],
                    heal:[
                        { 
                            id:"dealdamage",
                            damage:6,
                            to:[ "heal" ],
                            description:language.translate("charPaladinSkill2_0")
                        }
                    ],
                    defense:[
                        { 
                            id:"dealdamage",
                            damage:6,
                            to:[ "defense" ],
                            description:language.translate("charPaladinSkill3_0")
                        }
                    ]
                }
            }
        ];


    const
        ALLOWEDSYMBOLS="abcdefghijklmnopqrstuvwxyz";

    function nameToSeed(name) {
        let
            seed=SEEDROOT,
            base=1;
        name=name.toLowerCase();
        for (let i=0;i<name.length;i++) {
            let position=ALLOWEDSYMBOLS.indexOf(name[i])+1;
            if (position>0) {
                seed+=base*position;
                base*=ALLOWEDSYMBOLS.length;
            }
        }
        return seed;
    }

    let
        seed=nameToSeed(heroname),
        rnd=new Randomizer(seed),
        extraRnd=new Randomizer(seed),
        nameGenerator=new NameGenerator(extraRnd),
        bossName = suggestions ? suggestions.evilName : nameGenerator.generate("evilName"),
        heroClass=suggestions ? CLASSES[suggestions.heroClass] : rnd.element(CLASSES),
        heroStartingPoints=suggestions ? heroClass.startingPoints[suggestions.heroStartingPoints] : rnd.element(heroClass.startingPoints),
        deadEnds={
            all:[],
            byPath:[]
        },
        branches={
            all:[],
            byPath:[]
        },
        filledcells=[],
        crawlPath=0,
        grid=[],
        directions={},
        pearlCount=0,
        playerTime=[],
        playerSpecials={};

    function isFilledCell(x,y) {
        return isCellInGrid(x,y)&&grid[y]&&grid[y][x];
    }

    function isCellInGrid(x,y) {
        return (x>=0)&&(x<WIDTH)&&(y>=0)&&(y<HEIGHT);
    }

    function isCellJoined(cell1,cell2) {
        return cell1.directions.indexOf(cell2)!=-1;
    }

    function getDirectionId(x1,y1,x2,y2) {
        if (isCellInGrid(x1,y1) && isCellInGrid(x2,y2)) {
            let
                start1=x1+","+y1+"-"+x2+","+y2,
                start2=x2+","+y2+"-"+x1+","+y1;
            if (start1>start2) return start2;
            else return start1;
        } else return false;
    }

    function getDirectionLabel(x1,y1,x2,y2) {
        if (x1==x2)
            if (y2>y1) return "down";
            else if (y2<y1) return "up";
            else return "none";
        else
            if (x2>x1) return "right";
            else return "left";
    }

    function addDirection(x1,y1,x2,y2,data) {
        let id=getDirectionId(x1,y1,x2,y2);
        if (id) {
            let
                cell1=getCell(x1,y1),
                cell2=getCell(x2,y2);
            if (!directions[id]) directions[id]={id:id,stats:{},cell1:cell1,cell2:cell2};
            for (let k in data) {
                if (!directions[id].stats[k]) directions[id].stats[k]=0;
                directions[id].stats[k]++;
            }
            cell1.directions.push(cell2);
            cell1.connections[getDirectionLabel(x1,y1,x2,y2)]={
                direction:directions[id],
                toCell:cell2
            };
            cell2.directions.push(cell1);
            cell2.connections[getDirectionLabel(x2,y2,x1,y1)]={
                direction:directions[id],
                toCell:cell1
            };
            return true;
        } else return false;
    }

    function isDirectionAvailable(x1,y1,x2,y2) {
        let id=getDirectionId(x1,y1,x2,y2);
        if (id)
            return !!directions[id];
        else
            return false;
    }

    function getDirection(x1,y1,x2,y2) {
        let id=getDirectionId(x1,y1,x2,y2);
        if (id)
            return directions[id];
        else
            return false;
    }

    function getAvailableDirections(x,y) {
        let directions=[];
        if (!getCell(x-1,y)) directions.push({x:x-1,y:y});
        if (!getCell(x+1,y)) directions.push({x:x+1,y:y});
        if (!getCell(x,y-1)) directions.push({x:x,y:y-1});
        if (!getCell(x,y+1)) directions.push({x:x,y:y+1});
        return directions;
    }

    function getCell(x,y) {
        if (isCellInGrid(x,y))
            return grid[y]?grid[y][x]:0;
        else
            return true;
    }

    function addCell(x,y,cell,suggestion) {
        if (isFilledCell(x,y))
            return false;
        else {
            cell.x=x;
            cell.y=y;
            cell.directions=[];
            cell.connections={};
            let job=addSkill(cell,suggestion ? suggestion.skill : 0);
            if (!grid[y]) grid[y]=[];
            grid[y][x]=cell;
            if (suggestion && suggestion.deadEnd) {
                cell.done=true;
                cell.isDeadEnd=true;
            }
            filledcells.push(cell);
            return job;
        }
    }

    function clone(v) {
        return JSON.parse(JSON.stringify(v));
    }

    function addPearl(cell) {
        pearlCount++;
        if (!cell.pearls) cell.pearls=0;
        cell.pearls++;
    }

    function addSpecial(cell) {
        if (!cell.specials) cell.specials=0;
        cell.specials++;
    }

    function addSkill(cell,suggestion) {
        let skill;
        if (!cell.skill) cell.skill={};
        if (!cell.skillsAdded) cell.skillsAdded=0;
        if (cell.jobsBag.length==0)
            cell.jobsBag=clone(cell.jobs);
        let
            jobid=rnd.pickElement(cell.jobsBag),
            job=cell.thread[jobid];
        if (suggestion)
            skill=suggestion;
        else
            skill=rnd.element(job.skills[0]); // TODO: may tune it depending on the distance from origin
        for (let k in skill) {
            if (!cell.skill[k]) cell.skill[k]=0;
            cell.skill[k]+=skill[k];
        }
        cell.skillsAdded++;
        return job;
    }

    function crawl() {
        let
            found=false,
            cells=[],
            suggestion;
        if (suggestions && suggestions.path.length)
            suggestion=suggestions.path.shift();
        filledcells.forEach(cell=>{
            if (!cell.done) {
                if (!suggestion || (cell.x == suggestion.x) && (cell.y == suggestion.y)) {
                    let directions;
                    if (suggestion)
                        directions=[suggestion.direction];
                    else
                        directions=getAvailableDirections(cell.x,cell.y);
                    if (directions.length==0) {
                        cell.done=true;
                        if (cell.directions.length<2) {
                            cell.isDeadEnd=true;
                            deadEnds.all.push(cell);
                            if (!deadEnds.byPath[cell.path]) deadEnds.byPath[cell.path]=[];
                            deadEnds.byPath[cell.path].push(cell);
                        } else if (cell.directions.length>2) {
                            cell.isBranch=true;
                            branches.all.push(cell);
                            if (!branches.byPath[cell.path]) branches.byPath[cell.path]=[];
                            branches.byPath[cell.path].push(cell);
                        }
                    }
                    else if (suggestion || (cell.path==crawlPath))
                        cells.push({cell:cell,directions:directions});
                    else
                        found=true;
                }
            }
        });
        crawlPath=(crawlPath+1)%4;
        if (cells.length) {
            let
                nextcell=rnd.element(cells),
                nextdirection=rnd.element(nextcell.directions),
                newcell={
                    equipped:0,
                    path:nextcell.cell.path,
                    distance:nextcell.cell.distance+1,
                    thread:nextcell.cell.thread,
                    jobsBag:clone(nextcell.cell.jobsBag),
                    jobs:clone(nextcell.cell.jobs),
                };

            // Add a new job if a +2 branch
            if (nextcell.directions.length<4)
                nextcell.cell.jobs.push(rnd.elementId(newcell.thread));

            let
                job=addCell(nextdirection.x,nextdirection.y,newcell,suggestion),
                joint=nextdirection.type === undefined ? job : STATS[nextdirection.type];
            addDirection(nextcell.cell.x,nextcell.cell.y,nextdirection.x,nextdirection.y,joint.need);
            return true;
        } else return found;
    }

    function isBrigeJoint(cell1,cell2) {
        return cell1 && cell2 && !isCellJoined(cell1,cell2) && (cell1.path!=cell2.path);
    }

    function addRandomDirection(cell1,cell2) {
        addDirection(cell1.x,cell1.y,cell2.x,cell2.y,rnd.element(STATS).need);
    }

    function isShortBridgeJoint(cell1,cell2) {
        return !cell1.isDeadEnd && !cell2.isDeadEnd && (Math.abs(cell1.distance-cell2.distance)<DELTADISTANCETOLLERANCE);
    }

    function addExtraJoints() {
        let
            joints=0,
            randomJoints={};
        for (let y=0;y<HEIGHT;y++)
            for (let x=0;x<WIDTH;x++) {
                let cell=getCell(x,y);
                if (isFilledCell(x,y)) {
                    [
                        [ x+1,y ], [ x,y+1 ]
                    ].forEach(coords=>{
                        if (isFilledCell(coords[0],coords[1])) {
                            let
                                nextCell=getCell(coords[0], coords[1] ),
                                bridgeId=[cell.path,nextCell.path].sort().join("-");
                            if (!randomJoints[bridgeId])
                                randomJoints[bridgeId]={
                                    done:false,
                                    list:[]
                                };
                            if (isBrigeJoint(cell,nextCell)) {
                                if (isShortBridgeJoint(cell,nextCell)) {
                                    joints++;
                                    randomJoints[bridgeId].done=true;
                                    addRandomDirection(cell,nextCell);
                                } else
                                    randomJoints[bridgeId].list.push([cell,nextCell]);
                            }
                        };
                    });
                }
            }

        // Forces at least some bridges between different trees
        if (joints<MINJOINTS) {
            let bridges=[];
            for (let k in randomJoints)
                if (!randomJoints[k].done && randomJoints[k].list.length)
                    bridges.push(randomJoints[k].list);
            for (let i=joints;i<MINJOINTS;i++) {
                if (bridges.length) {
                    let
                        bridge=rnd.pickElement(bridges),
                        joint=rnd.pickElement(bridge);
                    addRandomDirection(joint[0],joint[1]);
                }
            }
        }
    }

    // Add starting cells

    heroStartingPoints.forEach((point,id)=>{
        addCell(point.x,point.y,{equipped:0,start:true,owned:true,path:id,distance:0,thread:heroClass.threads[point.thread],jobsBag:[],jobs:[point.startsWith]});
    });

    // Prepare trees

    do {} while (crawl());

    // Add special powers
    
    let sortByDistance=(a,b)=>{
        if (a.distance>b.distance) return -1;
        else if (a.distance<b.distance) return 1;
        else return 0;
    };

    // --- Add end path skills and pearls

    // deadEnds.all.sort(sortByDistance);
    if (suggestions)
        suggestions.pearls.forEach(coord=>{
            addPearl(grid[coord.y][coord.x]);
        })
    else {
        deadEnds.byPath.forEach(path=>{
            path.sort(sortByDistance);
            for (let i=0;i<2;i++)
                if (path[i]) addPearl(path[i]);
        });
    }

    // --- Add special triggers

    if (suggestions)
        suggestions.specials.forEach(coord=>{
            addSpecial(grid[coord.y][coord.x]);
        })
    else
        branches.byPath.forEach(path=>{
            path.sort(sortByDistance);
            addSpecial(path[0]);
        });

    // Generates skills

    for (let k in heroClass.specials)
        playerSpecials[k]=suggestions ? heroClass.specials[k][suggestions.specialMoves[k]] : rnd.element(heroClass.specials[k]);

    // Add tree merges
    
    addExtraJoints();

    // Prepare timer

    RANGES.forEach(range=>{
        playerTime.push({
            duration:TIMESTEP,
            range:range
        });
    });

    // Public methods

    this.getData=()=>{
        return {
            width:WIDTH,
            height:HEIGHT,
            grid:grid,
            pearlCount:pearlCount,
            directions:directions,
            time:playerTime,
            name:heroname,
            roleId:heroClass.id,
            role:heroClass.label,
            bossName:bossName,
            skills:SKILLS,
            stats:STATS,
            maxLevel:MAXLEVEL,
            specials:playerSpecials,
            startingXpHp:STARTINGXPHP,
            startingPoints:STARTINGPOINTS,
            growthRatio:GROWTHRATIO,
            pointsPerLevel:POINTSPERLEVEL,
            growthRatio:GROWTHRATIO
        }
    }

}
