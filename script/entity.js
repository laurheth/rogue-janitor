function Entity(x,y,char,color,species,hp=1,tags={},level=1,bgColor='#000',attachToWall=false) {
    this.x=x;
    this.y=y;
    this.char=char;
    this.color=color;
    this.hp=hp;
    this.maxhp=hp;
    this.level=level;
    this.tags=tags;
    this.active=false;
    this.alive=true;
    this.spreading=null;
    this.spreadCount=0;
    this.damagedealt=0;
    this.friends=[];
    let firstName=RandomName();
    this.bgColor=bgColor;
    this.unionStarter=false;
    this.species=species;
    this.bonusMess=null;
    this.questItem=null;
    this.questItemName="";
    if ('monster' in tags) {
        this.name=firstName+" the "+species;
        if (firstName == 'Marx') {
            this.unionStarter=true;
            Game.unionist=this.name;
        }
        if (ROT.RNG.getUniform()>0.95) {
            this.tags.careerChange=true;
        }
    }
    else {
        this.name=species;
    }
    this.playerTalkedToday=false;
    this.playerInteractions=0;
    this.drinking=Math.floor(300*ROT.RNG.getUniform())+100;
    this.home=null;
    this.retired=false;
    this.convoIndex=-1;
    this.convoInnerDex=-1;
    this.metPlayer=false;
    this.convos=[[{action:"is vaping.",any:-1}]];
    this.rangeMessConvo=false;
    this.dropMessConvo=false;
    this.quests=[];
    this.convoOptions={};
    this.convoTags={};
    this.lastDay=1;
    if ('monster' in tags) {
        Game.scheduler.add(this,true);
        Game.monsterList.push(this);
    }
    let dx=0;
    let dy=0;
    while (!this.moveTo(x+dx,y+dy)) {
        let r=0;
        r++;
        for (let i=-r;i<=r;i++) {
            for (let j=-r;j<=r;j++) {
                let testKey=(i+x)+','+(j+y);
                if (testKey in Game.map && Game.map[testKey].passThrough()) {
                    dx=i;
                    dy=j;
                }
            }
        }
    }
    if (attachToWall) {
        var best = [0,0,100];
        for (let i=-3;i<4;i++) {
            for (let j=-3;j<4;j++) {
                let testKey = (this.x+i)+','+(this.y+j);
                if (testKey in Game.map && !Game.map[testKey].passable && Game.map[testKey].entity==null && Game.map[testKey].mess==null) {
                    let dist = Math.abs(i)+Math.abs(j);
                    if (dist < best[2]) {
                        best[0]=i;
                        best[1]=j;
                        best[2]=dist;
                    }
                }
            }
        }
        if (best[2]<100) {
            let oldKey=this.x+','+this.y;
            let newKey=(this.x+best[0])+','+(this.y+best[1]);
            if (oldKey in Game.map && Game.map[oldKey].entity==this) {
                Game.map[oldKey].entity=null;
            }
            this.x+=best[0];
            this.y+=best[1];
            Game.map[newKey].entity=this;
        }
    }
};

Entity.prototype.reset = function(x,y) {
    this.x=x;
    this.y=y;
    this.hp=this.maxhp;
    this.active=false;
    this.alive=true;
    this.spreading=null;
    this.spreadCount=0;
    this.damagedealt=0;
    this.drinking=Math.floor(300*ROT.RNG.getUniform())+100;
    this.home=null;
    this.retired=false;
    this.convoIndex=-1;
    this.convoInnerDex=-1;
    this.convos=[[{action:"is vaping.",any:-1}]];
    this.rangeMessConvo=false;
    this.dropMessConvo=false;
    this.quests=[];
    this.convoOptions={};
    if ('monster' in this.tags) {
        Game.scheduler.add(this,true);
    }
    let dx=0;
    let dy=0;
    while (!this.moveTo(x+dx,y+dy)) {
        let r=0;
        r++;
        for (let i=-r;i<=r;i++) {
            for (let j=-r;j<=r;j++) {
                let testKey=(i+x)+','+(j+y);
                if (testKey in Game.map && Game.map[testKey].passThrough()) {
                    dx=i;
                    dy=j;
                }
            }
        }
    }
    return this;
};

Entity.prototype.adventurerAct = function() {
    if ('loot' in this.tags) {
        let key = this.x+','+this.y;
        if (key in Game.map && Game.map[key].entity==this) {
            Game.map[key].entity=null;
        }
        if ('mess' in this.tags) {
            let newmess=makeMess(this.x,this.y,this.tags.mess);
            newmess.parent=this;
        }
        if ('splashes' in this.tags) {
            let dx;
            let dy;
            do {
                dx = Math.floor(3*ROT.RNG.getUniform())-1;
                dy = Math.floor(3*ROT.RNG.getUniform())-1;
            } while (dx==0 && dy==0);
            makeMess(this.x+dx,this.y+dy,this.tags.splashes);
        }
    }
    else if ('monster' in this.tags) {
        this.hp -= Game.adventurer.dmg;
        let dx = Math.floor(3*ROT.RNG.getUniform())-1;
        let dy = Math.floor(3*ROT.RNG.getUniform())-1;
        let newMess1=makeMess(this.x,this.y,"BloodPool");
        let newMess2=makeMess(this.x+dx,this.y+dy,"BloodPool");
        if (this.bonusMess != null) {
            let testKey=(this.x+dy)+','+(this.y+dx);
            if (testKey in Game.map && Game.map[testKey].passable && !(Game.map[testKey].important)) {
                let newMess3=makeMess(this.x+dy,this.y+dx,this.bonusMess);
                newMess3.droppedBy=this;    
            }
        }
        if (this.hp <= 0) {
            this.alive=false;
            let key = this.x+','+this.y;
            if (key in Game.map && Game.map[key].entity==this) {
                Game.map[key].entity=null;
            }
        }
        /*else {
            Game.adventurer.damage();
        }*/
    }
};

Entity.prototype.cancelConvo = function() {
    window.removeEventListener("keydown",this);
    window.removeEventListener("keypress",this);
    this.convoIndex=-1;
    this.convoInnerDex=-1;
    Game.player.talking=null;
    if (this.convos.length<=0) {
        this.convos.unshift([{action:"is vaping.",any:-1}]);
    }
    Game.player.endTurn();
    //Game.drawMap();
}

Entity.prototype.doConvo = function() {
    //console.log(this.convoIndex + ',' + this.convoInnerDex);
    if (this.convoIndex>=0) {
        if (this.convoInnerDex<0) {
            // don't repeat, unless it's the last one
            if (this.convoIndex > 0) {
                this.convos.splice(this.convoIndex,1);
            }
            this.cancelConvo();
        }
        else {
            // text or action line
            let thisConvo=this.convos[this.convoIndex][this.convoInnerDex];

            if ('tags' in thisConvo) {
                let newTags=Object.getOwnPropertyNames(thisConvo.tags);
                for (let i=0;i<newTags.length;i++) {
                    this.convoTags[newTags[i]]=thisConvo.tags[newTags[i]];
                }
            }

            if ('globalTags' in thisConvo) {
                let newTags=Object.getOwnPropertyNames(thisConvo.globalTags);
                for (let i=0;i<newTags.length;i++) {
                    if (newTags[i]=='nextDay') {
                        delete thisConvo.globalTags.nextDay;
                        Game.nextDay();
                        continue;
                    }
                    if (newTags[i]=='yendorPoints') {
                        Game.yendorPoints += thisConvo.globalTags.yendorPoints;
                        delete thisConvo.globalTags.yendorPoints;
                        continue;
                    }
                    if (newTags[i]=='victory') {
                        Game.victory=true;
                        Game.player.reach=2;
                    }
                    Game.convoTags[newTags[i]] = thisConvo.globalTags[newTags[i]];
                    console.log(newTags[i] + ':' + thisConvo.globalTags[newTags[i]])
                }
            }

            this.convoOptions={};
            let linesNeeded;
            if ('blackScreenMessage' in thisConvo) {
                Game.display.clear();
            }
            // how to continue line
            if ('any' in thisConvo) {
                Game.display.drawText(2,2*Game.offset[1]-2,"Press [enter] to continue.");
                linesNeeded=1;
            }
            else if ('y' in thisConvo && 'n' in thisConvo) {
                Game.display.drawText(2,2*Game.offset[1]-2,"Say [y]es or [n]o?");
                this.convoOptions.y = thisConvo.y;
                this.convoOptions.n = thisConvo.n;
                linesNeeded=1;
            }
            else {
                let outstring="";
                let options=Object.getOwnPropertyNames(thisConvo);
                let choiceNum=0;
                linesNeeded=1;
                for (let i=0;i<options.length;i++) {
                    if (options[i] == 'text' || options[i]=='action' || options[i]=='conditions' || options[i]=='tags' || options[i]=='globalTags' || options[i] == 'message' || options[i] == 'blackScreenMessage') {
                        continue;
                    }
                    linesNeeded++;
                    choiceNum++;

                    outstring+=choiceNum.toString()+') "'+options[i]+'"\n';

                    this.convoOptions[choiceNum.toString()]=thisConvo[options[i]];
                }
                console.log(this.convoOptions);
                outstring = "Options:\n"+outstring;
                Game.display.drawText(2,2*Game.offset[1]-1-linesNeeded,outstring);
            }

            if ('text' in thisConvo) {
                Game.display.drawText(2,2*Game.offset[1]-3-linesNeeded,"%c{#ff0}"+this.name+'%c{} : "' + thisConvo.text+'"'); 
            }
            else if ('action' in thisConvo) {
                Game.display.drawText(2,2*Game.offset[1]-3-linesNeeded,"%c{#ff0}"+this.name+" "+thisConvo.action+'%c{}'); 
            }
            else if ('message' in thisConvo) {
                Game.display.drawText(2,2*Game.offset[1]-3-linesNeeded,thisConvo.message);
            }
            else {
                Game.display.drawText(2,2*Game.offset[1]-3-linesNeeded,"%c{#ff0}"+this.name+" is vaping.%c{}"); 
            }
            
        }
    }
}

Entity.prototype.handleEvent = function(e) {
    var keyCode = e.keyCode;
    var charCode = e.charCode;
    var ch = String.fromCharCode(charCode);
    let success=false;
    console.log(keyCode+','+charCode);
    let thisConvo = this.convos[this.convoIndex];
    if (this.convoIndex >= 0 && this.convoIndex < this.convos.length) {
        //console.log('1');
        //let thisConvo = this.convos[this.convoIndex];
        if (this.convoInnerDex >= 0 && this.convoInnerDex < thisConvo.length) {
            //console.log('2');

            if ('any' in thisConvo[this.convoInnerDex]) {
                //console.log('3');

                if ((keyCode == 27 || keyCode == 8 || keyCode == 88 || keyCode==13) && (charCode == 0)) {
                    //console.log('4');

                    this.convoInnerDex = thisConvo[this.convoInnerDex].any;
                    success = true;
                }
            }
        }
    }
    if (!success) {
        //let thisConvo = this.convos[this.convoIndex];
        ch = ch.toLowerCase();
        if (ch in thisConvo[this.convoInnerDex]) {
            this.convoInnerDex = thisConvo[this.convoInnerDex][ch];
            success=true;
        }
        else if (ch in this.convoOptions) {
            this.convoInnerDex = this.convoOptions[ch];
            success=true;
        }
    }
    if (success) {
        Game.drawMap();
        this.doConvo();
    }
}

// talk to
Entity.prototype.cleanerAct = function() {
    if ('monster' in this.tags) {
        if (!this.playerTalkedToday) {
            this.playerInteractions++;
            Game.yendorPoints+=3;
            this.playerTalkedToday=true;
        }
        this.metPlayer=true;
        Game.player.talking=this;
        let choice=this.convos.length-1;
        if (choice>=0) {
            let acceptable=true;
            do {
                acceptable=true;
                if ('conditions' in this.convos[choice][0]) {
                    acceptable = Game.checkConditions(this.convos[choice][0].conditions,this);
                }
                if (!acceptable) {
                    choice--;
                }
                if (choice < 0) {
                    break;
                }
            } while(!acceptable);
            this.convoIndex=choice;
            if (choice>=0) {
                this.convoInnerDex=0;
            }
        }
        else {
            this.convoIndex=-1;
        }
        window.addEventListener("keydown",this);
        window.addEventListener("keypress",this);
        Game.drawMap();
//        Game.display.drawText(2,2*Game.offset[1]-3,this.name+' : "Wow that was a good day in the dungeon :^)"');
    }
    else if ('loot' in this.tags) {
        // push stuff around?
    } 
    else if ('exit' in this.tags) {
        Game.player.talking=this;
        this.convoIndex=0;
        this.convoInnerDex=0;
        this.convos=[];
        this.convos.push(ConversationBuilder.exitPrompt());
        window.addEventListener("keydown",this);
        window.addEventListener("keypress",this);
        Game.drawMap();
    }
}

Entity.prototype.retiredAct = function() {
    if (this.home == null) {
        this.home = [this.x,this.y];
    }
    if (this.quests.length>0) {
        this.questAct();
        return;
    }
    if (ROT.RNG.getUniform()>0.95) {
        if (this.x != this.home[0] || this.y != this.home[1]) {
            this.moveTo(this.home[0],this.home[1]);
        }
        else {
            let dx = Math.floor(3*ROT.RNG.getUniform())-1;
            let dy = Math.floor(3*ROT.RNG.getUniform())-1;
            this.moveTo(this.x+dx,this.y+dy);
        }
    }
};

Entity.prototype.act = function() {
    if (!this.alive) {
        return;
    }
    else if (this.retired) {
        this.retiredAct();
        return;
    }
    this.drinking--;
    if (this.drinking==0) {
        this.drinking=Math.floor(300*ROT.RNG.getUniform())+100;
        let options=["EmptyBottle","EmptyMug","AppleCore"];
        let newmess=makeMess(this.x,this.y,ROT.RNG.getItem(options));
        newmess.droppedBy=this;
    }
    if (this.spreadCount>0 && this.spreading != null) {
        let newMess = makeMess(this.x,this.y,this.spreading);
        this.spreadCount--;
    }
    if (!this.active) {
        let dx = Math.floor(3*ROT.RNG.getUniform())-1;
        let dy = Math.floor(3*ROT.RNG.getUniform())-1;
        this.moveTo(this.x+dx,this.y+dy);
    }
    else {
        if ('ranged' in this.tags && ROT.RNG.getUniform()>0.4) {
            for (let i=0;i<this.tags.ranged;i++) {
                let dx=0;
                let dy=0;
                if (ROT.RNG.getUniform()>0.5) {
                    dx = Math.floor(3*ROT.RNG.getUniform())-1;
                    dy = Math.floor(3*ROT.RNG.getUniform())-1;
                }
                else {
                    Game.adventurer.hp--;
                    this.damagedealt++;
                }
                let newmess=makeMess(Game.adventurer.x+dx,Game.adventurer.y+dy,this.tags.rangeMess);
                newmess.droppedBy=this;
            }
        }
        else {
            let dx = Math.sign(Game.adventurer.x - this.x);
            let dy = Math.sign(Game.adventurer.y - this.y);
            if (this.x+dx == Game.adventurer.x && this.y+dy == Game.adventurer.y) {
                Game.adventurer.damage();
                this.damagedealt++;
            }
            else {
                let testKey = (this.x+dx)+','+(this.y+dy);
                if (testKey in Game.map && Game.map[testKey].entity != null && Game.map[testKey].entity instanceof Entity && 'monster' in Game.map[testKey].entity.tags) {
                    if (this.friends.indexOf(Game.map[testKey].entity.name)<0) {
                        this.friends.push(Game.map[testKey].entity.name);
                    }
                }
            }
            this.moveTo(this.x + dx, this.y + dy);
        }
    }
}

Entity.prototype.getArt = function() {
    if (this.alive) {
        return [this.char,this.color,this.bgColor];
    }
    else {
        return ['%','#f00','#000'];
    }
}

Entity.prototype.moveTo=function(x,y,questing) {
    let oldKey = this.x+','+this.y;
    let newKey = x+','+y;
    if (newKey in Game.map && Game.map[newKey].passThrough()) {
        Game.map[newKey].entity=this;
        this.x=x;
        this.y=y;
        if (Game.map[newKey].mess != null) {
            Game.map[newKey].mess.spread(this);
        }
    }
    else {
        if (questing) {
            if (newKey in Game.map && Game.map[newKey].passable) {
                if (Game.map[newKey].door != null && Game.map[newKey].open == false) {
                    Game.map[newKey].open=true;
                    return true;
                }
                if (Game.map[newKey].entity != null && Game.map[newKey].entity instanceof Entity && oldKey in Game.map && Game.map[oldKey]==this) {
                    Game.map[oldKey].entity=null;
                    if (Game.map[newKey].entity.moveTo(this.x,this.y)) {
                        Game.map[newKey].entity=this;
                        this.x=x;
                        this.y=y;
                        if (Game.map[newKey].mess != null) {
                            Game.map[newKey].mess.spread(this);
                        }
                        return true;
                    }
                    else {
                        Game.map[oldKey].entity=this;
                        return false;
                    }
                }
            }
        }
        return false;
    }
    /*console.log(Game.getRoomIndex(x,y));
    if (Game.getRoomIndex(x,y)>=0) {
        console.log('Exits:'+Game.rooms[Game.getRoomIndex(x,y)][4]);
    }*/
    if (oldKey != newKey && oldKey in Game.map && Game.map[oldKey].entity==this) {
        Game.map[oldKey].entity=null;
    }
    return true;
};

Entity.prototype.questAct = function() {
    // determine target
    let targetPos = this.home;
    //console.log(this.quests);
    if (this.quests[0] != null) {
        //console.log("not null");
        if (typeof this.quests[0] === "string") {
            //console.log ("is a string");
            if (this.quests[0] in ConversationBuilder) {
                this.quests[0] = ConversationBuilder[this.quests[0]](this.convoTags);
                //console.log(this.quests[0]);
            }
        }
        if (this.quests[0] != null) {
            if (typeof this.quests[0] === 'object') {
                targetPos = [Game.player.x, Game.player.y];
            }
        }
    }
    if (this.x == targetPos[0] && this.y == targetPos[1]) {
        this.quests.shift();
        return;
    }
    var path = [];
    var startPos = [this.x,this.y];
    var astar = new ROT.Path.AStar(targetPos[0], targetPos[1], function (x, y) {
        if ((x==startPos[0] && y==startPos[1]) || (x==targetPos[0] && y==targetPos[1])) {
            return true;
        }
        let key = x + ',' + y;
        if (key in Game.map && Game.map[key].passable && Game.map[key].entity==null) {
            return true;
        }
        else {
            return false;
        }
    });
    astar.compute(this.x,this.y,function(x,y){
        path.push([x,y]);
    });
    let dist = Math.max(Math.abs(path[1][0] - Game.player.x),Math.abs(path[1][1] - Game.player.y));
    if (path.length<2 && dist <2) {
        if (dist<2) {
            dist=0;
        }
        else {
            return;
        }
    }
    this.moveTo(path[1][0],path[1][1],true);

    
    if (dist <2 && this.quests[0] != null) {
        this.convos.push(this.quests[0]);
        this.cleanerAct();
        this.quests.shift();
    }
};

Entity.prototype.invitationQuest=function() {
    //var invitationConvo = ConversationBuilder.invitationConvo();
    this.addQuest('invitationConvo');
};

Entity.prototype.coffeeQuest=function() {
    //var wantCoffeeConvo = ConversationBuilder.coffeeConvo();
    this.addQuest('coffeeConvo');
    this.addQuest('deliverConvo');
};

Entity.prototype.addQuest=function(questConvo) {
    this.quests.push(null);
    this.quests.push(questConvo)
    this.quests.push(null);
};

function AddCollectible(x,y) {
    var options=['Chest','Cauldron','Candleabra','Statue'];
    return GetEntity(ROT.RNG.getItem(options),x,y);
}

function AddMonster(x,y,level) {
    var options=['Goblin','Kobold'];
    if (level==2) {
        options=['Ogre','Imp'];
    }
    else if (level==3) {
        options=['Troll','Naga'];
    }
    else if (level>=4) {
        options=['Balor','Hydra','Dragon'];
    }
    let chosen=ROT.RNG.getItem(options);
    if (Game.monsterList.length>0) {
        for (let i=0;i<Game.monsterList.length;i++) {
            if (!Game.monsterList[i].alive || Game.monsterList[i].retired) {
                if (Game.monsterList[i].species == chosen) {
                    console.log(chosen +' - '+Game.monsterList[i].species);
                    return Game.monsterList[i].reset(x,y);
                }
            }
        }
    }
    return GetEntity(chosen,x,y);
}

function GetEntity(name,x,y) {
    var newEntity;
    switch (name) {
        default:
        case 'Goblin':
        newEntity = new Entity(x,y,'g','#0f0',name,2,{monster:true},1);
        break;
        case 'Kobold':
        newEntity = new Entity(x,y,'k','#fa0',name,2,{monster:true,small:true},1);
        break;
        case 'Ogre':
        newEntity = new Entity(x,y,'O','#fa0',name,4,{monster:true,big:true},2);
        break;
        case 'Imp':
        newEntity = new Entity(x,y,"i",'#fd1',name,3,{monster:true,ranged:1,rangeMess:'Scorch',small:true});
        break;
        case 'Troll':
        newEntity = new Entity(x,y,'T','#0c0',name,6,{monster:true,big:true},3);
        break;
        case 'Naga':
        newEntity = new Entity(x,y,'N','#0c2',name,5,{monster:true,ranged:1,rangeMess:'AcidPool'},3);
        break;
        case 'Balor':
        newEntity = new Entity(x,y,'&','#f00',name,8,{monster:true,ranged:1,rangeMess:'Scorch',big:true},4);
        break;
        case 'Hydra':
        newEntity = new Entity(x,y,'H','#fa0',name,9,{monster:true,big:true},4);
        newEntity.bonusMess="HydraHead";
        break;
        case 'Dragon':
        newEntity = new Entity(x,y,'D','#0f0',name,7,{monster:true,ranged:2,rangeMess:'Scorch',big:true},4)
        break;
        case 'Gold':
        newEntity = new Entity(x,y,'$','#ff0',name,1,{loot:true});
        break;
        case 'Chest':
        newEntity = new Entity(x,y,'\u03C0','#fa0','Treasure Chest',1,{loot:true,mess:'BrokenChest'});
        break;
        case 'Table':
        newEntity = new Entity(x,y,'\u2564','#fa0',"Table",1,{loot:true,mess:'BrokenTable'});
        break;
        case 'Cauldron':
        newEntity = new Entity(x,y,'U','#ccc','Cauldron',1,{loot:true,mess:'TippedCauldron',splashes:'Water'});
        break;
        case 'Statue':
        newEntity = new Entity(x,y,'\u03A9','#ccc','Statue',1,{loot:true,mess:'SmashedStatue'});
        break;
        case 'Candleabra':
        newEntity = new Entity(x,y,'\u03A8','#ff0','Candleabrum',1,{loot:true,mess:'SmashedCandle',splashes:'Scorch'});
        break;
        case 'ExitDoor':
        newEntity = new Entity(x,y,'X','#fff','Exit Door',1,{exit:true},1,'#c33',true);
    }
    return newEntity;
}

function RandomName() {
    var sg=new ROT.StringGenerator({order:2});
    var nameList=[
        'Ralph',
        'Franklin',
        'Susan',
        'Jim',
        'Todd',
        'Billy',
        'Jack',
        'Helen',
        'Timmy',
        'Greg',
        'Meghan',
        'Scritches',
        'Rose',
        'Betty',
        'Constance',
        'Sam',
        'Bob',
        'Robert',
        'Samson',
        'Steph',
        'Chomps',
        'Bites',
        'Claws',
        'Sauce',
        'Newt',
        'Tiny',
        'Stabitha',
        'Salamander',
        'Nancy',
        'Rasputin',
        'Marx',
        'Carol',
        'Red',
        'Green',
    ];
    for (let i=0;i<nameList.length;i++) {
        sg.observe(nameList[i].toLowerCase());
    }
    let name;
    do {
        name=sg.generate();
        name = name.charAt(0).toUpperCase()+name.slice(1)
    } while (name.length < 3 || name.length > 11 || Game.nameRegistry.indexOf(name)>=0);
    Game.nameRegistry.push(name);
    return name;
}