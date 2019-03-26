function Adventurer(x,y) {
    this.x=x;
    this.y=y;
    this.hunger=50;
    this.turns=-1;
    this.blood=0;
    this.dmg=1;
    this.hp=5;
    this.char='H';
    this.color='#0ff';
    this.moveTo(x,y);
    this.roomsToExplore=[];
    this.destinationIndex=0;
    this.destinations=[[this.x,this.y]]; // places to go
    this.targets=[]; // monsters to slay
    this.currentTarget=[];
    this.active=true;
    this.path=[];
    this.recalculate=true;
    this.spreading="MudPrints";
    this.spreadCount=10;
    this.fov = new ROT.FOV.PreciseShadowcasting(function(x,y){
        return Game.lightPasses(x,y);
    });
    for (let i=0;i<Game.rooms.length;i++) {
        if (i != Game.staffRoomID) {
            this.roomsToExplore.push(i);
            let center=Game.getCenter(i);
            this.destinations.push([center[0],center[1]]);
        }
    }
    //console.log(this.destinations);
    Game.scheduler.add(this,true);
    this.path=null;
}

Adventurer.prototype.nextDestination = function() {
    if (this.x == this.destinations[this.destinationIndex][0] && this.y == this.destinations[this.destinationIndex][1]) {
        this.destinations.splice(this.destinationIndex, 1);
    }
    if (this.destinations.length==0 || this.destinations==null) {
        this.destinations=[[Game.stairs[1][0],Game.stairs[1][1]]];
        if (this.x==this.destinations[0][0] && this.y==this.destinations[0][1]) {
            let key=this.x+','+this.y;
            if (key in Game.map && Game.map[key].entity==this) {
                Game.map[key].entity=null;
            }
            this.x=-10000;this.y=-100000;
            this.active=false;
            Game.moveMonstersToLounge();
            Game.scheduler.add(Game.player,true);
            return;
        }
    }
    
    let best=[-1,10000];
    for (let i=0;i<this.destinations.length;i++) {
        let dist = Math.abs(this.x - this.destinations[i][0]) + Math.abs(this.y - this.destinations[i][1]);
        if (dist < best[1]) {
            best[0]=i;
            best[1]=dist;
        }
    }
    this.destinationIndex=best[0];
}

Adventurer.prototype.look = function() {
    this.fov.compute(this.x,this.y,10,function(x,y,r,visibility) {
        if (x == Game.adventurer.x && y==Game.adventurer.y) {
            return;
        }
        let key = x+','+y;
        if (key in Game.map && Game.map[key].entity != null && Game.map[key].entity instanceof Entity) {
            if ('monster' in Game.map[key].entity.tags) {
                //console.log('monster spotted');
                Game.map[key].entity.active=true;
                Game.adventurer.targets.push(Game.map[key].entity);
            }
            else if ('loot' in Game.map[key].entity.tags) {
                //console.log('loot identified');
                
                Game.adventurer.destinations.push([x,y]);
                Game.adventurer.newDestinationFound=true;
                //console.log(this.destinations);
            }
        }
    });

    if (this.newDestinationFound) {
        this.nextDestination();
    }
}

Adventurer.prototype.damage = function() {
    this.hp--;
    let dx = Math.floor(3 * ROT.RNG.getUniform()) - 1;
    let dy = Math.floor(3 * ROT.RNG.getUniform()) - 1;
    //let newMess1 = makeMess(this.x, this.y, "BloodPool");
    let newMess2 = makeMess(this.x + dx, this.y + dy, "BloodPool");

}

// How does the brave and noble adventurer proceed?
Adventurer.prototype.act = function () {
    console.log(this.turns);
    if (this.turns>10000) {
        this.active=false;
        Game.generateDungeon();
    }
    //console.log(this.hp);
    if (!this.active) {
        return;
    }
    if (this.spreadCount>0 && this.spreading != null) {
        let newMess = makeMess(this.x,this.y,this.spreading);
        this.spreadCount--;
        if (this.spreadCount==0 && newMess.spreads!=null && newMess.spreads!="") {
            newMess.spread(this);
        }
    }
    if (this.hp<=0 && this.turns % 5 ==0) {
        console.log("Dropping potion");
        let newMess1 = makeMess(this.x, this.y, "EmptyPotion");
        this.hp+=6;
    }
    //console.log(this.x+','+this.y);
    //console.log(this.destinations);
    this.hunger--;
    if (this.hunger<=0) {
        let newMess = makeMess(this.x,this.y,"Wrapper");
        this.hunger += Math.floor(15*ROT.RNG.getUniform())+20;
    }
    this.turns++;
    if (this.blood>0) {
        this.blood--;
    }
    if (this.turns % 5 ==0) {
        this.look();
    }
    while (this.targets.length>0 && !(this.targets[0].alive)) {
        this.targets.shift();
    }
    if (this.targets.length>0) {
        if (this.currentTarget != [this.targets[0].x,this.targets[0].y]) {
            this.currentTarget=[this.targets[0].x,this.targets[0].y];
            this.recalculate=true;
        }
    }
    else {
        while (this.destinations.length>0 && this.x == this.destinations[this.destinationIndex][0] && this.y == this.destinations[this.destinationIndex][1]) {
            this.nextDestination();
            if (!this.active) {return;}
        }
        if (this.currentTarget != this.destinations[this.destinationIndex]) {
            this.currentTarget = this.destinations[this.destinationIndex];
            this.recalculate=true;
        }
    }
    if (this.recalculate) {
        this.path=[];
        var astar = new ROT.Path.AStar(this.currentTarget[0], this.currentTarget[1], function(x,y) {
            let key = x+','+y;
            if (key in Game.map && Game.map[key].passable) {
                return true;
            }
            else {
                return false;
            }
        });//,{topology:4});
        //console.log("Recalculating...");
        //if (t)
        astar.compute(this.x,this.y,function(x,y){
            Game.adventurer.path.push([x,y]);
        });
        
        this.path.shift()
        this.recalculate=false;
    }
    //console.log(this.currentTarget);
    if (this.path.length > 0) {
        let nextStep=this.path.shift()
        //console.log(nextStep);
        if (!this.moveTo(nextStep[0],nextStep[1])) {
            let key=nextStep[0]+','+nextStep[1];
            if (key in Game.map) {
                if (Game.map[key].door != null) {
                    Game.map[key].open=true;
                }
                if (Game.map[key].entity != null && Game.map[key].entity instanceof Entity) {
                    Game.map[key].entity.adventurerAct();
                }
            }
            this.recalculate=true;
        }
    }
}

Adventurer.prototype.getArt = function() {
    return [this.char,this.color,'#000'];
}

Adventurer.prototype.moveTo=function(x,y) {
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