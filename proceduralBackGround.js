var bgtype=0;
var backgroundGenerated=[];
var background=[];
var randomTable = [];
var permX = [];
var permY = [];
var tableSize=255;
var scale=12;
function perlin(x,y){
  // (x,y)座標がどの正方形ブロックに入っているか
  var i=Math.floor(x);
  var j=Math.floor(y);
  // 左下の座標からの距離
  var xf=(x-i);
  var yf=(y-j);
  //rairoh
  // 周囲の4つの整数座標ごとの影響値
  // (勾配ベクトルと距離ベクトルの内積)
  // gXX ... 各点の勾配ベクトル
  // sXX ... 各点から今見ているピクセル座標を指すベクトル
  // vXX ... gXXとsXXの内積（ドット積）
    var v=[];
    for(let I=0; I<=1; ++I){
    for(let J=0; J<=1; ++J){
        v.push(dot(grad(i+I,j+J),[xf-I, yf-J]));
    }
    }
  // より自然な変化を見せるための補正
  var ux=fade(xf);
  var uy=fade(yf);
  // 最終的な周囲の4点からの影響値の平均
  return (lerpF(lerpF(v[0],v[2],ux),lerpF(v[1],v[3],ux),uy)+1)/2;
}
function lerpF(a, b, t) {
  return a+t*(b-a);
}
function fade(t) {
    return t*t*t*(t*(t*6-15)+10);   
}

function setupRandomTable() {
  for(var i = 0; i < tableSize; i++) {
    randomTable.push([2*Math.random()-1,2*Math.random()-1]);
  }
  for(var j = 0; j < tableSize; j++) {
    permX[j]=j;
    permY[j]=j;
  }
  permX = shuffle(permX).slice();
  permY = shuffle(permY).slice();
}
function shuffle(A){
    const res=[];
    var id=-1;
    for(let k=0; k<A.length; ++k){
    while(id==-1 || res.indexOf(A[id])!=-1){
        id=math.randInt(0,A.length-1);
    }
        res.push(A[id]);
    }
    return res;
}
function dot(u,v){
    return u[0]*v[0]+u[1]*v[1];
}
function grad(a, b) {
  var pY = permY[(b + permX[a % tableSize]) % tableSize];
  return [randomTable[pY][0], randomTable[pY][1]];
}
//ブラウン運動
function fbm(x,y,octaves,falloff){
  var sum = 0.0;
  var freq = 1.0;
  var amp = 1.0;
  var max = 0.0;
  for(let o=0; o<octaves; o++) {
    sum += perlin(x*freq, y*freq) * amp;
    max += amp;
    amp *= falloff;
    freq *= 2.0;
  }
  return sum/max;
}
function generate(index){
    if(backgroundGenerated.findIndex(e=>e.join()==index.join())==-1){
    backgroundGenerated.push(index);
        if(bgtype==0){
    var noiseScale=0.012/4;
  for(let w=0; w<scale; w++){
    for(let h = 0; h<scale; h++){
        var x=w+scale*index[0];
        var y=h+scale*index[1];
      var n=fbm(Math.abs(x*noiseScale+200),Math.abs(y*noiseScale-200),20,0.55);
    var biome=fbm(Math.abs(x*noiseScale/2+n+200),Math.abs(y*noiseScale/2+n-200),1,0.55);
        var l=0.63;
        var H=188;
        if(biome>0.5){
            H=192;
            //l-=0.05;
            n=Math.abs(Math.sin(2*n*Math.PI))-0.1;
        }
        if(n>0.58){
            l=0.68;
        }else if(n>0.55){
            l=0.65;
        }else if(n>0.5){
            l=0.63;
        }else if(n>0.4){
            l=0.60;
        }else if(n>0.3){
        }else if(n>0.2){
            l=0.55;
        }else if(n>0){
            l=0.4;
        }else if(n>-0.05){
            l=0.3;
        }else if(n>-0.08){
            l=0.25;
        }else if(n>-0.09){
            l=0.2;
        }else{
            l=0.1;
        }
        background.push({pos:[x-scale/2,y-scale/2],value:n,color:math.hsl2rgb(H,0.59,l)});
    }
  }
            }else{
            mandelbrot(index);
            }
        }
}
setupRandomTable();
//generate([0,0]);
function mandelbrot(index){
    var N=200;
    for(let w=0; w<scale; w++){
    for(let h = 0; h<scale; h++){
        var x=w+scale*index[0];
        var y=h+scale*index[1];
        var n=1;
        var z=new complex(x/30000+0.383887282,y/30000+0.15309722);//z=x+yi
        var c=z;
        while(c.abs<2){
            c=cmath.sum(cmath.pow(c,new complex(2,0)),z);
            n++;
            if(n==N){
                break;
            }
        }
    background.push({pos:[x-scale/2,y-scale/2],value:n,color:math.hsl2rgb(188,0.59,0.63*(1-n/100))});
    }
        }
}
setupRandomTable();