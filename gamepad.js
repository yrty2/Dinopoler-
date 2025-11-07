    var gpIndex=-1;
    var gp=null;
var gpk=[false,false,false,false,false];
window.addEventListener("gamepadconnected",e=>{
  alert("Hello Gamepad!");
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
    gpb(1,12,"KeyW");//up
    gpb(2,14,"KeyA");//up
    gpb(3,13,"KeyS");//up
    gpb(4,15,"KeyD");//up
    requestAnimationFrame(controler);
}