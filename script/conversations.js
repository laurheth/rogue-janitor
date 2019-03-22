var ConversationBuilder = {
    idleOptions: ["is vaping.","is enjoying a relaxing drink.","is reading a book.","is having a coffee.","is eating an apple."],
    buildConvos: function(speaker) {
        var newConversation = [[{action: ROT.RNG.getItem(this.idleOptions),any:-1}]];
        newConversation.push(this.randomGeneric());

        if (speaker.friends.length>0) {
            let friend=ROT.RNG.getItem(speaker.friends);
            newConversation.push(this.loveMyFriend(friend));
        }
        //return newConversation;
        if (speaker.damagedealt>=4) {
            newConversation.push(this.lottaDamage(speaker));
        }
        else if (speaker.damagedealt<=1 && ROT.RNG.getUniform()>0.8) {
            newConversation.push(this.noDamage(speaker));
        }
        newConversation.push(this.impressed());
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
    },

    loveMyFriend: function(friend) {
        let phrases=[friend+" and I go way back! We started working here around the same time, too.","Nothing beats just sitting back and defending some treasure with my pal, "+friend+"!","My friend, "+friend+", has such a good sense of humor."];
        return [{text:ROT.RNG.getItem(phrases),any:-1}];
    },

    noDamage: function(speaker) {
        let openPhrases=["Dang, didn't even get one hit in today!","That adventurer was pretty good!","Haha I was just hanging out vaping and this adventurer came from nowhere.","Wowzers I got walloped today."];
        let closePhrases=["Sometimes you have a rough day, but it's alright! Tomorrow will friggin rule!","You get knocked down, but you just have to get back up again!","Rough days happen but I still love working here!","Next time the adventurer won't be so lucky!"];
        //let option = Math.floor(8*ROT.RNG.getUniform());
        var conversation=[{text:ROT.RNG.getItem(openPhrases),any:1},
            {text:ROT.RNG.getItem(closePhrases),any:-1}
            ];
        if (ROT.RNG.getUniform()>0.5) {
            conversation[1].any=2;
            conversation.push({text:"Do you ever have rough days?",y:3,n:6});
            conversation.push({text:"That's real. Me too, friend.",any:4});
            conversation.push({text:"Listen, if you ever need someone to talk to, or like... vape with?",any:5});
            conversation.push({text:"I'm right here with ya.",any:-1});
            conversation.push({text:"I'm really glad to hear that, friend!",any:7});
            conversation.push({text:"You're a cool person and you do a heck of a lot. You deserve to be happy!",any:-1});
        }
        return conversation;
    },

    lottaDamage: function(speaker) {
        let openPhrases=["Haha! I walloped that adventurer!","That adventurer didn't see me coming :)","We really beat that adventurer up!","Most of that 'blood' out there wasn't from monsters, I'll tell you that much :D","That adventurer got WRECKED.","You should've seen the look on the adventurer's face when they met me!"];
        let closePhrases=["They made it through, but they had to work extra hard to get by me!","Days like today remind me why I love this job!","These teeth and claws aren't just for show, you know!","You look pretty tough yourself; I bet you'd wipe the floor with them if you joined us someday!","I reckon you'd kick some butt too if you were there :)"];
        if (speaker.friends.length>0) {
            let friend = ROT.RNG.getItem(speaker.friends);
            closePhrases.push("I think my favourite part was teaming up on them with my good pal "+friend+"!");
            closePhrases.push(friend+" threw some dang good punches too!");
            closePhrases.push(friend+" and I make a really good team! We all do, honestly! You included!!");
            openPhrases.push("Dang, me and "+friend+" gave that adventurer a rough time!");
        }
        if ('ranged' in speaker.tags) {
            if (speaker.tags.rangeMess == 'Scorch') {
                openPhrases.push("I burned that adventurer something fierce!");
                openPhrases.push("That adventurer was looking pretty crispy by the time I was through with them!");
                openPhrases.push("Gosh darn I just LOVE toasting adventurers.");
                openPhrases.push("Fire's good. Fire from me is even better :)");
            }
            else if (speaker.tags.rangeMess == 'AcidPool') {
                openPhrases.push("That adventurer was pretty drenched in acid when I was through with them.");
                openPhrases.push("I love melting adventurers with acid!");
            }
        }
        let option = Math.floor(10*ROT.RNG.getUniform());
        switch (option) {
            default:
            return [{text:ROT.RNG.getItem(openPhrases),any:1},
                    {text:ROT.RNG.getItem(closePhrases),any:-1}
                    ];
            case 8:
            return [{action:"flexes and kisses their muscles.",any:1},
                {text:ROT.RNG.getItem(openPhrases),any:-1}
                ];
            case 9:
            return [
                {text:"You ever think about joining us sometime during the main event?",y:1,n:2},
                {text:"Yes! I love it. A hard worker like you, you would wreck any adventurer lucky enough to meet you!",any:-1},
                {text:"Fair enough! Definitely not for everyone. Still though, I hope you get to see the recordings; it's quite a spectacle :)",any:-1},
            ]
        }
    },

    impressed: function() {
        return [{text:"Dang! I'm impressed! You cleaned a lot!",any:-1,conditions:{cleanliness:50}}];
    }
}