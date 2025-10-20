const canvas=document.querySelector(".canvas");
canvas.style.border="2px solid";
var neighbor=[];//近傍
var entity=[];
var camera=[0,0];
var select=0;
var modelLoaded=false;
var inst=[];
var gametime;
var preloaded=false;
var zclicked=false;
var deciding=false;
var aspect=1;
var key="";
const startTime=Date.now();
var end=false;
var lastRenderTime=0;
const fps=120;
var decdisplay=[];
var initialized=false;
var upgrading=false;
var transformed=false;
var clearValue={r:0.42,g:0.8,b:0.855,a:1.0};
var light=[1,1,1];
var fired=false;
var isTitle=true;
const distext=["scoredis","pinkshelldis","conchdis","redcoraldis","stats"];
var pose=false;
var angle=0;
var velocity=0;
var rotvelo=0;
var playerSeed;
var maxrotvelo=0.2;
var maxvelocity=0.01;
var p=new complex(0,0);
var mkeys={
    up:false,
    down:false,
    right:false,
    left:false,
    submit:false
};
const itemList=["gem","jellygem","midnight","lightsphere","gun","fishgem"]
var vertex=[];
class Game{
    constructor(generation){
    this.generation=generation;
    this.combo={
        interval:130,
        timer:0,
        chain:0,
        scoreMultiplication:1.12,
        mulmax:3,
        sound:["てれん","てれれん","てれれれん"]
    }
    this.immune={
        value:false,
        timer:0,
        interval:7,
        times:0,
        ite:10
    }
    this.otamamove={
        mode:0,
        interval:0,
        timer:0,
        anime:0,
        value:["otama0","otama0_2","otama0","otama0_3"]
    }
    this.score=0;
    this.scoreDisplay=0;
    this.goldenRate=1;
    this.undesire=0.1;
    this.minradius=2.5;
    this.radius=3.5;
    this.enemy=0;
    this.maxEnemy=10;
    this.item=0;
    this.maxItem=30;
    this.hp=4;
    this.maxhp=4;
    this.tidalpower={
        speedmultiplication:4,
        value:35,
        max:35,
        range:0.1,
        regene:{
            interval:6,
            timer:0
        },
        consumption:{
            interval:2,
            timer:0
        }
    }
    this.hidan={
        trigger:false,
        interval:7,
        timer:0,
        angle:0,
        anime:0,
        speed:0
    }
    this.playerModel="otama0";
    this.playerDirection=[1,1];
    this.progression=0;
    this.needed=4;
    this.phase=0;
    this.pinkshell=0;
    this.redcoral=0;
    this.conch=0;
    this.items=[];
    this.itemLost=5;
    }
    changeMaxHp(value){
        this.maxhp=value;
        for(const e of entity){
            if(e.name=="heart"){
                deleteEntity(e.seed);
            }
        }
        for(let k=0; k<value; ++k){
            add([0.95/aspect-0.11*k,-0.8],"heart",{name:"life"+(k+1),dynamic:false,attribute:"util",hide:false},0.6);
        }
    }
}
var game=new Game(1);

var size=0.025;
function generateVertex(){
    const s=size/2;
    vertex=[
        -s,-s,
        s,-s,
        -s,s,
        s,s
    ]
}
function generateIndex(){
    return [
        0,1,2,2,1,0,
        1,2,3,3,2,1
    ]
}
const pic=document.querySelector("#pic");
pic.addEventListener("click",e=>{
    if(!fired && preloaded){
        init();
        fired=true;
    }
});
window.addEventListener("keydown",e=>{
    key=e.code;
    if(e.code=="KeyW" || e.code=="ArrowUp"){
        mkeys.up=true;
    }
    if(e.code=="KeyA" || e.code=="ArrowLeft"){
        mkeys.left=true;
        if(deciding){
                select=math.mod(select-1,3);
            while(!entity[entity.findIndex(a=>a.info.disId==select)].info.available){
                select=math.mod(select+1,3);
            }
            updatedecdisplay();
        }
    }
    if(e.code=="KeyS" || e.code=="ArrowDown"){
        mkeys.down=true;
    }
    if(e.code=="KeyD" || e.code=="ArrowRight"){
        mkeys.right=true;
        if(deciding){
                select=math.mod(select+1,3);
            while(!entity[entity.findIndex(a=>a.info.disId==select)].info.available){
                select=math.mod(select-1,3);
            }
            updatedecdisplay();
        }
    }
    if(e.code=="KeyT"){
        game.tidalpower.range=2;
        if(transformed){
            copy2clipboard();
        }
    }
    if(e.code=="KeyI"){
        game.redcoral+=10;
        upgradedecision();
    }
    if(e.code=="KeyZ" || e.code=="Enter" || e.code=="Space"){
        if(!zclicked && modelLoaded){
        submit();
        mkeys.submit=true;
        }
        zclicked=true;
    }
    if(e.code=="KeyQ"){
        pose=!pose;
        entityna("pose",a=>{
        a.info.hide=!a.info.hide;
    });
        if(pose){
            play("てれれんアッパー",1);
        }else{
            play("てれれんダウナー",1);
        }
    }
});
window.addEventListener("keyup",e=>{
    if(e.code=="KeyW" || e.code=="ArrowUp"){
        mkeys.up=false;
    }
    if(e.code=="KeyA" || e.code=="ArrowLeft"){
        mkeys.left=false;
    }
    if(e.code=="KeyS" || e.code=="ArrowDown"){
        mkeys.down=false;
    }
    if(e.code=="KeyD" || e.code=="ArrowRight"){
        mkeys.right=false;
    }
    if(e.code=="KeyZ" || e.code=="Enter" || e.code=="Space"){
        mkeys.submit=false;
        zclicked=false;
    }
    key="";
});
function submit(){
    if(isTitle){
        gamestart();
        gametime=Date.now();
    }
    if(deciding){
        if(upgrading){
            selectUpgrade();
        }else{
        selectItem();
        }
    }
}
async function titleScreen(){
    initialized=true;
    welcome();
    const desc=document.getElementById("description");
    desc.innerHTML="";
    await parsemodels();
    for(const e of entity){
        deleteEntity(e.seed);
    }
    modelLoaded=true;
    add([0,0],"egg",{name:"egg"});
    add([-0.66,-0.5],"D",{});
    add([-0.5,-0.5],"i",{});
    add([-0.35,-0.5],"n",{});
    add([-0.15,-0.5],"o",{});
    add([0.05,-0.5],"p",{});
    add([0.25,-0.5],"o",{});
    add([0.45,-0.5],"l",{});
    add([0.53,-0.5],"e",{});
    add([0.73,-0.5],"r",{});
    setBGM("BGM3",0.4,true);
}
function titleAction(){
    entityn("egg",a=>{
a.mov=[0,Math.cos(Date.now()/1000)/50];
    });
}
function gamestart(){
    isTitle=false;
    entityn("egg",a=>{
        deleteEntity(a.seed);
    });
    printL("pose",[0,0],false,["ポ","ー","ズ"]);
    entityna("pose",a=>{
        a.info.hide=true;
    });
    add([0,0],"otama0",{name:"otama",attribute:"player",hide:false});
    add([-0.06,-0.2],"cube",{name:"combo1",dynamic:false,attribute:"util",hide:true},0.3);
    add([0,-0.2],"cube",{name:"combo2",dynamic:false,attribute:"util",hide:true},0.3);
    add([0.06,-0.2],"cube",{name:"combo3",dynamic:false,attribute:"util",hide:true},0.3);
    add([0.95/aspect,0.9],"cube2",{name:"tidalpower5",dynamic:false,attribute:"util",hide:false,gray:false},0.6);
    add([0.95/aspect-0.1,0.9],"cube2",{name:"tidalpower4",dynamic:false,attribute:"util",hide:false,gray:false},0.6);
    add([0.95/aspect-0.2,0.9],"cube2",{name:"tidalpower3",dynamic:false,attribute:"util",hide:false,gray:false},0.6);
    add([0.95/aspect-0.3,0.9],"cube2",{name:"tidalpower2",dynamic:false,attribute:"util",hide:false,gray:false},0.6);
    add([0.95/aspect-0.4,0.9],"cube2",{name:"tidalpower1",dynamic:false,attribute:"util",hide:false,gray:false},0.6);
    add([0.95/aspect-0.52,0.9],"tidalpower",{name:"tidalpower",dynamic:false,attribute:"util",hide:false,gray:false},0.3);

    for(let k=0; k<game.maxhp; ++k){
    add([0.95/aspect-0.11*k,-0.8],"heart",{name:"life"+(k+1),dynamic:false,attribute:"util",hide:false},0.6);
    }
    play("スタート",1);
    setBGM("BGM1",0.1,true);
}
//アニメーションフレーム
async function animation(){
    BGMtest();
    const delta=(Date.now()-startTime)-lastRenderTime;
  if(1000/fps<=delta){
    lastRenderTime=Date.now()-startTime;
    if(!initialized){
        titleScreen();
    }
aspect=window.innerHeight/window.innerWidth;
    if(!isTitle){
        if(!pose){
            if(!end){
        spawnAction();
            }
            var otam;
        for(const e of entity){
            if(playerSeed==e.seed){
                otam=e;
            }
            if(distext.indexOf(e.info.name)!=-1){
                deleteEntity(e.seed);
            }
            if(!deciding){
            if(e.info.attribute=="enemy"){
                enemyAction(e);
            }
            if(e.info.attribute=="particle"){
                particleAction(e);
            }
            if(e.info.attribute=="point"){
                pointAction(e);
            }
            if(e.info.attribute=="item"){
                itemAction(e);
            }
        }
            if(e.info.attribute=="util"){
                utilAction(e);
            }
        }
        utility();
            if(!end && !deciding){
            playerAction(otam);
            }
    }
    }else{
        titleAction();
    }
    generateInstance();
}
}
//描画毎プレイヤー設定
function playerAction(e){
    if(game.immune.value){
        if(game.immune.times==game.immune.ite){
            game.immune.value=false;
            e.info.hide=false;
        }else{
        if(game.immune.timer==0){
            game.immune.times++;
            e.info.hide=!e.info.hide;
            game.immune.timer=game.immune.interval;
        }else{
            game.immune.timer--;
        }
        }
    }
    var move=false;
    var tidaldush=false;
    var s=0.01;
    game.otamamove.interval=5;
    if(mkeys.submit && game.tidalpower.value>0 && game.hidan.anime<5){
        game.otamamove.interval=3;
        timerevent(game.tidalpower.consumption,t=>{
            game.tidalpower.value--;
            particle(vec.prod(camera,-1),1,0.1);
        });
        if(game.tidalpower.value==0){
            mkeys.submit=false;
        }
        tidaldush=true;
        s=s*game.tidalpower.speedmultiplication;
        move=true;
    }else if(game.tidalpower.value<game.tidalpower.max){
        timerevent(game.tidalpower.regene,t=>{
        game.tidalpower.value++;
        });
    }
    if(game.hidan.anime<5){
    if(!tidaldush || has("fishgem")){
    if(mkeys.right || mkeys.left || mkeys.up || mkeys.down){
        move=true;
        p.real=0;
        p.imag=0;
    }
    if(mkeys.right){
        p.real++;
    }
    if(mkeys.left){
        p.real--;
    }
    if(mkeys.up){
        p.imag++;
    }
    if(mkeys.down){
        p.imag--;
    }
}
    var pag=math.mod(p.arg,2*Math.PI);
    angle=math.mod(angle,2*Math.PI);
    var anp=Math.abs(pag-angle+2*Math.PI)<Math.abs(pag-angle-2*Math.PI) || Math.abs(pag-angle)<Math.abs(pag-angle-2*Math.PI);
    var anv=Math.min(Math.abs(pag-angle),Math.abs(pag-angle-2*Math.PI),Math.abs(pag-angle+2*Math.PI));
    var hugou;
    if(Math.abs(pag-angle)<Math.abs(pag-angle+2*Math.PI)){
    hugou=Math.sign(pag-angle);
    }else{
    hugou=-Math.sign(pag-angle);
    }
    var rotspd=0.1;
    if(anv>rotspd && move){
    if(anp){
        angle+=hugou*rotspd;
    }else{
        angle-=hugou*rotspd;
    }
    }else if(anv>0.05){
        if(anp){
        angle+=hugou*0.05;
    }else{
        angle-=hugou*0.05;
    }
    }
    const a=math.mod(180*angle/Math.PI,360);
    const al=math.mod(a,180);
    if((inrange(35,al,55) || inrange(125,al,145)) && game.otamamove.mode!=45){
        game.otamamove.value=["otama45","otama45_2","otama45","otama45_3"];
        game.otamamove.mode=45;
        modelchange(playerSeed,"otama45");
        e=entity[entity.length-1];
    }
    if((inrange(15,al,35) || inrange(145,al,155)) && game.otamamove.mode!=30){
        game.otamamove.mode=30;
        game.otamamove.value=[];
        modelchange(playerSeed,"otama30");
        e=entity[entity.length-1];
    }
    if((inrange(55,al,65) || inrange(115,al,125)) && game.otamamove.mode!=60){
        game.otamamove.mode=60;
        game.otamamove.value=[];
        modelchange(playerSeed,"otama60");
        e=entity[entity.length-1];
    }
    if((inrange(0,al,15) || inrange(155,al,180)) && game.otamamove.mode!=0){
        game.otamamove.mode=0;
        if(has("advanced swimming")){
            game.otamamove.value=["otama0","otama0_1","otama0_2","otama0_5","otama0","otama0_4","otama0_3","otama0_6"]
        }
        game.otamamove.value=["otama0","otama0_2","otama0","otama0_3"];
        modelchange(playerSeed,"otama0");
        e=entity[entity.length-1];
    }
    if(inrange(65,al,115) && game.otamamove.mode!=90){
        game.otamamove.mode=90;
        game.otamamove.value=["otama90","otama90_2","otama90","otama90_3"];
        modelchange(playerSeed,"otama90");//modelchangeはプレイヤーのときだけトラブルを起こす。
        e=entity[entity.length-1];
    }
    if(move){
        if(game.otamamove.value.length>1){
        timerevent(game.otamamove,a=>{
            a.anime++;
            modelchange(playerSeed,a.value[math.mod(a.anime,a.value.length)]);
            e=entity[entity.length-1];
        });
    }
    }
    if(inrange(90,a,270)){
            e.direction[0]=-1;
    }else{
            e.direction[0]=1;
    }
    if(inrange(180,a,360)){
            e.direction[1]=-1;
    }else{
            e.direction[1]=1;
    }
    if(move){
        if(anv>0.1){
        rotvelo+=hugou*0.005;
        }else{
            if(Math.abs(rotvelo)>0){
        rotvelo-=Math.sign(rotvelo)*0.001;
         if(Math.abs(rotvelo)<0.1){
            rotvelo=0;
         }
        }
        }
        if(Math.abs(rotvelo)>maxrotvelo){
            rotvelo=Math.sign(rotvelo)*maxrotvelo;
        }
        if(velocity<maxvelocity){
            velocity+=0.0003;
            if(velocity>maxvelocity){
                velocity=maxvelocity;
            }
        }else{
            velocity=maxvelocity;
        }
        s+=velocity;
        if(tidaldush){
            velocity=maxvelocity+0.01;
            camera=vec.sum(camera,[-s*Math.cos(angle),s*Math.sin(angle)]);
        }else{
    camera=vec.sum(camera,[-s*Math.cos(pag),s*Math.sin(pag)]);
        }
    }else{
        camera=vec.sum(camera,[-velocity*Math.cos(angle),velocity*Math.sin(angle)]);
        if(velocity>0){
        velocity-=0.0005;
         if(velocity<0){
            velocity=0;
         }
        }
        if(anp){
        angle+=rotvelo;
    }else{
        angle-=rotvelo;
    }
        if(Math.abs(rotvelo)>0){
        rotvelo-=Math.sign(rotvelo)*0.003;
         if(Math.abs(rotvelo)<0.1){
            rotvelo=0;
         }
        }
    }
}else{
        //被弾直後
    modelchange(playerSeed,"otama_damaged");
        e=entity[entity.length-1];
    camera=vec.sum(camera,vecexp(game.hidan.speed,game.hidan.angle));
    game.hidan.speed*=0.95;
    velocity=0;
    rotvelo=0;
}
    if(game.hidan.trigger){
        timerevent(game.hidan,t=>{
            e.info.hide=!e.info.hide;
            t.anime--;
            if(t.anime==0){
            t.trigger=false;
            }
        });
    }
        e.mov=vec.prod(camera,-1).slice();
}

function inrange(m,v,M){
    return m<=v && v<M;
}
function modelchange(seed,name,backward){
    let id=entity.findIndex(e=>e.seed==seed);
    if(id!=-1){
    add(entity[id].mov,name,entity[id].info,entity[id].scale,backward,entity[id].direction);
    deleteEntityi(id);
    }
}
function timerevent(p,callback){
    if(p.timer>=p.interval){
        p.timer=0;
        callback(p);
    }
    p.timer++;
}
//enemy配列が必要。
function spawnAction(){
    //スポーン
    var loop=0;
    if(game.enemy<game.maxEnemy){
        var pos=vec.dec([math.rand(-game.radius,game.radius),math.rand(-game.radius,game.radius)],camera);
    while(entity.findIndex(e=>e.info.attribute=="enemy" && vec.length(vec.dec(e.mov,pos))<=game.undesire)!=-1 || vec.length(vec.sum(camera,pos))<=game.minradius){
        loop++;
        pos=vec.dec([math.rand(-game.radius,game.radius),math.rand(-game.radius,game.radius)],camera);
        if(loop>100){
            break;
        }
    }
        spawnEnemy(pos);
    }
    //アイテム
    //スポーン
    if(game.item<=5){
            ruledSpawn(cmath.polar(1,Math.random()*Math.PI*2),Math.ceil((game.maxItem-game.item)));
    }
}
//諸悪の根源(もっともラグい)
function deleteEntity(seed){
    const id=entity.findIndex(e=>e.seed==seed);
    if(id!=-1){
        entity=deleteIndex(entity,id).slice();
    }
}
function deleteEntityi(id){
    if(id!=-1){
        entity=deleteIndex(entity,id).slice();
    }
}
function playercirclecollision(seed,range,type){
    //別の方法に変える。
    if(type=="point"){
    for(const e of entity){
    if(e.seed==seed){
    if(vec.length(vec.sum(camera,e.mov))<range){
        return true;
    }
}
        }
        return false;
        }
    //ピクセル単位の衝突判定
    return neighbor.indexOf(seed)!=-1;
}
//敵の沸き、複素数のらせんから
function ruledSpawn(init,N){
    var z=init;
    let pos;
    let f=new complex(0,0);
    const items=["pinkshell","redcoral","conch"];
    const seed=math.randInt(0,2);
    for(k=0; k<N; ++k){
    f=z;//cmath.sum(f,cmath.polar(2,Math.random()*Math.PI));
    pos=vec.dec([f.real,f.imag],camera);
    if(f.abs<game.radius && f.abs>game.minradius){
    add(pos,items[seed],{name:`${items[seed]}_item`,attribute:"item"},0.6);
    game.item++;
    }
    z=cmath.pow(init,z);
    }
}
function enemyAction(e){
    if(vec.length(vec.dec(e.mov,vec.prod(camera,-1)))>game.radius){
        deleteEntity(e.seed);
        game.enemy--;
        if(e.info.name=="tatecircle_enemy"){
            deleteEntity(entity[entity.findIndex(a=>a.info.mother==e.info.tate)].seed);
        }
        if(e.info.name=="tate"){
            const id=entity.findIndex(a=>a.info.tate==e.info.mother);
            if(id!=-1){
            deleteEntity(entity[id].seed);
            }else{
                game.enemy++;
            }
        }
    }
    if(e.info.boomed){
        if(e.info.bombable){
timerevent(e.info.boom,a=>{
            a.count++;
            if(a.count>=a.value.length){
            deleteEntity(e.seed);
            }else{
                modelchange(e.seed,a.value[a.count]);
            }
        });
    }else{
        deleteEntity(e.seed);
    }
    }else{
    if(playercirclecollision(e.seed,game.tidalpower.range+e.info.extrarange)){
        if(mkeys.submit && game.tidalpower.value>0 && e.info.name!="tate" && (e.info.name!="hugu_enemy" || !e.info.danger)){
            var sndtype="";
            var sndv=1;
            if(e.info.name=="jelly_enemy"){
                sndtype="ベル";
                sndv=0.9;
            }
            if(e.info.name=="tatecircle_enemy"){
                sndtype="ベース";
                sndv=0.8;
            }
        play(game.combo.sound[clamp(Math.floor(game.combo.chain/3),0,game.combo.sound.length-1)]+sndtype,sndv);
        const gain=e.info.score*Math.pow(game.combo.scoreMultiplication,game.combo.chain);
        print("scoregain",e.mov,true,numbers(gain));
        if(e.info.score==1000){
            decision();
        }
        game.score+=gain;
        game.combo.chain++;
        if(e.info.name=="tatecircle_enemy"){
            deleteEntity(entity[entity.findIndex(a=>a.info.mother==e.info.tate)].seed);
        }
        entityna("combo",a=>{
            deleteEntity(a.seed); 
        });
        print("combo",[-0.1,-0.2],false,numbers(game.combo.chain));
        entityn("combo1",a=>{
                a.info.hide=false;
        });
        entityn("combo2",a=>{
                a.info.hide=false;
        });
        entityn("combo3",a=>{
                a.info.hide=false;
        });
        game.combo.timer=0;
        game.enemy--;
        play("boom",0.2);
        e.info.boomed=true;
        point(e.mov,clamp(game.combo.chain,1,4),0.1);
        }
    }
    if(playercirclecollision(e.seed,0.1+e.info.extrarange) && !e.info.boomed){
        if(e.info.name!="tate" || !has("gun")){
        if(!game.hidan.trigger && !game.immune.value){
        game.hidan.trigger=true;
        game.hidan.timer=0;
        game.hidan.anime=10;
        game.hidan.speed=velocity+0.01;
        game.hidan.angle=Math.atan2(camera[1]+e.mov[1],camera[0]+e.mov[0]);
        game.hp--;
        play("hidan",0.3);
        if(game.hp==0){
            ending();
        }
        }
    }
    }
    //移動
    if(e.info.movement.method=="randomwalk"){
    timerevent(e.info.movement,a=>{
        var r=math.rand(-Math.PI,Math.PI);
        if(Math.random()>0.9){
            a.direction=[0,0];
        }else{
        a.direction=[Math.cos(r),Math.sin(r)];
        }
    });
}
if(e.info.movement.method=="jet"){
    timerevent(e.info.movement,a=>{
        a.direction=vecexp(1,math.randInt(0,3)*90);
        a.speed=0.04;
    });
    e.info.movement.speed*=0.94;
    e.mov=vec.sum(e.mov,vec.prod(e.info.movement.direction,e.info.movement.speed));
}else{
    e.mov=vec.sum(e.mov,vec.prod(e.info.movement.direction,0.005));
}
    if(e.info.rotable){
    timerevent(e.info.rotor,a=>{
        modelchange(e.seed,a.value[math.mod(a.count,a.value.length)]);
        a.count++;
        if(e.info.name=="jelly_enemy"){
            if(math.mod(a.count,a.value.length)==1){
                e.info.extrarange=0;
            }
            if(math.mod(a.count,a.value.length)==2){
                e.info.extrarange=0.05;
            }
            if(math.mod(a.count,a.value.length)==3){
                e.info.extrarange=0.1;
            }
            if(math.mod(a.count,a.value.length)==0){
                e.info.extrarange=-0.025;
            }
        }
        if(e.info.name=="hugu_enemy"){
            if(math.mod(a.count,a.value.length)==0){
                e.info.extrarange=0.05;
                e.info.danger=true;
            }
            if(math.mod(a.count,a.value.length)==1){
                e.info.extrarange=0;
                e.info.danger=false;
            }
            if(math.mod(a.count,a.value.length)==2){
                e.info.extrarange=0;
            }
            if(math.mod(a.count,a.value.length)==3){
                e.info.extrarange=0;
            }
        }
    });
}
}
}
function utility(){
        if(!end){
    print("scoredis",[0.9/aspect,-0.9],false,union(["ス","コ","ア"],numbers(game.scoreDisplay)));
    print("stats",[0.9/aspect-0.4,-0.9],false,union(["レ","ベ","ル"],numbers(game.phase)));
    print("pinkshelldis",[-1.3,0.9],false,union(["pinkshell"],numbers(game.pinkshell)));
    print("conchdis",[-1,0.9],false,union(["conch"],numbers(game.conch)));
    print("redcoraldis",[-0.7,0.9],false,union(["redcoral"],numbers(game.redcoral)));
        }else{
            printL("scoredis",[0,-0.33],false,union(["ス","コ","ア"],numbers(game.score)));
        }
    if(game.score>game.scoreDisplay){
        game.scoreDisplay+=(game.score-game.scoreDisplay)/10;
    }else{
        game.scoreDisplay=game.score;
    }
    if(game.combo.chain>0){
        if(game.combo.timer>game.combo.interval*2/3){
            entityn("combo2",a=>{
                modelchange(a.seed,"cube_gray");
            });
        }else{
            entityn("combo2",a=>{
                modelchange(a.seed,"cube");
            });
        }
        if(game.combo.timer>game.combo.interval/3){
            entityn("combo3",a=>{
                modelchange(a.seed,"cube_gray");
            });
        }else{
            entityn("combo3",a=>{
                modelchange(a.seed,"cube");
            });
        }
        timerevent(game.combo,e=>{
            entityna("combo",a=>{
            deleteEntity(a.seed); 
        });
            e.chain=0;
            entityn("combo1",a=>{
                a.info.hide=true;
            });
            entityn("combo2",a=>{
                a.info.hide=true;
            });
            entityn("combo3",a=>{
                a.info.hide=true;
            });
        });
    }
    if(end){
            entityn("otamaend",a=>{
                if(!transformed){
                    a.mov[1]+=0.003;
                a.rot+=0.2;
                a.rot*=1.05;
                light[0]*=0.978;
                light[1]*=0.978;
                light[2]*=0.989;
                particle(vec.dec(a.mov,camera),1,a.rot/1000+0.1);
                    //sg+=0.01;
                if(a.rot>12*360){
                    print("clip",[-0.5/aspect,0.9],false,["T","キ","ー","semic","ク","リ","ッ","プ","ボ","ー","ド","に","ほ","ぞ","ん"])
                    transformed=true;
                    //add([0,0.33],"あかるい",{attribute:"util",dynamic:false});
                    shinyparticle(vec.dec(a.mov,camera),6,0);
                    modelchange(a.seed,"hoya");
                }
                }else{
                    timerevent(a.info.animation,e=>{
                        e.anime++;
                        modelchange(a.seed,e.value[math.mod(e.anime,e.value.length)]);
                    });
                }
            });
        }
}
function mother(mid){
    return entity.findIndex(e=>e.seed==mid);
}
const particles=["あお粒子","みどり粒子"];
const points=["きぴかぴか","ぴかぴか","むらさき銀河"];
function point(pos,amount,radius){
    var theta;
    for(let k=0; k<amount; ++k){
        theta=Math.random()*2*Math.PI;
    add(vec.sum(pos,vecexp(radius,theta)),points[math.randInt(0,points.length-1)],{
        attribute:"point",
        direction:vecexp(1,theta),
        shine:false,
        speed:0.03,
        eraze:{
            interval:70,
            timer:0
        },
        scored:false
    },0.7);
}
}
function particle(pos,amount,radius){
    var theta;
    for(let k=0; k<amount; ++k){
        theta=Math.random()*2*Math.PI;
    add(vec.sum(pos,vecexp(radius,theta)),particles[math.randInt(0,particles.length-1)],{
        attribute:"particle",
        direction:vecexp(1,theta),
        shine:false,
        speed:0.03,
        eraze:{
            interval:70,
            timer:0
        }
    },0.5);
}
}
function shinyparticle(pos,amount,radius){
    const list=["きらめき","きらめき2"]
    var theta;
    for(let k=0; k<amount; ++k){
        theta=Math.random()*2*Math.PI;
    add(vec.sum(pos,vecexp(radius,theta)),list[math.randInt(0,list.length-1)],{
        attribute:"particle",
        direction:vecexp(1,theta),
        shine:false,
        speed:0.03,
        eraze:{
            interval:70,
            timer:math.rand(0,35)
        }
    },1);
    entity[entity.length-1].rot=math.rand(0,360);
}
}
function vecexp(r,theta){
    return [r*Math.cos(theta),r*Math.sin(theta)];
}
function pointAction(e){
    if(e.info.scored){
        const t=Math.atan2(-e.mov[1]-camera[1],-e.mov[0]-camera[0]);
        e.mov=vec.sum(e.mov,vecexp(e.info.speed,t));
    e.info.speed*=1.01;
    if(playercirclecollision(e.seed,0.1,"point")){
        deleteEntity(e.seed);
        game.progression++;
        if(game.progression>=game.needed){
            game.progression=0;
            game.needed+=4;
            game.phase++;
            game.maxEnemy+=4;
            play("チャイム2",0.2);
            nextLevel();
        }
    }
    }else{
        timerevent(e.info.eraze,a=>{
            e.info.scored=true;
            e.info.speed=0.04;
    });
    e.mov=vec.sum(e.mov,vec.prod(e.info.direction,e.info.speed));
    e.info.speed*=0.95;
    }
}
function particleAction(e){
        timerevent(e.info.eraze,a=>{
            deleteEntity(e.seed);
    });
    e.mov=vec.sum(e.mov,vec.prod(e.info.direction,e.info.speed));
    e.info.speed*=0.95;
}
function itemAction(e){
        if(vec.length(vec.sum(e.mov,camera))>game.radius){
        deleteEntity(e.seed);
        game.item--;
        }
    if(playercirclecollision(e.seed,0.2)){
        if(e.info.name=="pinkshell_item"){
            game.pinkshell++;
        }
        if(e.info.name=="conch_item"){
            game.conch++;
        }
        if(e.info.name=="redcoral_item"){
            game.redcoral++;
        }
        print("scoregain",e.mov,true,numbers(100));
        game.score+=100;
        game.item--;
        deleteEntity(e.seed);
    }
}
function utilAction(e){
    for(let k=0; k<game.maxhp; ++k){
    if(e.info.name=="life"+(k+1)){
        if(game.hp<k+1){
            e.info.hide=true;
        }else{
            e.info.hide=false;
        }
    }
}
    if(e.name=="tidalpower" && has("jellygem")){
        modelchange(e.seed,"crystalTidalpower");
    }
    if(e.name=="cube2" && has("midnight")){
        modelchange(e.seed,"crystalCube");
    }
    for(let k=1; k<6; ++k){
        if(game.tidalpower.value>k*game.tidalpower.max/6 && e.info.name==`tidalpower${k}` && e.info.gray){
                modelchange(e.seed,"cube2");
                e.info.gray=false;
        }else if(game.tidalpower.value<=k*game.tidalpower.max/6 && e.info.name==`tidalpower${k}` && !e.info.gray){
                modelchange(e.seed,"cube_gray2");
                e.info.gray=true;
        }
    }
    if(e.info.name=="scoregain"){
        e.mov[1]-=0.001;
        e.scale*=0.99;
        if(e.scale<0.1){
            deleteEntity(e.seed);
        }
    }
    if(e.info.name=="nextLevel"){
        if(!e.info.interval){
            e.info.interval=0;
        }
        const mi=40;
        e.mov=vec.prod(e.mov,0.98);
        e.scale*=0.98;
        if(e.info.interval<mi){
            if(e.info.interval<mi/2){
                light[0]*=1/0.999;
                light[1]*=1/0.999;
                light[2]*=1/0.998;
            }else{
                light[0]*=0.999;
                light[1]*=0.999;
                light[2]*=0.998;
            }
        }
        e.info.interval++;
        if(e.scale<0.1){
            deleteEntity(e.seed);
        }
    }
}
//まあまあ重いのでなるべく使わない
function entityn(name,callback){
    const id=entity.findIndex(e=>e.info.name==name);
    if(id!=-1){
        callback(entity[id]);
    }
}
//非常に重いので使わない
function entityna(name,callback){
    //console.error("entitynaは非常に重くなる");
    for(const e of entity){
    if(e.info.name==name){
        callback(e);
    }
}
}
//intgerである必要がある。
function numbers(n){
    n=Math.round(n);
    var u=n;
    var p=0;
    var k=0;
    var past=0;
    var a=[];
    while(u>=10){
        u=u/10;
        p++;
    }
    while(p>=0){
        k++;
    a.push(Math.floor(n/(10**p))-past);
    past=Math.floor(n/(10**p))*10;
    p--;
    }
    return a;
}
function print(name,posture,dynamic,a){
    for(let k=0; k<a.length; ++k){
        add(vec.sum(posture,[0.055*(k-a.length/2),0]),a[k],{name:name,dynamic:dynamic,attribute:"util",hide:false},0.4);
    }
}
function prints(name,posture,dynamic,a){
    for(let k=0; k<a.length; ++k){
        add(vec.sum(posture,[size*(k-a.length/2),0]),a[k],{name:name,dynamic:dynamic,attribute:"util",hide:false},1);
    }
}
function printL(name,posture,dynamic,a){
    for(let k=0; k<a.length; ++k){
        add(vec.sum(posture,[0.15*(k-a.length/2),0]),a[k],{name:name,dynamic:dynamic,attribute:"util",hide:false},1);
    }
}
function nextLevel(){
    if(math.mod(game.phase,3)==0){
        upgradedecision();
    }else{
        if(game.hp<game.maxhp){
            game.hp++;
        }
    }
    var nes=-1;
    var dist=0.24;
    //test
    add([nes,0],"Nb",{name:"nextLevel",attribute:"util",dynamic:false});
    add([nes+dist,0],"Eb",{name:"nextLevel",attribute:"util",dynamic:false});
    add([nes+2*dist,0],"Xb",{name:"nextLevel",attribute:"util",dynamic:false});
    add([nes+3*dist,0],"Tb",{name:"nextLevel",attribute:"util",dynamic:false});
    add([nes+5*dist,0],"Lb",{name:"nextLevel",attribute:"util",dynamic:false});
    add([nes+6*dist,0],"Eb",{name:"nextLevel",attribute:"util",dynamic:false});
    add([nes+7*dist,0],"Vb",{name:"nextLevel",attribute:"util",dynamic:false});
    add([nes+8*dist,0],"Eb",{name:"nextLevel",attribute:"util",dynamic:false});
    add([nes+9*dist,0],"Lb",{name:"nextLevel",attribute:"util",dynamic:false});
}
function ending(){
    record();
    end=true;
    setBGM("BGM2",0.4,false);
    for(const e of entity){
        deleteEntity(e.seed);
    }
    add([0,0],"otama_damaged",{name:"otamaend",attribute:"util",dynamic:false,animation:{
        interval:45,
        timer:0,
        anime:0,
        value:["hoya","hoya2","hoya3"]
    }});
}
function union(b,a){
    const res=b.slice();
    const g=a.slice();
    for(const r of g){
        res.push(r);
    }
    return res;
}
function spawntate(pos){
    const s=Math.random();
    const v=math.randInt(0,3);
    const r=v*Math.PI/2;
    add(pos,"tatecircle",{
            name:"tatecircle_enemy",
            attribute:"enemy",
            hide:false,
            rotable:false,
            bombable:false,
            score:200,
            extrarange:0,
            tate:s,
            movement:{method:"linear",interval:100,timer:math.rand(0,100),direction:vecexp(1,r),work:false},
            rotor:{interval:20,timer:0,count:0,value:["circle","circle_rot1","circle","circle_rot2"]},
            boom:{interval:10,timer:0,count:0,value:["circle_boom1","circle_boom2","circle_boom3","circle_boom3"]},
            boomed:false
        });
        add(vec.sum(pos,vecexp(0.1,r)),"tate",{
            mother:s,
            name:"tate",
            attribute:"enemy",
            hide:false,
            rotable:false,
            bombable:false,
            score:0,
            extrarange:0,
            movement:{method:"linear",interval:100,timer:math.rand(0,100),direction:vecexp(1,r),work:false},
            boomed:false
        });
        entity[entity.length-1].rot=v*90;
}
function spawnEnemy(pos){
    var spawned=false;
    var seed;
    while(!spawned){
    seed=math.randInt(0,game.phase);
    if(seed==0){
    add(pos,"circle",{
            name:"circle_enemy",
            attribute:"enemy",
            hide:false,
            rotable:true,
            bombable:true,
            score:100,
            extrarange:0.02,
            movement:{method:"randomwalk",interval:100,timer:math.rand(0,100),direction:[0,0],work:false},
            rotor:{interval:20,timer:0,count:0,value:["circle","circle_rot1","circle","circle_rot2"]},
            boom:{interval:10,timer:0,count:0,value:["circle_boom1","circle_boom2","circle_boom3","circle_boom3"]},
            boomed:false
        });
        spawned=true;
    }
    if(seed>1 && Math.random()<0.01*game.goldenRate){
        add(pos,"golden1",{
            name:"golden_enemy",
            attribute:"enemy",
            hide:false,
            rotable:true,
            bombable:false,
            score:1000,
            extrarange:0,
            movement:{method:"stop",speed:0.1,interval:160,timer:0,direction:[0,0],work:false},
            rotor:{interval:10,timer:0,count:0,value:["golden1","golden2","golden3","golden4"]},
            boom:{interval:20,timer:0,count:0,value:["circle_boom1","circle_boom2","circle_boom3","circle_boom3"]},
            boomed:false
        });
        spawned=true;
    }else{
    if(seed==2){
        if(Math.random()>0.2){
        spawntate(pos);
        spawned=true;
        }
    }
    if(seed==4){
        add(pos,"jelly1",{
            name:"jelly_enemy",
            attribute:"enemy",
            hide:false,
            rotable:true,
            bombable:true,
            score:125,
            extrarange:0,
            movement:{method:"jet",speed:0.08,interval:160,timer:0,direction:vecexp(1,math.randInt(0,3)*90),work:false},
            rotor:{interval:40,timer:0,count:0,value:["jelly1","jelly2","jelly3","jelly4"]},
            boom:{interval:10,timer:0,count:0,value:["jelly_boom1","jelly_boom2","jelly_boom3","jelly_boom3"]},
            boomed:false
        });
        spawned=true;
    }
    if(seed==7){
        add(pos,"hugu",{
            name:"hugu_enemy",
            attribute:"enemy",
            hide:false,
            rotable:true,
            danger:false,
            bombable:true,
            score:150,
            extrarange:0,
            movement:{method:"stop",speed:0.1,interval:160,timer:0,direction:[0,0],work:false},
            rotor:{interval:120,timer:0,count:0,value:["hugu","hugu","hugu3","hugu2"]},
            boom:{interval:10,timer:0,count:0,value:["hugu_boom1","hugu_boom2","hugu_boom3","hugu_boom3"]},
            boomed:false
        });
        spawned=true;
    }
        //色回転した強めの敵を実装したい　見た目はそのうち作らなくてはならない。2025/10/17
        if(seed==10){
            add(pos,"circle",{
            name:"strong_circle_enemy",
            attribute:"enemy",
            hide:false,
            rotable:true,
            bombable:true,
            score:150,
            extrarange:0.02,
            movement:{method:"randomwalk",interval:50,timer:math.rand(0,100),direction:[0,0],work:false},
            rotor:{interval:20,timer:0,count:0,value:["circle","circle_rot1","circle","circle_rot2"]},
            boom:{interval:10,timer:0,count:0,value:["circle_boom1","circle_boom2","circle_boom3","circle_boom3"]},
            boomed:false
        });
        spawned=true;
        }
        if(seed==14){
        add(pos,"jelly1",{
            name:"strong_jelly_enemy",
            attribute:"enemy",
            hide:false,
            rotable:true,
            bombable:true,
            score:187.5,
            extrarange:0,
            movement:{method:"jet",speed:0.12,interval:160,timer:0,direction:vecexp(1,math.randInt(0,3)*90),work:false},
            rotor:{interval:40,timer:0,count:0,value:["jelly1","jelly2","jelly3","jelly4"]},
            boom:{interval:10,timer:0,count:0,value:["jelly_boom1","jelly_boom2","jelly_boom3","jelly_boom3"]},
            boomed:false
        });
        spawned=true;
    }
        if(seed==17){
        add(pos,"hugu",{
            name:"strong_hugu_enemy",
            attribute:"enemy",
            hide:false,
            rotable:true,
            danger:false,
            bombable:true,
            score:150,
            extrarange:0,
            movement:{method:"stop",speed:0.1,interval:70,timer:0,direction:[0,0],work:false},
            rotor:{interval:120,timer:0,count:0,value:["hugu","hugu","hugu3","hugu2"]},
            boom:{interval:10,timer:0,count:0,value:["hugu_boom1","hugu_boom2","hugu_boom3","hugu_boom3"]},
            boomed:false
        });
        spawned=true;
    }
}
}
game.enemy++;
}
function has(itemName){
    return game.items.indexOf(itemName)!=-1;
}
//612
function copy2clipboard(){
    const type = "text/plain";
    const blob = new Blob([`ダイノポーラー：時間${Math.round((Date.now()-gametime)/1000)}秒、レベル${game.phase}、スコア${game.score}`], { type });
    const data = [new ClipboardItem({ [type]: blob })];
  
    navigator.clipboard.write(data).then(
      () => {
        /* success */
      },
      () => {
        /* failure */
      },
    );
}
function decision(){
    play("てれれんアッパー",1);
    decdisplay=[0];
    select=0;
    deciding=true;
    add([-1,0],"cardSelected",{attribute:"util",dynamic:false,isholder:true,available:true,disId:0},2);
    bt="";
    ct="";
    if(game.pinkshell<10){
        bt="Cant"
    }
    if(game.conch<10){
        ct="Cant"
    }
    add([0,0],"card"+bt,{attribute:"util",dynamic:false,isholder:true,available:bt!="Cant",disId:1},2);
    add([1,0],"card"+ct,{attribute:"util",dynamic:false,isholder:true,available:ct!="Cant",disId:2},2);
    let seed=math.randInt(0,itemList.length-1);
    add([-1,-0.1],"heart",{name:"text",attribute:"util",dynamic:false},1);
    print("text",[-1,0.1],false,["1","heart"]);
    add([0,-0.1],itemList[seed],{name:"text",attribute:"util",dynamic:false},1);
    decdisplay.push(itemList[seed]);
    print("text",[0,0.1],false,["pinkshell","1","0"]);
    let seed2=-1;
    while(seed2==-1 || seed2==seed){
        seed2=math.randInt(0,itemList.length-1);
    }
    decdisplay.push(itemList[seed2]);
    add([1,-0.1],itemList[seed2],{name:"text",attribute:"util",dynamic:false},1);
    print("text",[1,0.1],false,["conch","1","0"]);
}
const upgradeList=["tidalpower","goldenSpawn","hp2","itemSpawn","enemySpawn"];
function upgradedecision(){
    play("チャイム",1);
    play("てれれんアッパー",1);
    upgrading=true;
    decdisplay=[0];
    select=0;
    deciding=true;
    add([-1,0],"cardSelected",{attribute:"util",dynamic:false,isholder:true,available:true,disId:0},2);
    bt="";
    ct="";
    if(game.redcoral<5){
        bt="Cant"
    }
    if(game.redcoral<5){
        ct="Cant"
    }
    add([0,0],"card"+bt,{attribute:"util",dynamic:false,isholder:true,available:bt!="Cant",disId:1},2);
    add([1,0],"card"+ct,{attribute:"util",dynamic:false,isholder:true,available:ct!="Cant",disId:2},2);
    let seed=math.randInt(0,upgradeList.length-1);
    add([-1,-0.1],"heart",{name:"text",attribute:"util",dynamic:false},1);
    print("text",[-1,0.1],false,["1","heart"]);
    if(upgradeList[seed]=="goldenSpawn"){
    add([0,-0.1],"golden1",{name:"text",attribute:"util",dynamic:false},1);
    }
    if(upgradeList[seed]=="enemySpawn"){
    add([0,-0.1],"circle",{name:"text",attribute:"util",dynamic:false},1);
    }
    if(upgradeList[seed]=="itemSpawn"){
    add([-0.05,-0.1],"pinkshell",{name:"text",attribute:"util",dynamic:false},1);
    add([0,-0.1],"conch",{name:"text",attribute:"util",dynamic:false},1);
    add([0.05,-0.1],"redcoral",{name:"text",attribute:"util",dynamic:false},1);
    }
    if(upgradeList[seed]=="hp2"){
    add([-0.05,-0.1],"heart",{name:"text",attribute:"util",dynamic:false},1);
    add([0.05,-0.1],"heart",{name:"text",attribute:"util",dynamic:false},1);
    }
    if(upgradeList[seed]=="tidalpower"){
    add([0,-0.1],"tidalpower",{name:"text",attribute:"util",dynamic:false},1);
    }
    decdisplay.push(upgradeList[seed]);
    print("text",[0,0.1],false,["redcoral","5"]);
    let seed2=-1;
    while(seed2==-1 || seed2==seed){
        seed2=math.randInt(0,upgradeList.length-1);
    }
    decdisplay.push(upgradeList[seed2]);
    if(upgradeList[seed2]=="goldenSpawn"){
    add([1,-0.1],"golden1",{name:"text",attribute:"util",dynamic:false},1);
    }
    if(upgradeList[seed2]=="enemySpawn"){
    add([1,-0.1],"circle",{name:"text",attribute:"util",dynamic:false},1);
    }
    if(upgradeList[seed2]=="itemSpawn"){
    add([0.95,-0.1],"pinkshell",{name:"text",attribute:"util",dynamic:false},1);
    add([1,-0.1],"conch",{name:"text",attribute:"util",dynamic:false},1);
    add([1.05,-0.1],"redcoral",{name:"text",attribute:"util",dynamic:false},1);
    }
    if(upgradeList[seed2]=="hp2"){
    add([0.95,-0.1],"heart",{name:"text",attribute:"util",dynamic:false},1);
    add([1.05,-0.1],"heart",{name:"text",attribute:"util",dynamic:false},1);
    }
    if(upgradeList[seed2]=="tidalpower"){
    add([1,-0.1],"tidalpower",{name:"text",attribute:"util",dynamic:false},1);
    }
    print("text",[1,0.1],false,["redcoral","5"]);
}
function updatedecdisplay(){
    for(const e of entity){
    if(e.info.attribute=="util"){
        if(e.info.name=="text"){
            modelchange(e.seed,e.name);
        }
        if(e.info.isholder){
        if(e.info.disId==select){
            modelchange(e.seed,"cardSelected");
        }else if(e.info.available){
            modelchange(e.seed,"card");
        }
    }
}
}
for(const e of entity){
    if(e.info.attribute=="util"){
        if(e.info.name=="text"){
            modelchange(e.seed,e.name);
        }
    }
}
}
function selectItem(){
    play("てれれれれれん",1);
    if(select==0){
        if(game.hp<game.maxhp){
            game.hp++;
        }
    }else{
        if(select==1){
            game.pinkshell-=10;
        }else{
            game.conch-=10;
        }
    game.items.push(decdisplay[select]);
    if(decdisplay[select]=="jellygem"){
        game.tidalpower.consumption.interval+=1;
    }
    if(decdisplay[select]=="gem"){
        game.tidalpower.regene.interval-=1;
    }
    if(decdisplay[select]=="midnight"){
        game.tidalpower.regene.interval-=1;
    }
    if(decdisplay[select]=="gun"){
        maxvelocity*=1.10;
    }
    add([game.items.length/10+0.1,0.9],decdisplay[select],{attribute:"util",dynamic:false},0.3);
    }
    for(const e of entity){
        if(e.info.name=="text"){
            deleteEntity(e.seed);
        }
        if(e.info.isholder){
            deleteEntity(e.seed);
        }
    }
    game.immune.value=true;
    game.immune.times=0;
    game.immune.timer=game.immune.interval;
    deciding=false;
}
function selectUpgrade(){
    play("てれれれれれん",1);
    if(select==0){
        if(game.hp<game.maxhp){
            game.hp++;
        }
    }else{
        if(select!=0){
            game.redcoral-=5;
        }
    game.items.push(decdisplay[select]);
    if(decdisplay[select]=="hp2"){
        for(let k=0; k<2; ++k){
        if(game.hp<game.maxhp){
            game.hp++
        }
    }
    }
    if(decdisplay[select]=="tidalpower"){
        game.tidalpower.max+=20;
    }
    if(decdisplay[select]=="goldenSpawn"){
        game.goldenRate*=1.15;
    }
    if(decdisplay[select]=="enemySpawn"){
        game.maxEnemy+=5;
    }
    if(decdisplay[select]=="itemSpawn"){
        game.maxItem+=2;
    }
    //add([game.items.length/10+0.1,0.9],decdisplay[select],{attribute:"util",dynamic:false},0.3);
    }
    for(const e of entity){
        if(e.info.name=="text"){
            deleteEntity(e.seed);
        }
        if(e.info.isholder){
            deleteEntity(e.seed);
        }
    }
    deciding=false;
    upgrading=false;
    game.immune.value=true;
    game.immune.times=0;
    game.immune.timer=game.immune.interval;
}
function reset(){
    game=new Game(game.generation+1);
}