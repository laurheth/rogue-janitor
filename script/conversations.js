var ConversationBuilder = {
    idleOptions: ["is vaping.","is enjoying a relaxing drink.","is reading a book.","is having a coffee.","is eating an apple."],
    buildConvos: function(speaker) {
        var newConversation = [[{action: ROT.RNG.getItem(this.idleOptions),any:-1}]];
        newConversation.push(this.randomGeneric());
        //return newConversation;

        if (!speaker.metPlayer) {
            newConversation.push(this.meetingPlayer(speaker));
        }
        speaker.convos=newConversation;
    },
    
    randomGeneric: function() {
        let option = Math.floor(ROT.RNG.getUniform() * 10);
        switch(option) {
            default:
            case 0:
            return [{text:"It's nice to relax after a long day in the dungeon!",any:-1}];
            case 1:
            return [{text:"Sometimes you're in a really remote room in the dungeon...",any:1},
                    {text:"It takes forever for the adventurer to show up!",any:2},
                    {text:"It's alright though. It's relaxing to hang out for a bit.",any:-1},
                    ];
            case 2:
            return [{text:"Hey friend, want to vape with me?",y:1,n:2},
                    {action:"passes you their vape. It's nice!",any:-1},
                    {text:"Legit! Nobody should make you feel bad for saying no :)",any:-1},
                    ];
            case 3:
            return [{text:"Adventuring is the biggest industry in dungeons. It's like tourism, but more fun.",any:-1}];
            case 4:
            return [{text:"Psst, don't tell adventurers, but all that 'blood' is just watered down ketchup.",any:1},
                    {text:"Real violence is a strict violation of workplace safety regulations!",any:-1}];
            case 5:
            return [{text:"Gee whiz I love dogs. And cats. Humans have good taste in critters.",any:-1}];
            case 6:
            return [{text:"I really appreciate the work you do! This place literally wouldn't run without you.",any:-1}];
            case 7:
            return [{text:"Golly I could go for a hot cup of coffee right about now.",any:-1}];
            case 8:
            let other=["chef","web developer","game developer","actor","dancer","musician","doctor","vet","nurse","lawyer","paralegal"];
            return [{text:"Being a dungeon monster is fun but I'd love to be a "+ROT.RNG.getItem(other)+" someday.",any:-1}];
            case 9:
            return [{text:"Dang I love fighting adventurers!",any:-1}];
        }
    },

    meetingPlayer: function(speaker) {
        let option = Math.floor(ROT.RNG.getUniform() * 6);
        let parts=speaker.name.split(' ');
        let firstName=parts[0];
        let name=speaker.name;

        switch(option) {
            default:
            case 0:
            return [{text:"Hey! Don't think we've met. My name is "+firstName+". "+name+"!",any:-1}];
            case 1:
            return [{text:"Ahoy, I'm "+name+"! How do you do?",any:-1}];
            case 2:
            return [{text:"Hi! I'm "+firstName+"! It's always nice to see a new face :)",any:-1}];
            case 3:
            return [{text:"It's me! "+name+"!",any:-1}];
            case 4:
            return [{text:"Good morning and welcome to the dungeon! I'm "+name+", but you can just call me "+firstName+".",any:-1}];
            case 5:
            return [{text:"Hey there! My name is "+name+". It's nice to meet you!",any:-1}];
        }
    }
}