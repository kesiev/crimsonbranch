function ManualPrinter(book,svg) {

    const
        COLUMNDISTANCE=6,
        COLUMNSEPARATORSIZE=0.25,
        DEBUG=false,
        BLACK="#000000",
        MANUALFONT={
            modelId:"mediumText",
            wordSpacing:0.5,
            lineSpacing:0.25,
            horizontalAlignment:"justify",
            verticalAlignment:"top",
            textGap:0,
            defaultLineHeight:2,
            columnDistance:COLUMNDISTANCE,
            wordWrapSize:3,
            tabSize:1
        };

    this.print=(language,gamename,gameplayurl)=>{
       const
            PAGEWIDTH=210,
            PAGEHEIGHT=297,
            FRAMESIZE=10,
            PLACEHOLDERS={ gameName:gamename, gamePlayUrl:gameplayurl };

        [
            { heading:"{symbol manualHeader}\n\n", content:language.translate("manual",PLACEHOLDERS), columns:3 },
            { heading:"{symbol extrasHeader}\n\n", content:language.translate("extras",PLACEHOLDERS), columns:3 },
        ].forEach(page=>{
            svg.reset();
            const P=new Printer(svg,DEBUG);
            let
                pageWidth=PAGEWIDTH-FRAMESIZE*2,
                pageHeight=PAGEHEIGHT-FRAMESIZE*2,
                columnWidth=(pageWidth-COLUMNDISTANCE*(page.columns-1))/page.columns,
                shortColumnHeight=pageHeight-3,
                lineSpacing=((COLUMNDISTANCE-COLUMNSEPARATORSIZE)/2),
                textFormat=(page.heading+page.content)
                    .trim()
                    .replace(/\*\*([^*]+)\*\*/g,"{bold}$1{endbold}")
                    .replace(/_([^_]+)_/g,"{bold}$1{endbold}")
                    .replace(/#### ([^\n]+)/g,"{bold}$1{endbold}")
                    .replace(/### ([^\n]+)/g,"{symbol titleSeparator} {bold}$1{endbold}")
                    .replace(/## ([^\n]+)/g,"{bold}$1{endbold}")
                    .replace(/# ([^\n]+)\n/g,"")
                    .replace(/\[([^\]]+)\]\(([^\)]+)\)/g,"$1 ($2)")
                    .replace(/\n  /g,"\n")
                    .replace(/  /g,"{tab}")
                    .replace(/ - /g,"{list -}")
                    .replace(/ ([0-9]+)\. /g,"{list $1)}");
                P.richPrint(
                    MANUALFONT,
                    FRAMESIZE,
                    FRAMESIZE,
                    columnWidth,shortColumnHeight,textFormat.replace(/\{glyph ([^}]+)\}/g,"{symbol $1Symbol}")
                );
            for (let i=1;i<page.columns;i++)
                P.addRect({x:FRAMESIZE+((columnWidth+COLUMNDISTANCE)*i)-lineSpacing,y:FRAMESIZE,width:COLUMNSEPARATORSIZE,height:pageHeight},BLACK,1,"mediumText");
            svg.finalize();
            book.addPage(svg);
        })

    }

}
