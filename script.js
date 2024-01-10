let settings;
let canvas=document.getElementById("graph");
canvas.width=window.innerWidth;
canvas.height=window.innerHeight;
class Settings{
    constructor(equation, units, pixelLenRatio, zeroPoint, colorCurve,  colorAxes, colorGrid, colorFont){
        this.equation=equation;
        this.units=units;
        this.pixelLenRatio = pixelLenRatio ?? [50,50];
        this.zeroPoint = zeroPoint ?? [canvas.width/2, canvas.height/2];
        this.colorCurve = colorCurve ?? "rgb(255, 112, 80)";
        this.colorAxes = colorAxes ?? "rgb(0,0,0)";
        this.colorGrid = colorGrid ?? "rgb(80, 112, 255)";
        this.colorFont = colorFont ?? "rgb(80, 80, 0)";
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
}
function numerateAxesPoints(){
    fontSize=25;
    ctx.font = fontSize+"px serif";
    ctx.fillStyle = settings.colorFont;
    ctx.textAlign = "center";

    ctx.fillText('0', pointXToPixelX(0)-fontSize, pointYToPixelY(0)+fontSize);
    let x=settings.units[0];
    while(pointXToPixelX(x)<canvas.width){
        ctx.fillText(x, pointXToPixelX(x)-fontSize, pointYToPixelY(0)+fontSize);
        x+=settings.units[0];
    }
    x=-settings.units[0];
    while(pointXToPixelX(x)>0){
        ctx.fillText(x, pointXToPixelX(x)-fontSize, pointYToPixelY(0)+fontSize);
        x-=settings.units[0];
    }

    let y=settings.units[1];
    while(pointYToPixelY(y)>0){
        ctx.fillText(y, pointXToPixelX(0)-fontSize, pointYToPixelY(y)+fontSize);
        y+=settings.units[1];
    }
    y=-settings.units[1];
    while(pointYToPixelY(y)<canvas.height){
        ctx.fillText(y, pointXToPixelX(0)-fontSize, pointYToPixelY(y)+fontSize);
        y-=settings.units[1];
    }
}

function drawGraph(newSettings){
    settings=newSettings;
    const baseColor=addAlpha(settings.colorGrid, 0.2);
    const thinLines=addAlpha(settings.colorGrid, 0.5);
    const thickLines=settings.colorGrid;
    const axesColor=settings.colorAxes;
    const curveColor=settings.colorCurve;

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
    while(pixelX<canvas.width){
        let pixelY = pointYToPixelY(f.evaluate( { x : pixelXToPointX(pixelX) } ) );
        if(pixelX==0) ctx.moveTo(0, pixelY);
        else ctx.lineTo(pixelX, pixelY);
        pixelX+=1;
    }
    ctx.stroke();
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
drawGraph( new Settings("x*sin(x)", [1,1] ,[40,40]));
