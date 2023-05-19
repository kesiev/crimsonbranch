function Printer(svg,debug) {

    this.getPlaceholder=function(id,parent) {
        let
            node=svg.getById(id,parent);
            box={
                x:svg.getNum(node,"x"),
                y:svg.getNum(node,"y"),
                width:svg.getNum(node,"width"),
                height:svg.getNum(node,"height")
            };
        node.parentNode.removeChild(node);
        return box;
    }
    
    this.cloneNodeBy=function(into,id,newid,dx,dy,rotate,before) {
        let copy=0,org,edgex=0,edgey=0,edgewidth=0,edge,ex,ey;
        if (typeof id == "string") org=svg.getById(id);
        else org=id;
        if (org) {
            copy=svg.copyNode(org);
            if (newid) svg.setId(copy,newid);

            for (let i=0;i<copy.childNodes.length;i++)
                if (copy.childNodes[i].setAttribute) {
                    let node=copy.childNodes[i];
                    node.removeAttribute("transform");
                    if (!edge && (node.tagName=="rect")) {
                        edge=node;
                        edgex=svg.getNum(node,"x");
                        edgey=svg.getNum(node,"y");
                        edgewidth=svg.getNum(node,"width");
                        edgeheight=svg.getNum(node,"height");
                    }
                }

            ex=dx-edgex;
            ey=dy-edgey;
            svg.moveNodeAt(copy,0,0);

            if (rotate)
                copy.setAttribute("transform","translate("+ex+","+ey+") rotate("+rotate+","+(edgex+edgewidth/2)+","+(edgey+edgeheight/2)+")");
            else
                copy.setAttribute("transform","translate("+ex+","+ey+")");

            if (edge) copy.removeChild(edge);

            if (before)
                svg.insertBefore(before,copy);
            else if (into)
                into.appendChild(copy);
            else
                svg.insertBefore(org,copy);
        }

        return copy;
    }

    this.addRect=function(box,color,opacity,before) {
        if (opacity === undefined) opacity=1;
        if (color === undefined) color="#ff0000";
        let rect=svg.createNode("rect");
        rect.setAttribute("style","fill:"+color+";fill-opacity:"+opacity);
        rect.setAttribute("width",box.width);
        rect.setAttribute("height",box.height);
        rect.setAttribute("x",box.x);
        rect.setAttribute("y",box.y);
        if (typeof before=="string")
            before=svg.getById(before);
        svg.insertBefore(before,rect);
    }

    this.measureNode=function(node) {
        let box=node.getBBox();
        return {
            width:box.width,
            height:box.height
        };
    }

    this.measureNodeById=function(id) {
        return this.measureNode(svg.getById(id));
    }

    this.setBackgroundColor=function(id,color,parent) {
        let node=svg.getById(id,parent);
        node.setAttribute("style",node.getAttribute("style").replace(/fill:[^;]*/,"fill:"+color));
    }

    this.deleteNode=function(list) {
        list.forEach(id=>{
            let node=svg.getById(id);
            svg.delete(node);
        })
    }

    this.richPrint=function(settings,x,y,width,height,text) {

        text=text+"";
        
        let
            right=0,
            orgTextNode=svg.getById(settings.modelId),
            normalTextNode=this.cloneNodeBy(0,orgTextNode,0,0,0),
            boldTextNode=this.cloneNodeBy(0,orgTextNode,0,0,0),
            word="",
            lines=[],
            lineId=-1,
            firstWord=true,
            cursorX=0,
            cursorY=0,
            columnX=0,
            tabSize=0,
            oy=0,
            lineHeight=0,
            contentWidth=0,
            contentHeight=0,
            tag=false,
            bold=false,
            firstNode,
            i=0;

        if (debug)
            this.addRect({x:x,y:y,width:width,height:height},"#f00",0.3,"mediumText");
            
        let disableKerning=(node)=>{
            node.setAttribute("style",node.getAttribute("style")+";font-kerning: none;");
        }
        
        let measureSymbol=(node)=>{
            if (node) {
                let rect=node.querySelector("rect");
                if (rect) return this.measureNode(rect);
            } else return {width:0,height:0};
        }

        let setBold=(node)=>{
            let span=node.querySelector("tspan");
            span.setAttribute("style",span.getAttribute("style").replace(/font-family:[^;]+/,"font-family:Times"));
            span.setAttribute("style",span.getAttribute("style").replace("font-weight:normal","font-weight:bold"));
        }

        let printWord=()=>{
            let tabWord=false;
            if (word) {
                let node=0;
                if (tag) {
                    let parts=word.split(" ");
                    switch (parts[0]) {
                        case "symbol":{
                            node={
                                symbol:parts[1],
                                size:measureSymbol(svg.getById(parts[1]))
                            }
                            word="";
                            break;
                        }
                        case "tab":{
                            node={
                                spacer:settings.tabSize
                            };
                            word="";
                            break;
                        }
                        case "list":{
                            word=parts[1];
                            tabWord=true;
                            break;
                        }
                        case "bold":{
                            bold=true;
                            word="";
                            break;
                        }
                        case "endbold":{
                            bold=false;
                            word="";
                            break;
                        }
                    }
                }
                if (word) {
                    let size;
                    if (bold) {
                        svg.setText(boldTextNode,word);
                        size=this.measureNode(boldTextNode);
                    } else {
                        svg.setText(normalTextNode,word);
                        size=this.measureNode(normalTextNode);
                    }
                    node={
                        text:word,
                        bold:bold,
                        size:size,
                        tabWord:tabWord
                    };
                }
                if (node) {
                    if (node.spacer) {
                        if (cursorX+node.spacer>width)
                            newLine();
                        tabSize+=node.spacer;
                        cursorX+=node.spacer;
                    } else {
                        if (!firstWord) {
                            cursorX+=settings.wordSpacing;
                            if (node.tabWord) tabSize+=settings.wordSpacing
                        }
                        if (cursorX+node.size.width>width)
                            newLine();
                        firstWord=false;
                        node.x=cursorX;
                        lines[lineId].boxes.push(node);
                        lineHeight=Math.max(lineHeight,node.size.height);
                        cursorX+=node.size.width;
                        if (node.tabWord)
                            tabSize+=node.size.width+settings.wordSpacing;
                    }
                    right=Math.max(right,cursorX);
                }
                word="";
            }
        }

        let closeLine=()=>{
            lines[lineId].width=cursorX;
            lines[lineId].height=lineHeight;
            contentWidth=Math.max(contentWidth,cursorX);
        }

        let newLine=(resetTabSize)=>{
            if (lineId!=-1) closeLine();
            if (resetTabSize) tabSize=0;
            lineId++;
            if (lineId>0) cursorY+=(lineHeight||settings.defaultLineHeight)+settings.lineSpacing;
            if (settings.columnDistance && (cursorY+settings.defaultLineHeight>height)) {
                cursorY=0;
                columnX+=width+settings.columnDistance;
            }
            cursorX=tabSize;
            firstWord=true;
            lineHeight=0;
            lines.push({
                y:cursorY,
                columnX:columnX,
                width:0,
                height:0,
                boxes:[]
            });
        }

        disableKerning(normalTextNode);
        disableKerning(boldTextNode);

        setBold(boldTextNode);

        newLine();

        while (i<text.length) {
            let ch=text[i];
            switch (ch) {
                case " ":{
                    if (tag) word+=ch;
                    else printWord();
                    break;
                }
                case "\n":{
                    if (!tag) {
                        printWord();
                        newLine(true);
                    }
                    break;
                }
                case "{":{
                    printWord();
                    tag=true;
                    break;
                }
                case "}":{
                    if (tag) {
                        printWord();
                        tag=false;
                    } else word+=ch;
                    break;
                }
                default:{
                    word+=ch;
                }
            }
            i++;
        }

        if (word) printWord();
        closeLine();
        contentHeight=cursorY+lineHeight;

        switch (settings.verticalAlignment) {
            case "center":{
                oy=y+(height-contentHeight)/2;
                break;
            }
            case "bottom":{
                oy=y+(height-contentHeight);
                break;
            }
            default:{
                oy=y;
            }
        }

        lines.forEach(line=>{
            let
                ox=0,
                bdx=0;
            switch (settings.horizontalAlignment) {
                case "center":{
                    ox=x+(width-line.width)/2;
                    break;
                }
                case "right":{
                    ox=x+width-line.width;
                    break;
                }
                case "justify":{
                    ox=x;
                    // Find the left margin
                    let mx,ml=0,mw=0,bdx,borderFound=false,padfrom=0;
                    for (let j=0;j<line.boxes.length;j++) {
                        if (!borderFound && !line.boxes[j].tabWord) {
                            mx=line.boxes[j].x;
                            padfrom=j;
                            borderFound=true;
                        }
                        if (borderFound) {
                            ml+=line.boxes[j].size.width;
                            mw++;
                        }
                    }
                    bdx=(width-mx-ml)/(mw-1);
                    if (bdx<=settings.wordWrapSize) {
                        let cursor=mx;
                        for (let j=padfrom;j<line.boxes.length;j++) {
                            line.boxes[j].x=cursor;
                            cursor+=line.boxes[j].size.width+bdx;
                        }
                    }
                    break;
                }
                default:{
                    ox=x;
                }
            }
            line.boxes.forEach((box,id)=>{
                let
                    node,
                    dx=line.columnX+box.x+ox+(id*bdx),
                    dy=oy+line.y+(line.height-box.size.height)/2;
                if (box.text) {
                    node=this.cloneNodeBy(0,orgTextNode,0,dx,dy+box.size.height-settings.textGap);
                    if (debug)
                        this.addRect({x:dx,y:dy,width:box.size.width,height:+box.size.height},"#0f0",0.3,"mediumText");
                    disableKerning(node);
                    svg.setText(node,box.text);
                    if (box.bold) setBold(node);
                    if (node&&!firstNode)
                        firstNode=node;
                }
                if (box.symbol)
                    node=this.cloneNodeBy(0,box.symbol,0,dx,dy);
            });
            
        });
        
        svg.delete(normalTextNode);
        svg.delete(boldTextNode);

        return {
            firstNode:firstNode,
            right:right
        };

    }

}
