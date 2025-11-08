var udemae=[
    {name:"S.さいこうのおたまじゃくし",score:20000,text:"きみはおたまじゃくしのさいのうがある"},
    {name:"A.くじらレベル",score:10000,text:"おもしろかったかい？"},
    {name:"B.ほたるいかレベル",score:5000,text:"よかった。へいきんてんよりたかいよ"},
    {name:"C.にまいがいレベル",score:5000,text:"やったぞ！ぼんじんレベルだ"},
    {name:"D.くらげレベル",score:2000,text:"ナイストライだ"},
    {name:"E.かいようゴミレベル",score:0,text:"もうおたまじゃくしがかわいそうだ"}
]
var username="無もなき"+["ヤドカリ","ウナギ","ヒトデ","ハマチ","タカアシガニ","カサゴ","スポンジ"][math.randInt(0,6)];
let storage=window["localStorage"];
var population=storage.getItem("population");
var leaderboard;
if(population==null){
    relinquish();
}
getrecord();
var playdata={
    mean:-1,
    geomean:-1,
    median:-1,
    variance:-1,
    sd:-1,
    max:-1,
    min:-1
};
document.getElementById("populationCount").innerHTML=population;
function welcome(){
    storage.setItem("population",parseInt(population)+1);
}
function record(){
    leaderboard.push({name:username,score:game.score});
    quickSort(leaderboard,0,leaderboard.length-1);
    storage.setItem("leaderboard",JSON.stringify(leaderboard));
}
async function getrecord(){
    var ran=document.getElementById("rank");
    leaderboard=storage.getItem("leaderboard");
    if(leaderboard=="undefined" || leaderboard=="" || leaderboard==null || leaderboard==undefined){
        leaderboard="[]";
    }
    leaderboard=await JSON.parse(leaderboard);
    if(leaderboard==""){
        leaderboard=[];
    }
    for(let k=leaderboard.length-1; k>=0; --k){
        ran.innerHTML+=`${leaderboard.length-k}.${leaderboard[k].name}  ${Math.round(leaderboard[k].score)}点<br>`;
    }
    //playdata作成
    playdata.mean=math.sum(1,leaderboard.length,k=>leaderboard[k-1].score/leaderboard.length);
    document.querySelector("#mean").innerHTML=Math.floor(playdata.mean);
    playdata.median=leaderboard[Math.round((leaderboard.length-1)/2)].score;
    //0,1,2[3]->1
    //0,1,2,3,4[5]->2
    //0,1,2,3[4]->1,(2)
    playdata.geomean=Math.pow(math.prod(1,leaderboard.length,k=>leaderboard[k-1].score),1/leaderboard.length);
    playdata.variance=math.sum(1,leaderboard.length,k=>Math.pow(leaderboard[k-1].score-playdata.mean,2))/leaderboard.length;
    playdata.sd=Math.sqrt(playdata.variance);
    playdata.max=leaderboard[leaderboard.length-1].score;
    playdata.min=leaderboard[0].score;
    udemaegenerate();
}
function relinquish(){
    storage.setItem("population",0);
    population=0;
    storage.setItem("leaderboard",[]);
    leaderboard=[];
}
//順位付け
function quickSort(array,start,end){
    var pivot = array[Math.floor((start+end)/2)].score;
    var left=start;
    var right=end;
    while(true){
        while(array[left].score<pivot){
            left++;
        }
        while(pivot<array[right].score){
            right--;
        }
        if(right<=left){
            break;
        }
        var tmp =array[left];
        array[left]=array[right];
        array[right]=tmp;
        left++;
        right--;
    }
    if(start<left-1){
        quickSort(array,start,left-1);
    }
    if(right+1<end){
        quickSort(array,right+1,end);
    }
}
function udemaegenerate(){
    //S
    if(udemae[0].score<playdata.max){
    udemae[0].score=playdata.max;
    }
    //A 上位90%
    if(udemae[1].score<leaderboard[Math.round(leaderboard.length*0.9)-1].score){
    udemae[1].score=leaderboard[Math.round(leaderboard.length*0.9)-1].score;
    }
    //B
    if(playdata.median<playdata.mean){
        if(udemae[2].score<playdata.mean){
    udemae[2].score=playdata.mean;
        }
    }else{
        if(udemae[2].score<playdata.median){
    udemae[2].score=playdata.median;
        }
    }
    //C
    if(playdata.median>playdata.mean){
        if(udemae[3].score<playdata.mean){
    udemae[3].score=playdata.mean;
        }
    }else{
        if(udemae[3].score<playdata.median){
    udemae[3].score=playdata.median;
        }
    }
    //D
    if(udemae[4].score<playdata.min){
    udemae[4].score=playdata.min;
    }
    //E
    udemae[5].score=0;
}
