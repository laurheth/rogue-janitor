var Game = {
    display: null,
    map: {},
    freeCells:[],
    hallCells:[],
    player:null,
    scheduler:null,
    engine:null,
    offset: [],
    corners:[],
    init: function() {
        let screen = document.getElementById("gameContainer");
        this.display = new ROT.Display();
        var setsize=this.display.computeSize(screen.clientWidth,screen.clientHeight);
        //console.log(screen.clientWidth+','+screen.clientHeight);
        this.display.setOptions({width: setsize[0],height: setsize[1]});
        this.offset[0] = parseInt(setsize[0]/2);
        this.offset[1] = parseInt(setsize[1]/2);
        screen.appendChild(this.display.getContainer());
        this.scheduler = new ROT.Scheduler.Simple();
        this.player = new Player(-1,-1,-1);

        this.scheduler.add(this.player,true);

        this.generateMap();

        this.drawMap();

        this.engine = new ROT.Engine(this.scheduler);
        this.engine.start();
    },

    drawMap: function() {
        this.display.clear();
        for (let i=-this.offset[0]+this.player.x;i<this.offset[0]+this.player.x;i++) {
            for (let j=-this.offset[1]+this.player.y;j<this.offset[1]+this.player.y;j++) {
                let key=i+','+j;
                //console.log(key);
                if (key in this.map) {
                    this.display.draw(i+this.offset[0]-this.player.x,j+this.offset[1]-this.player.y,this.map[key]);
                }
            }
        }
        this.player.draw();
    },

    generateMap: function() {
        this.corners=[[0,0],[0,0]];
        var roomCenters=[];
        var breaker=0;
        let minMax=[4,15];
        let targSize=600;
        while (this.freeCells.length<targSize && breaker<10000) {
            let roomSize = [ Math.floor((minMax[1]-minMax[0])*ROT.RNG.getUniform())+minMax[0], Math.floor((minMax[1]-minMax[0])*ROT.RNG.getUniform())+minMax[0] ];
            let roomCorner=[0,0];
            var breaker2=0;
            while (!this.checkFits(roomSize,roomCorner)) {
                roomCorner[0] += (Math.floor(3*ROT.RNG.getUniform())-1);
                roomCorner[1] += (Math.floor(3*ROT.RNG.getUniform())-1);
                roomSize = [ Math.floor((minMax[1]-minMax[0])*ROT.RNG.getUniform())+minMax[0], Math.floor((minMax[1]-minMax[0])*ROT.RNG.getUniform())+minMax[0] ];
                breaker2++;
            }
            if (roomCenters.length>0) {
                roomCenters.push([roomCorner[0]+Math.floor(roomSize[0]/2) , roomCorner[1]+Math.floor(roomSize[1]/2)]);
            }
            else {
                roomCenters = [[roomCorner[0]+Math.floor(roomSize[0]/2) , roomCorner[1]+Math.floor(roomSize[1]/2)]];
            }
            this.buildRoom(roomSize,roomCorner);
            if (ROT.RNG.getUniform()>0.5 && this.freeCells.length<targSize) {
                this.connectRoom(roomCenters,1);
                this.connectRoom(roomCenters,0);
            }
            else {
                this.connectRoom(roomCenters,-1);
            }
            breaker++;
        }
        this.player.x = roomCenters[roomCenters.length-1][0];
        this.player.y = roomCenters[roomCenters.length-1][1];
        this.addDoors();
    },

    addDoors: function() {
        for (let i=this.corners[0][0];i <= this.corners[1][0];i++) {
            for (let j=this.corners[0][1]; j<= this.corners[1][1];j++) {
                let key = i+','+j;
                let orthoCount=0;
                let diagCount=0;
                let count=0;
                let touchRoom=false;
                if (key in this.map && this.map[key] == '.') {
                    for (let ii=-1;ii<2;ii++) {
                        for (let jj=-1;jj<2;jj++) {
                            let testKey = (i+ii)+','+(j+jj);
                            if (this.freeCells.indexOf(testKey)>=0) {
                                touchRoom=true;
                            }
                            if (testKey in this.map && this.map[testKey]=='#') {
                                count++;
                                if (ii==0 || jj==0) {
                                    orthoCount += ii + 2*jj;
                                }
                                else {
                                    diagCount++;
                                }
                            }
                        }
                    }
                    if (touchRoom && orthoCount==0 && count>2 && this.hallCells.indexOf(key)>=0) {
                        this.map[key]='+';
                    }
                }
            }
        }
    },

    checkFits: function(roomSize,roomCorner) {
        for (let i=-5;i<roomSize[0]+5;i++) {
            for (let j=-5;j<roomSize[1]+5;j++) {
                let key = (i+roomCorner[0])+','+(j+roomCorner[1]);
                if (key in this.map) {
                    return false;
                }
            }
        }
        return true;
    },

    buildRoom: function(roomSize,roomCorner) {
        for (let i=-1;i<roomSize[0]+1;i++) {
            for (let j=-1;j<roomSize[1]+1;j++) {
                let key = (i+roomCorner[0])+','+(j+roomCorner[1]);
                
                //console.log(key);
                if (i>=0 && i<roomSize[0] && j>=0 && j<roomSize[1]) {
                    this.map[key]='.';
                    this.freeCells.push(key);
                }
                else {
                    this.map[key]='#';
                    if (i+roomCorner[0] < this.corners[0][0]) {
                        this.corners[0][0] = i+roomCorner[0];
                    }
                    if (j+roomCorner[1] < this.corners[0][1]) {
                        this.corners[0][1] = j+roomCorner[1];
                    }
                    if (i+roomCorner[0] > this.corners[1][0]) {
                        this.corners[1][0] = i+roomCorner[0];
                    }
                    if (j+roomCorner[1] > this.corners[1][1]) {
                        this.corners[1][1] = j+roomCorner[1];
                    }
                }
            }
        }
    },

    connectRoom: function(roomCenters,xy=-1) {
        //console.log(roomCenters);
        let lastCenter = [roomCenters[roomCenters.length-1][0], roomCenters[roomCenters.length-1][1]];
        let index = Math.floor((roomCenters.length-1) * ROT.RNG.getUniform());
        let best = 1000;
        //let index=-1;
        for (let i=0;i<roomCenters.length-1;i++) {
            if (xy==0) {
                if (Math.abs(lastCenter[0]-roomCenters[i][0]) < best) {
                    index=i;
                    best=Math.abs(lastCenter[0]-roomCenters[i][0])
                }
            }
            else if (xy==1) {
                if (Math.abs(lastCenter[1]-roomCenters[i][1]) < best) {
                    index=i;
                    best = Math.abs(lastCenter[1]-roomCenters[i][1]);
                }
            }
            else {
                if (Math.abs(lastCenter[0]-roomCenters[i][0]) + Math.abs(lastCenter[1]-roomCenters[i][1]) < best) {
                    index=i;
                    best = Math.abs(lastCenter[0]-roomCenters[i][0]) + Math.abs(lastCenter[1]-roomCenters[i][1]);
                }
            }
        }
        let targCenter = roomCenters[index];
        let startedDigging=false;
        let doFirst = Math.floor(2*ROT.RNG.getUniform());
        for (let k=0;k<2;k++) {
            var breaker=0;
            while (lastCenter[doFirst] != targCenter[doFirst] && breaker<1000) {
                for (let i=-1;i<2;i++) {
                    for (let j=-1;j<2;j++) {
                        let key = (lastCenter[0]+i)+','+(lastCenter[1]+j);
                        if (!(key in this.map)) {
                            startedDigging=true;
                        }
                        if (i==0 && j==0) {
                            //console.log(key);
                            if (this.map[key] == '.' && startedDigging) {
                                return;
                            }
                            if (key in this.map && this.map[key] != '.') {
                                this.hallCells.push(key);
                            }
                            this.map[key]='.';
                        }
                        else if (!(key in this.map)) {
                            this.map[key]='#';
                        }
                    }
                }
                if (lastCenter[doFirst] > targCenter[doFirst]) {
                    lastCenter[doFirst]--;
                }
                else if (lastCenter[doFirst] < targCenter[doFirst]) {
                    lastCenter[doFirst]++;
                }
                breaker++;
            }
            doFirst++;
            doFirst %= 2;
        }
    }

};

function Player(x,y) {
    this.x=x;
    this.y=y;
    this.char='@';
    this.color='#fff';
    this.keyMap = {};
    this.keyMap[38] = 0;
    this.keyMap[75] =0;
    this.keyMap[104] = 0;
    this.keyMap[85] = 1;
    this.keyMap[33] = 1; //85
    this.keyMap[105] = 1;
    this.keyMap[76] = 2;
    this.keyMap[39] = 2;//76
    this.keyMap[102] = 2;
    this.keyMap[78] = 3;
    this.keyMap[34] = 3;//78
    this.keyMap[99] = 3;
    this.keyMap[74] = 4;
    this.keyMap[40] = 4;//74
    this.keyMap[98] = 4;
    this.keyMap[66] = 5;
    this.keyMap[35] = 5;//66
    this.keyMap[97] = 5;
    this.keyMap[72] = 6;
    this.keyMap[37] = 6;//72
    this.keyMap[100] = 6;
    this.keyMap[89] = 7;
    this.keyMap[36] = 7;//89
    this.keyMap[103] = 7;

}

Player.prototype.draw = function() {
    Game.display.draw(Game.offset[0],Game.offset[1],this.char,this.color)
}

Player.prototype.act = function() {
    Game.engine.lock();
    window.addEventListener("keydown", this);
}

Player.prototype.handleEvent = function(e) {
    let code = e.keyCode;
    //console.log(this.keyMap);
    if (!(code in this.keyMap)) {
        return;
    }
    //console.log(code);

    // movement
    let diff = ROT.DIRS[8][this.keyMap[code]];
    let testKey = (this.x+diff[0])+','+(this.y+diff[1]);
    if (testKey in Game.map && Game.map[testKey]!='#') {
        let parts = testKey.split(',');
        this.x = Math.round(parseInt(parts[0]));
        this.y = Math.round(parseInt(parts[1]));
    }
    console.log(this.x+','+this.y);
    Game.drawMap();
    window.removeEventListener("keydown",this);
    Game.engine.unlock();
}