const model=[];
async function loadModel(name,fix){
    const res=await fetch(`model/${name}.json`);
    if(!res.ok){
        console.error(`${name}のフェッチに失敗しました。`);
        return;
    }
    console.log(`${name}のフェッチに成功しました。`);
    const data=await res.json();
    const u=[];
    for(const d of data){
        if(!d.alpha){
        u.push({
            position:vec.dec([d.i,d.j],fix),
            color:math.hsl2rgb(180*Math.atan2(d.z.imag,d.z.real)/Math.PI,parseFloat(d.w)/100,Math.hypot(d.z.real,d.z.imag)/100)
        })
        }
    }
    model.push({
        data:u,
        name:name
    });
}
function clamp(v,min,max){
    if(v<min){
        return min;
    }
    if(v>max){
        return max;
    }
    return v;
}
function add(position,modelname,info,size,backward,direction){
    if(!size){
        size=1;
    }
    if(!direction){
        direction=[1,1];
    }
    const f=Math.random();
    if(info.name=="otama"){
        playerSeed=f;
        game.playerModel=modelname;
        game.playerDirection=direction;
    }
    if(backward){
    entity=union([{name:modelname,rot:0,direction:direction,seed:f,mov:position,info:info,scale:size}],entity);
    }else{
        entity.push({name:modelname,rot:0,seed:f,direction:direction,mov:position,info:info,scale:size});
    }
}
async function parsemodels(){
    add([-16*size*2.5,2.5*size/2],"suibotsu",{},2.5);
    entity[entity.length-1].direction[0]*=-1;
    add([16*size*2.5,2.5*size/2],"suibotsu",{},2.5);
    add([-47*size*2.5,2.5*size/2],"suibotsu",{},2.5);
    add([47*size*2.5,2.5*size/2],"suibotsu",{},2.5);
    entity[entity.length-1].direction[0]*=-1;
    for(const m of modelnames){
        if(!m.preload){
        sintyoku();
        await loadModel(m.name,m.pos);
        }
    }
}
async function preload(){
    for(const m of modelnames){
        if(m.preload){
        await loadModel(m.name,m.pos);
        }
    }
    preloaded=true;
}
const modelnames=[];
function addModel(name,pos,pre){
    modelnames.push({name:name,pos:pos,preload:pre});
}
function sintyoku(){
    for(const e of entity){
        if(e.info.name=="initutil"){
        deleteEntity(e.seed);
        }
    }
    printL("initutil",[0,0.2],false,union(numbers(Math.round(100*model.length/modelnames.length)),["percent"]));
    prints("initutil",[0,0],false,union(union(["sentan"],longhire(Math.round(100*model.length/modelnames.length))),["atama"]));
}
//面白い
function tobinary(text){
    return parseInt(math.sum(0,text.length-1,k=>(text).charCodeAt(k)).toString(2));
}
function longhire(amount){
    const res=[];
    for(let k=0; k<amount; ++k){
        res.push("hire");
    }
    return res;
}
addModel("sentan",[3,8],true);
addModel("atama",[7,8],true);
addModel("suibotsu",[16,16],true);
addModel("hire",[4,8],true);
addModel("tatecircle",[8,8]);
addModel("tate",[13,8]);
addModel("redcoral",[8,8]);
addModel("pinkshell",[8,8]);
addModel("conch",[8,8]);
addModel("otama90",[8,8]);
addModel("otama90_2",[8,8]);
addModel("otama90_3",[8,8]);
addModel("otama45",[8,8]);
addModel("otama45_2",[8,8]);
addModel("otama45_3",[8,8]);
addModel("otama0",[8,8]);
addModel("otama0_1",[8,8]);
addModel("otama0_2",[8,8]);
addModel("otama0_3",[8,8]);
addModel("otama0_4",[8,8]);
addModel("otama0_5",[8,8]);
addModel("otama0_6",[8,8]);
addModel("otama30",[8,8]);
addModel("otama60",[8,8]);
addModel("otama_damaged",[8,8]);
addModel("circle",[8,8]);
addModel("circle_rot1",[8,8]);
addModel("circle_rot2",[8,8]);
addModel("circle_boom1",[8,8]);
addModel("circle_boom2",[8,8]);
addModel("circle_boom3",[8,8]);
addModel("あお粒子",[8,8]);
addModel("きぴかぴか",[8,8]);
addModel("ぴかぴか",[8,8]);
addModel("みどり粒子",[8,8]);
addModel("むらさき銀河",[8,8]);
addModel("D",[8,8]);
addModel("i",[8,8]);
addModel("n",[8,8]);
addModel("o",[8,8]);
addModel("p",[8,8]);
addModel("l",[8,8]);
addModel("e",[8,8]);
addModel("r",[8,8]);
addModel("0",[8,8],true);
addModel("1",[8,8],true);
addModel("2",[8,8],true);
addModel("3",[8,8],true);
addModel("4",[8,8],true);
addModel("5",[8,8],true);
addModel("6",[8,8],true);
addModel("7",[8,8],true);
addModel("8",[8,8],true);
addModel("9",[8,8],true);
addModel("percent",[8,8],true);
addModel("cube",[8,8]);
addModel("cubepink",[8,8]);
addModel("cube_gray",[8,8]);
addModel("cube2",[8,8]);
addModel("cube_gray2",[8,8]);
addModel("egg",[8,8]);
addModel("Nb",[8,8]);
addModel("Eb",[8,8]);
addModel("Xb",[8,8]);
addModel("Tb",[8,8]);
addModel("Lb",[8,8]);
addModel("Vb",[8,8]);
addModel("heart",[8,8]);
addModel("ス",[8,8]);
addModel("コ",[8,8]);
addModel("ア",[8,8]);
addModel("ク",[8,8]);
addModel("リ",[8,8]);
addModel("ッ",[8,8]);
addModel("プ",[8,8]);
addModel("ボ",[8,8]);
addModel("ー",[8,8]);
addModel("ド",[8,8]);
addModel("に",[8,8]);
addModel("ほ",[8,8]);
addModel("ぞ",[8,8]);
addModel("ん",[8,8]);
addModel("T",[8,8]);
addModel("キ",[8,8]);
addModel("semic",[8,8]);
addModel("hoya",[8,8]);
addModel("hoya2",[8,8]);
addModel("hoya3",[8,8]);
addModel("泡",[8,8]);
addModel("きらめき",[8,8]);
addModel("きらめき2",[8,8]);
addModel("あかるい",[34,32]);
addModel("jelly1",[8,8]);
addModel("jelly2",[8,8]);
addModel("jelly3",[8,8]);
addModel("jelly4",[8,8]);
addModel("golden1",[8,8]);
addModel("golden2",[8,8]);
addModel("golden3",[8,8]);
addModel("golden4",[8,8]);
addModel("ポ",[8,8]);
addModel("ズ",[8,8]);
addModel("レ",[8,8]);
addModel("ベ",[8,8]);
addModel("ル",[8,8]);
addModel("card",[8,8]);
addModel("gun",[8,8]);
addModel("gem",[8,8]);
addModel("jellygem",[8,8]);
addModel("fishgem",[8,8]);
addModel("midnight",[8,8]);
addModel("lightsphere",[8,8]);
addModel("cardSelected",[8,8]);
addModel("cardCant",[8,8]);
addModel("hugu",[8,8]);
addModel("hugu2",[8,8]);
addModel("hugu3",[8,8]);
addModel("hugu_boom1",[8,8]);
addModel("hugu_boom2",[8,8]);
addModel("hugu_boom3",[8,8]);
addModel("jelly_boom1",[8,8]);
addModel("jelly_boom2",[8,8]);
addModel("jelly_boom3",[8,8]);
addModel("tidalpower",[8,8]);
addModel("crystalTidalpower",[8,8]);
addModel("crystalCube",[8,8]);
preload();