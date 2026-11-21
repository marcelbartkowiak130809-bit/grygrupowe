const number = new Intl.NumberFormat("pl-PL", {maximumFractionDigits:3});
export const chartNumber = value => number.format(value);
const margin = (width,height) => ({left:width<420?46:59,top:17,right:17,bottom:32,width,height});

export function drawForecastSegment(draft, from, to) {
  if (from.index===to.index) {
    if (to.index>0) draft[to.index]=to.value;
    return;
  }
  for(let index=Math.max(1,Math.min(from.index,to.index));index<=Math.max(from.index,to.index);index++) {
    const fraction=(index-from.index)/(to.index-from.index);
    draft[index]=from.value+(to.value-from.value)*fraction;
  }
}

export function forecastPointer(canvas, chart, event, anchor) {
  const bounds=canvas.getBoundingClientRect();
  const {left,top,right,bottom,width,height}=margin(bounds.width,bounds.height);
  const x=Math.max(0,Math.min(1,(event.clientX-bounds.left-left)/(width-left-right)));
  const y=Math.max(0,Math.min(1,(event.clientY-bounds.top-top)/(height-top-bottom)));
  const index=Math.min(chart.values.length-chart.cut-1,Math.max(0,Math.round(x*(chart.values.length-1))-chart.cut));
  return {index,value:index===0?anchor:chart.scale[1]-y*(chart.scale[1]-chart.scale[0])};
}

export function paintForecastChart(canvas, chart, {draft=[], series=[], revealed=false, highlight="", progress=1, cursor=null}={}) {
  const bounds=canvas.getBoundingClientRect();
  if(!bounds.width||!bounds.height) return;
  const ratio=Math.min(3,window.devicePixelRatio||1);
  const width=Math.round(bounds.width), height=Math.round(bounds.height);
  const bitmapWidth=Math.floor(width*ratio), bitmapHeight=Math.floor(height*ratio);
  if(canvas.width!==bitmapWidth||canvas.height!==bitmapHeight) { canvas.width=bitmapWidth;canvas.height=bitmapHeight; }
  const {left,top,right,bottom}=margin(width,height);
  const w=width-left-right,h=height-top-bottom;
  const ctx=canvas.getContext("2d");
  const style=getComputedStyle(canvas);
  ctx.setTransform(ratio,0,0,ratio,0,0);
  ctx.clearRect(0,0,width,height);
  const [min,max]=chart.scale;
  const x=index=>left+w*index/(chart.labels.length-1);
  const y=value=>top+h*(max-value)/(max-min);
  const anchor=chart.values[chart.cut];
  ctx.fillStyle=style.getPropertyValue("--chart-hidden");
  ctx.fillRect(x(chart.cut),top,x(chart.labels.length-1)-x(chart.cut),h);
  ctx.font=`${width<430?10:12}px system-ui`;
  ctx.textBaseline="middle";
  ctx.textAlign="right";
  for(let step=0;step<=5;step++) {
    const value=min+(max-min)*step/5;
    const position=y(value);
    ctx.fillStyle=style.getPropertyValue("--chart-label");
    ctx.fillText(chartNumber(value),left-7,position);
    ctx.strokeStyle=style.getPropertyValue("--chart-grid");
    ctx.beginPath();ctx.moveTo(left,position);ctx.lineTo(width-right,position);ctx.stroke();
  }
  const final=chart.labels.length-1;
  const ticks=new Set([0,chart.cut,final]);
  const stride=Math.ceil(60*final/w);
  for(let index=stride;index<final;index+=stride) {
    if([...ticks].every(existing=>Math.abs(existing-index)*w/final>=45)) ticks.add(index);
  }
  ctx.textAlign="center";
  for(const index of ticks) {
    ctx.fillStyle=index===chart.cut?style.getPropertyValue("--chart-text"):style.getPropertyValue("--chart-label");
    ctx.fillText(chart.labels[index],x(index),height-bottom+17);
  }
  ctx.strokeStyle=style.getPropertyValue("--chart-divider");
  ctx.setLineDash([4,5]);ctx.beginPath();ctx.moveTo(x(chart.cut),top);ctx.lineTo(x(chart.cut),top+h);ctx.stroke();ctx.setLineDash([]);

  function line(values, start, color, thickness, opacity=1) {
    ctx.beginPath();
    values.forEach((value,index)=>index?ctx.lineTo(x(start+index),y(value)):ctx.moveTo(x(start),y(value)));
    ctx.strokeStyle=color;ctx.lineWidth=thickness;ctx.lineJoin="round";ctx.lineCap="round";
    ctx.globalAlpha=opacity;ctx.stroke();ctx.globalAlpha=1;
  }
  function withReveal(callback) {
    ctx.save();ctx.beginPath();ctx.rect(left-4,top-5,x(chart.cut)-left+(x(final)-x(chart.cut))*progress+5,h+10);ctx.clip();
    callback();ctx.restore();
  }
  const actualColor=style.getPropertyValue("--chart-actual");
  if(revealed) {
    for(const item of [...series].sort((a,b)=>Number(a.uid===highlight)-Number(b.uid===highlight))) {
      line([anchor,...item.values],chart.cut,item.color,item.uid===highlight?3.2:2,highlight&&item.uid!==highlight?0.42:.9);
    }
    withReveal(()=>line(chart.values,0,actualColor,3.1));
  } else {
    line(chart.values.slice(0,chart.cut+1),0,actualColor,3.1);
    if(draft.length>1) line(draft,chart.cut,style.getPropertyValue("--chart-own"),3.2);
  }
  ctx.beginPath();ctx.arc(x(chart.cut),y(anchor),5,0,Math.PI*2);
  ctx.fillStyle=style.getPropertyValue("--chart-actual");ctx.fill();
  ctx.strokeStyle=style.getPropertyValue("--chart-fill");ctx.lineWidth=2;ctx.stroke();
  if(cursor && !revealed) {
    const index=chart.cut+cursor.index, pointX=x(index), pointY=y(cursor.value);
    ctx.beginPath();ctx.arc(pointX,pointY,5,0,Math.PI*2);
    ctx.fillStyle=style.getPropertyValue("--chart-own");ctx.fill();
    ctx.strokeStyle=style.getPropertyValue("--chart-fill");ctx.lineWidth=2;ctx.stroke();
    const label=`${chart.labels[index]} · ${chartNumber(cursor.value)}`;
    const bubbleWidth=ctx.measureText(label).width+16;
    const bubbleX=Math.max(left,Math.min(pointX-bubbleWidth/2,width-right-bubbleWidth));
    const bubbleY=pointY-top>34?pointY-31:pointY+10;
    ctx.fillStyle=style.getPropertyValue("--chart-fill");
    ctx.strokeStyle=style.getPropertyValue("--chart-divider");
    ctx.lineWidth=1;
    ctx.beginPath();
    if(ctx.roundRect) ctx.roundRect(bubbleX,bubbleY,bubbleWidth,22,5);
    else ctx.rect(bubbleX,bubbleY,bubbleWidth,22);
    ctx.fill();ctx.stroke();
    ctx.fillStyle=style.getPropertyValue("--chart-text");ctx.fillText(label,bubbleX+bubbleWidth/2,bubbleY+11);
  }
}
