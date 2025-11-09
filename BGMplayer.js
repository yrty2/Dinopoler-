const BGMList=[document.getElementById("BGM1"),document.getElementById("BGM2"),document.getElementById("BGM3"),document.getElementById("BGM4"),document.getElementById("BGM5")]
function play(name,volume){
    const a=new Audio();
    a.src=`Sounds/${name}.wav`;
    a.type="audio/wav";
    a.volume=clamp(volume*exss,0,1);
    a.play();
}
function setBGMsub(name,volume,loop){
    for(const g of BGMList){
        g.loop=false;
        g.currentTime=0;
        g.pause();
    }
    const a=document.getElementById(name);
    a.loop=loop;
    a.play();
}
function setBGM(name,volume,loop){
    var divvolm=dv(volume*exss);
    for(const d of divvolm){
        setBGMsub(name,d,loop);
    }
}
function dv(value){
    var res=[];
    while(value>1){
        res.push(1);
        value--;
    }
    res.push(value);
    return res;
}
function BGMtest(){
    function test(id,to,volume){
        const a=BGMList[id-1];
        if(a.currentTime>=a.duration && a.loop){
            a.currentTime=0;
            setBGM(`BGM${to}`,volume,true);
        }
    }
        //3,4,5切り替え
    test(1,4,0.5);
    test(4,5,0.4);
    test(5,1,0.2);
}
function stopBGM(){
    for(const g of BGMList){
        g.loop=false;
        g.pause();
    }

}
function upperBGM(){
    for(const g of BGMList){
        g.preservesPitch=false;
        g.playbackRate=1.2;
    }
}
function downerBGM(){
    for(const g of BGMList){
        g.playbackRate=1;
    }

}
