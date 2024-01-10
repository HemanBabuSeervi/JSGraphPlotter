let settings;
let canvas=document.getElementById("graph");
canvas.width=window.innerWidth*2;
canvas.height=window.innerHeight*2;
let body=document.getElementsByTagName('body')[0];
body.scrollLeft=window.innerWidth*0.5;
body.scrollTop=window.innerHeight*0.5;


class Settings{
    constructor(equation, units, pixelLenRatio, zeroPoint, mouseX, colorPlot,  colorAxes, colorGrid){
        this.equation=equation;
        this.units=units;
        this.pixelLenRatio = pixelLenRatio ?? [50,50];
        this.zeroPoint = zeroPoint ?? [canvas.width/2, canvas.height/2];
        this.mouseX = mouseX ?? this.units[0];
        this.colorPlot = colorPlot ?? (settings!=undefined ? settings.colorPlot : undefined) ?? "rgb(255, 30, 0)";
        this.colorAxes = colorAxes ?? (settings!=undefined ? settings.colorAxes : undefined) ?? "rgb(0,0,0)";
        this.colorGrid = colorGrid ?? (settings!=undefined ? settings.colorGrid : undefined) ?? "rgb(80, 112, 255)";
    }
}
let ctx=canvas.getContext("2d");

function addAlpha(color, alpha){
    return color.trim().slice(0, -1)+","+alpha+")";
}

//Formula:
//pixelX = zeroPointX + pixelLenRatioX*pointX
function pointXToPixelX(pointX){
    return settings.zeroPoint[0] + settings.pixelLenRatio[0]*pointX;
}
function pixelXToPointX(pixelX){
    return (pixelX-settings.zeroPoint[0])/settings.pixelLenRatio[0];
}

//Formula:
//pixelY = zeroPointY - pixelLenRatioY*pointY
function pointYToPixelY(pointY){
    return settings.zeroPoint[1] - settings.pixelLenRatio[1]*pointY;
}
function pixelYToPointY(pixelY){
    return (-pixelY + settings.zeroPoint[1])/settings.pixelLenRatio[1];
}
function drawLines(strokeStyle, lineWidth, step, init){
    ctx.strokeStyle=strokeStyle;
    ctx.lineWidth=lineWidth;
    ctx.beginPath();

    let x=init[0]+step[0];
    while(x<canvas.width){
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        x+=step[0];
    }
    x=init[0]-step[0];
    while(x>0){
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        x-=step[0];
    }

    let y=init[1]+step[1];
    while(y<canvas.height){
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        y+=step[1];
    }
    y=init[1]-step[1];
    while(y>0){
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        y-=step[1];
    }
    ctx.stroke();
    ctx.closePath();
}
function numerateAxesPoints(){
    fontSize=settings.pixelLenRatio[0]*0.5;
    readabilityCorrection=fontSize*0.6;
    ctx.font = fontSize+"px serif";
    ctx.fillStyle = settings.colorAxes;
    ctx.textAlign = "center";

    ctx.fillText('0',
        pointXToPixelX(0)-readabilityCorrection,
        pointYToPixelY(0)+readabilityCorrection );
    let x=settings.units[0];
    while(pointXToPixelX(x)<canvas.width){
        ctx.fillText(x,
            pointXToPixelX(x)-readabilityCorrection,
            pointYToPixelY(0)+readabilityCorrection );
        x+=settings.units[0];
    }
    x=-settings.units[0];
    while(pointXToPixelX(x)>0){
        ctx.fillText(x,
            pointXToPixelX(x)-readabilityCorrection,
            pointYToPixelY(0)+readabilityCorrection);
        x-=settings.units[0];
    }

    let y=settings.units[1];
    while(pointYToPixelY(y)>0){
        ctx.fillText(y,
            pointXToPixelX(0)-readabilityCorrection,
            pointYToPixelY(y)+readabilityCorrection);
        y+=settings.units[1];
    }
    y=-settings.units[1];
    while(pointYToPixelY(y)<canvas.height){
        ctx.fillText(y,
            pointXToPixelX(0)-readabilityCorrection,
            pointYToPixelY(y)+readabilityCorrection);
        y-=settings.units[1];
    }
}

function drawGraph(newSettings){
    settings=newSettings ?? settings;
    const baseColor=addAlpha(settings.colorGrid, 0.2);
    const thinLines=addAlpha(settings.colorGrid, 0.5);
    const thickLines=settings.colorGrid;
    const axesColor=settings.colorAxes;
    const curveColor=settings.colorPlot;

    //Reset Canvas to White
    ctx.fillStyle="white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    //Paint Canvas to GridTheme
    ctx.fillStyle=baseColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);


    //Drawing Axes
    ctx.strokeStyle=axesColor;
    ctx.lineWidth=2;
    ctx.beginPath();
    ctx.moveTo(0, settings.zeroPoint[1]);
    ctx.lineTo(canvas.width, settings.zeroPoint[1]);
    ctx.moveTo(settings.zeroPoint[0], 0);
    ctx.lineTo(settings.zeroPoint[0], canvas.height);
    ctx.stroke();
    ctx.closePath();


    //Drawing ThinLines;
    drawLines(thinLines, 1,
        [settings.pixelLenRatio[0]*settings.units[0]/10, settings.pixelLenRatio[1]*settings.units[1]/10],
        settings.zeroPoint);
    //Drawing ThickLines;
    drawLines(thickLines, 2,
        [settings.pixelLenRatio[0]*settings.units[0], settings.pixelLenRatio[1]*settings.units[1]],
        settings.zeroPoint);
    numerateAxesPoints();
    //Plotting Graph
    ctx.strokeStyle=curveColor;
    ctx.beginPath();
    let pixelX=0;
    const f = math.parse(settings.equation);
    if(f==null || f==undefined) alert("Invalid Function.");
    while(pixelX<canvas.width){
        let y=f.evaluate( { x : pixelXToPointX(pixelX) } );
        let pixelY;
        pixelY = pointYToPixelY(y);
        if(pixelX==0) ctx.moveTo(0, pixelY);
        else ctx.lineTo(pixelX, pixelY);
        pixelX+=1;
    }
    ctx.stroke();
    ctx.closePath();

    //MouseHoverValues
    ctx.beginPath();
    ctx.arc(
        pointXToPixelX(settings.mouseX),
        pointYToPixelY(f.evaluate( { x : settings.mouseX })),
        5,
        0,
        2*Math.PI
    );
    ctx.fillStyle=curveColor;
    ctx.fill();
    ctx.closePath();
    let x=settings.mouseX.toFixed(2);
    let X=pointXToPixelX(x);
    let y=f.evaluate({x : x}).toFixed(2);
    let Y=pointYToPixelY(y);
    let offset=6;
    ctx.fontSize=16;
    ctx.textAlign='left';
    ctx.fillText('('+x+','+y+')',X+offset,Y+offset);

}
function drawGraphDOM(){
    const equation=document.getElementById("eq").value;
    let newSettings=new Settings(
        equation,
        settings.units,
        settings.pixelLenRatio
    );
    drawGraph(newSettings);
}
function reScaleDOM(){
    const scaleX=Number(document.getElementById('scaleX').value);
    const scaleY=Number(document.getElementById('scaleY').value);
    const pixelLenRatioX=(settings.units[0]/scaleX)*settings.pixelLenRatio[0];
    const pixelLenRatioY=(settings.units[1]/scaleY)*settings.pixelLenRatio[1];
    let newSettings=new Settings(
        settings.equation,
        [scaleX, scaleY],
        [pixelLenRatioX, pixelLenRatioY]
    );
    drawGraph(newSettings);
}
function evaluateDOM(){
    const x=Number(document.getElementById('ev').value);
    const evResultDOM=document.getElementById('ev-result');
    evResultDOM.innerHTML=math.parse(settings.equation).evaluate( { x : x } ).toFixed(3);
}
function toggleOptionsVisible(){
    let options=document.getElementById('options');
    let gear=document.querySelector('#settings>button');
    if(options.style.display=="none" || options.style.display==""){
        options.style.display="block";
        gear.style.display="none";
    } else {
        options.style.display="none";
        gear.style.display="inline";
    }
}
function themeChange(){
    canvas.width=sheetWidthDOM.value;
    canvas.height=sheetHeightDOM.value;
    drawGraph(
        new Settings( settings.equation,
                    settings.units,
                    settings.pixelLenRatio,
                    [canvas.width/2, canvas.height/2],
                    settings.mouseX,
                    plotColorDOM.value,
                    axesColorDOM.value,
                    sheetColorDOM.value
        )
    );
    toggleOptionsVisible();
}
function downloadGraph(){
    let imgURL = canvas.toDataURL('image/png');
    let anchor = document.createElement('a');
    anchor.href=imgURL;
    anchor.download="plot.png";
    anchor.click();
}
drawGraph( new Settings("x*sin(x)", [1,1] ,[40,40]));

//Populating settings Panel
let sheetWidthDOM=document.querySelector("#w");
let sheetHeightDOM=document.querySelector("#h");
let precisionDOM=document.querySelector("#prec");
let sheetColorDOM=document.querySelector("#sc");
let axesColorDOM=document.querySelector("#ac");
let plotColorDOM=document.querySelector("#pc");
sheetWidthDOM.value=canvas.width;
sheetHeightDOM.value=canvas.height;
precisionDOM.value=settings.pixelLenRatio[0];
sheetColorDOM.value=settings.colorGrid;
axesColorDOM.value=settings.colorAxes;
plotColorDOM.value=settings.colorPlot;


canvas.addEventListener('mousemove', (event)=>{
    drawGraph(
        new Settings(
            settings.equation,
            settings.units,
            [precisionDOM.value, precisionDOM.value],
            settings.zeroPoint,
            pixelXToPointX(event.clientX-canvas.getBoundingClientRect().left)
        )
    );
});
