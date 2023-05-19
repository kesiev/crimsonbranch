
function UI(root) {

    function addNode(parent,type,data) {
        let node=document.createElement(type);
        if (data.className!==undefined) node.className=data.className;
        if (data.type!==undefined) node.type=data.type;
        if (data.innerHTML!==undefined) node.innerHTML=data.innerHTML;
        if (data.value!==undefined) node.value=data.value
        if (data.onClick!==undefined) node.onclick=data.onClick;
        if (data.style)
            for (let k in data.style)
                node.style[k]=data.style[k];
        if (parent) parent.appendChild(node);
        return node;
    }

    this.addNode = addNode;

    let
        screen = addNode(root || document.body,"div",{ className:"screen" }),
        display = addNode(screen,"div",{ className:"display" });

    this.display = display;

    this.newPanel=(type,into)=>{
        if (!into) into=display;
        let
            frame=addNode(into,"div",{ className:"panel" }),
            inner=addNode(frame,"div",{ className:"inner" });
            panel={
                frame:frame,
                inner:inner,
                content:inner,
                hide:function() {
                    this.setType(type+" hide");
                },
                show:function() {
                    this.setType(type+" show");
                },
                setType:function(type) {
                    if (!type) type="none";
                    this.frame.className="panel "+type;
                },
                newText:function(html) {
                    let text=addNode(this.inner,"div",{ className:"text" });
                    text.innerHTML=html;
                    return text;
                },
                newBar:function(type) {
                    return addNode(this.inner,"div",{ className:"bar "+type });
                }
            };
        panel.hide();
        return panel;
    }

    this.newContainer=(type,html)=>{
        let
            node=addNode(display,"div",{ className:"container" }),
            container={
                node:node,
                setType:function(type) {
                    if (!type) type="none";
                    this.node.className="container "+type;
                },
                setHtml:function(html) {
                    this.node.innerHTML=html;
                }
            };
        container.setType(type);
        if (html!== undefined) container.setHtml(html);
        return container;
    }

    this.setClassByNode=(node,className)=>{
        if (!node) debugger;
        if (node) {
            if (!node._orgclass)
                node._orgclass=node.className;
            node.className=node._orgclass+" "+className;
        }
        return node;
    }

    this.setClass=(id,className)=>{
        return this.setClassByNode(document.getElementById(id),className);
    }

    this.addEvent=(node,type,callback)=>{
        node.addEventListener(type,callback);
    }

    this.removeEvent=(node,type,callback)=>{
        node.removeEventListener(type,callback);
    }

    this.clearDisplay=()=>{
        display.innerHTML="";
    }

    this.fadeOutDisplay=(cb)=>{
        display.className="display hide";
        setTimeout(()=>{
            this.clearDisplay();
            cb();
        },500);
    }

    this.fadeInDisplay=(cb)=>{
        display.className="display";
        if (cb)
            setTimeout(()=>{
                cb();
            },500);
    }

    this.gotoFullScreen=()=>{
        if (screen.requestFullscreen)
            screen.requestFullscreen();
        else if (screen.webkitRequestFullscreen)
            screen.webkitRequestFullscreen();
        else if (display.msRequestFullscreen)
            screen.msRequestFullscreen();
    }

}
