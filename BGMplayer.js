const BGMList=[document.getElementById("BGM1"),document.getElementById("BGM2"),document.getElementById("BGM3"),document.getElementById("BGM4"),document.getElementById("BGM5")]
function play(name,volume){
    const a=new Audio();
    a.src=`Sounds/${name}.wav`;
    a.type="audio/wav";
    a.volume=volume;
    a.play();
}
function setBGM(name,volume,loop){
    for(const g of BGMList){
        g.loop=false;
        g.pause();
    }
    const a=document.getElementById(name);
    a.loop=loop;
    a.volume=volume;
    a.play();
}
function BGMtest(){
    function test(id,to,volume){
        const a=BGMList[id-1];
        if(a.currentTime>=a.duration){
            a.currentTime=0;
            setBGM(`BGM${to}`,volume,true);
        }
    }
        //3,4,5切り替え
    test(1,4,0.2);
    test(4,5,0.2);
    test(5,1,0.1);
}