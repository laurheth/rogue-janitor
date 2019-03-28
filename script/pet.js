function Pet(x,y,char,species) {

    let color=ROT.Color.toHex(ROT.Color.hsl2rgb([ROT.RNG.getUniform(),1,0.5]));

    Entity.call(this,x,y,char,color,species,1,{animal:true},1,'#000',false);
    Game.petList.push(this);
    Game.scheduler.add(this,true);
    this.path=[];
    this.direction=[0,0];
    this.sleep=5;
    this.steps=0;
    this.failures=0;
    this.home=null;
    this.metPlayer=false;
    this.aloofness=0.7;
    this.sound='Bork';
}

//function Entity(x,y,char,color,species,hp=1,tags={},level=1,bgColor='#000',attachToWall=false) {
Pet.prototype = Object.create(Entity.prototype);

Pet.prototype.cleanerAct = function() {
    if (!this.playerTalkedToday) {
        this.playerInteractions++;
        Game.yendorPoints+=2;
        this.playerTalkedToday=true;
    }
    Game.player.talking=this;
    if (this.convos.length <= 1) {
        ConversationBuilder.petConvo(this);
    }
    this.metPlayer=true;
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
};

Pet.prototype.recenter = function(x,y) {
    let dx=0;
    let dy=0;
    this.playerTalkedToday=false;
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
    this.home=[this.x,this.y];
};

// Override act. Animals do what they're gonna do
Pet.prototype.act = function() {
    //console.log('pet act');
    if (this.home==null) {
        this.home=[this.x,this.y];
    }
    if (this.sleep>0) {
        this.sleep--;
        return;
    }
    else if (this.path.length>0) {
        //console.log('trypath?');
        //console.log(this.x+','+this.y+' --> '+this.path[0])
        if (this.moveTo(this.path[0][0],this.path[0][1])) {
            this.failures=0;
            this.path.shift();
        }
        else {
            this.failures++;
        }
        if (this.failures > 5) {
            this.path=[];
        }
        return;
    }

    if (this.steps<0) {
        this.sleep += Math.floor(10*ROT.RNG.getUniform());
        if (ROT.RNG.getUniform()<this.aloofness) {
            this.steps += Math.floor(20*ROT.RNG.getUniform());
            do {
                this.direction[0] = Math.floor(3*ROT.RNG.getUniform())-1;
                this.direction[1] = Math.floor(3*ROT.RNG.getUniform())-1;
            } while (this.direction[0]==0 && this.direction[1]==0); 
        }
        else {
            var targetPos=[this.home[0],this.home[1]];
            /*if (ROT.RNG.getUniform()>0.3 ) {
                let key = ROT.RNG.getItem(Game.freeCells);
                let parts=key.split(',');
                targetPos[0]=parseInt(parts[0]);
                targetPos[1]=parseInt(parts[1]);
            }*/
            var path=[[this.x,this.y]];
            var astar = new ROT.Path.AStar(targetPos[0], targetPos[1], function (x, y) {
                if ((x==path[0][0] && y==path[0][1]) || (x==targetPos[0] && y==targetPos[1])) {
                    return true;
                }
                let key = x + ',' + y;
                if (key in Game.map && Game.map[key].passThrough()) {
                    return true;
                }
                else {
                    return false;
                }
            });
            astar.compute(this.x,this.y,function(x,y){
                path.push([x,y]);
            });
            if (path==null) {
                this.path=[];
            }
            else {
                this.path=path;
                this.path.shift();
                this.path.shift();
            }
            //console.log(targetPos);
            //console.log(this.path);
        }
    }
    else {
        if (!this.moveTo(this.x+this.direction[0],this.y+this.direction[1])) {
            while (this.direction[1]==0) {
                this.direction[1] = Math.floor(3*ROT.RNG.getUniform())-1;
            }
            if (!this.moveTo(this.x,this.y+this.direction[1])) {
                while (this.direction[0]==0) {
                    this.direction[0] = Math.floor(3*ROT.RNG.getUniform())-1;
                }
                if (!this.moveTo(this.x+this.direction[0],this.y)) {
                    this.steps=-2;
                    do {
                        this.direction[0] = Math.floor(3*ROT.RNG.getUniform())-1;
                        this.direction[1] = Math.floor(3*ROT.RNG.getUniform())-1;
                    } while (this.direction[0]==0 && this.direction[1]==0); 
                }
            }
        }
    }
};

Pet.prototype.constructor=Pet;