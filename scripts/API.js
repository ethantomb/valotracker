/**
 * Valorant Stats Tracker by Ethan. 
 * This is a simple player lookup website built ontop of henrikdev's API.
 * All credit goes to henrikdev for the API.
 */

//Base api endpoints
const mmrURL = "https://api.henrikdev.xyz/valorant/v1/mmr/";
const matchHistURL = "https://api.henrikdev.xyz/valorant/v3/matches/";
/**
 * Sleeps for a time in ms
 * @param {ms} - The time in ms
 * @returns setTimeout promise: resolves in requested time.
 */
async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}



/**
 * Search player
 * @param {*} name - The player's name
 * @param {*} tag  - The player's tag.
 * @returns - nada
 */
async function searchPlayer(name, tag,region) {


    //Normalize name.
    var ign=name;
    name = name.replace(" ", "%20");
    
    
    if (!name || !tag) {

        console.log("err");
        document.getElementById("rankText").innerHTML = `Error: You gotta add a name#tag.`;

        document.getElementById("rankInfoCard").style.animation = "slideIn 4s ease 0s 1 normal forwards";

        document.getElementById("search").innerHTML = "Search";
        return;
    }
    const O = '{"games":0,"wins":0,"K":0,"D":0,"A":0,"bestKD":-1,"bestK":0,"bestD":0,"bestA":0,"wonBestMatch":false}'
    //My simple object to store the data.
    var data = { "Metadata": { "Name": "", "Rank": "" }, "Unrated": JSON.parse(O), "Competitive": JSON.parse(O), "Deathmatch": JSON.parse(O), "Spike Rush": JSON.parse(O), "Replication": JSON.parse(O), "Escalation": JSON.parse(O) };
    
    categories = ["escalation", "spikerush", "deathmatch", "competitive", "unrated", "replication"]
    var url = mmrURL + region + "/" + name + "/" + tag;
    fetch(mmrURL + region + "/" + name + "/" + tag, {
        headers: {
            "Content-Type": "text/plain"
        }
    }).then((promiseMMR) => {

        promiseMMR.json().then((mmrdata) => {
            if (mmrdata.status != 200) {
                console.log("err");
                document.getElementById("rankText").innerHTML = `Error: Failed to find player named ${name}#${tag}`;

                document.getElementById("rankInfoCard").style.animation = "slideIn 1s linear 0s 1 normal forwards";
                document.getElementById("search").innerHTML = "Search";
                return;
            }  



            let rank = mmrdata["data"]["currenttierpatched"];
            let rankName,rankImsrc;
            
            if(rank==null){
                rankName="Unranked";
                rankImsrc = "https://static.wikia.nocookie.net/valorant/images/b/b2/TX_CompetitiveTier_Large_0.png";
                }else{
                rankName=rank;
                rankImsrc=mmrdata["data"]["images"]["small"];
            }
            addRankCard(rank,rankImsrc);
            
            
        });

    });
    for (gamemode of categories) {
        fetch(matchHistURL + region + "/" + name + "/" + tag + "?filter=" + gamemode, {
            headers: {
                "Content-Type": "text/plain"
            }
        }).then((gamesPromise) => {
            
            gamesPromise.json().then((games) => {
                console.log(games);
                games = games["data"]


                let thisK, thisD, thisA;
                
                for (let i = 0; i < games.length; i++) {

                    let mode = games[i]["metadata"]["mode"];
                    if (mode != "Custom Game") {


                        let winTeam = (games[i]["teams"]["red"]["has_won"] ? "Red" : "Blue");
                        data[mode]["games"] += 1;

                        let players = games[i]["players"]["all_players"];
                        
                        let searchedPlayer = players.filter(p => p["name"].toLowerCase() == ign.toLowerCase())[0];

                        if (searchedPlayer["team"] == winTeam) {
                            data[mode]["wins"] += 1
                        }
                        thisK = parseInt(searchedPlayer["stats"]["kills"]);
                        thisD = parseInt(searchedPlayer["stats"]["deaths"]);
                        thisA = parseInt(searchedPlayer["stats"]["assists"]);

                        data[mode]["K"] += thisK;
                        data[mode]["D"] += thisD;
                        data[mode]["A"] += thisA;
                        if (thisK / thisD > data[mode]["bestKD"]) {
                            data[mode]["bestKD"] = thisK / thisD;
                            data[mode]["bestK"] = thisK;
                            data[mode]["bestD"] = thisD;
                            data[mode]["bestA"] = thisA;
                            
                            data[mode]["wonBestMatch"] = (mode.toLowerCase() == "deathmatch" && (thisK >= 40)) || (searchedPlayer["team"] == winTeam);
                        }

                    }
                }
                if (gamemode == "replication") {
                    fillDivs(data);
                }

            });
        });
    }



}




