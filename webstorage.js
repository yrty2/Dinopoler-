var username="無名";
let storage=window["localStorage"];
var population=storage.getItem("population");
var leaderboard;
if(population==null){
    relinquish();
}
getrecord();
document.getElementById("populationCount").innerHTML=population;
function welcome(){
    storage.setItem("population",parseInt(population)+1);
}
function record(){
    leaderboard.push({name:username,score:game.score});
    quickSort(0,leaderboard.length-1);
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
        ran.innerHTML+=`${leaderboard.length-k}.${leaderboard[k].name}  ${Math.round(leaderboard[k].score)}<br>`;
    }
}
function relinquish(){
    storage.setItem("population",0);
    population=0;
    storage.setItem("leaderboard",[]);
    leaderboard=[];
}
//順位付け
function quickSort(start,end){
    var pivot = leaderboard[Math.floor((start+end)/2)].score;
    var left=start;
    var right=end;
    while(true){
        while(leaderboard[left].score<pivot){
            left++;
        }
        while(pivot<leaderboard[right].score){
            right--;
        }
        if(right<=left){
            break;
        }
        var tmp =leaderboard[left];
        leaderboard[left]=leaderboard[right];
        leaderboard[right]=tmp;
        left++;
        right--;
    }
    if(start<left-1){
        quickSort(start,left-1);
    }
    if(right+1<end){
        quickSort(right+1,end);
    }
}