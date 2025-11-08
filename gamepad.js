    var gpIndex=-1;
    var gp=null;
var gpk=[false,false,false,false,false,false];
var gps={
    left:false,
    key:{
        w:false,
        a:false,
        s:false,
        d:false
    }
};
window.addEventListener("gamepadconnected",e=>{
    gpIndex=e.gamepad.index;//これいらん？
    controler();
});
function controler(){
    gp=navigator.getGamepads()[gpIndex];
    //animationframeのたびに発動
    function gpb(gpkid,id,key){
        if(gp.buttons[id].pressed && !gpk[gpkid]){
        gpk[gpkid]=true;
        keydowner({code:key});
    }
    if(gpk[gpkid] && !gp.buttons[id].pressed){
        gpk[gpkid]=false;
        keyupper({code:key});
    }
    }
    gpb(0,0,"KeyZ");//B
    gpb(5,1,"KeyG");//A
    //十字キー処理群
    gpb(1,12,"KeyW");//up
    gpb(2,14,"KeyA");//left
    gpb(3,13,"KeyS");//up
    gpb(4,15,"KeyD");//up
    //left-stick
    const c=new complex(gp.axes[0],gp.axes[1]);
        const ang=c.arg;//-pi~pi
    if(c.abs>0){
        const ext=Math.PI*(15)/180;
        gps.left=true;
        //console.log(ang/Math.PI*180);
        if(!gps.key.s && Math.PI/4-ext<=ang && ang<3*Math.PI/4+ext){
            gps.key.s=true;
            keydowner({code:"KeyS"});
        }
        if(gps.key.s && !(Math.PI/4-ext<=ang && ang<3*Math.PI/4+ext)){
            gps.key.s=false;
            keyupper({code:"KeyS"});
        }
        if(!gps.key.d && (-Math.PI/4-ext<=ang && ang<Math.PI/4+ext)){
            gps.key.d=true;
            keydowner({code:"KeyD"});
        }
        if(gps.key.d && !(-Math.PI/4-ext<=ang && ang<Math.PI/4+ext)){
            gps.key.d=false;
            keyupper({code:"KeyD"});
        }
        if(!gps.key.w && (-3*Math.PI/4-ext<=ang && ang<-Math.PI/4+ext)){
            gps.key.w=true;
            keydowner({code:"KeyW"});
        }
        if(gps.key.w && !(-3*Math.PI/4-ext<=ang && ang<-Math.PI/4+ext)){
            gps.key.w=false;
            keyupper({code:"KeyW"});
        }
        if(!gps.key.a && (-3*Math.PI/4+ext>ang || ang>=3*Math.PI/4-ext)){
            gps.key.a=true;
            keydowner({code:"KeyA"});
        }
        if(gps.key.a && !(-3*Math.PI/4+ext>ang || ang>=3*Math.PI/4-ext)){
            gps.key.a=false;
            keyupper({code:"KeyA"});
        }
    }
    
    if(c.abs==0 && gps.left){
        gps.left=false;
        gps.key.w=false;
        gps.key.a=false;
        gps.key.s=false;
        gps.key.d=false;
            keyupper({code:"KeyW"});
            keyupper({code:"KeyA"});
            keyupper({code:"KeyS"});
            keyupper({code:"KeyD"});
    }
    requestAnimationFrame(controler);
}