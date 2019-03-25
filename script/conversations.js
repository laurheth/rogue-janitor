var ConversationBuilder = {
    idleOptions: ["is vaping.","is enjoying a relaxing drink.","is reading a book.","is having a coffee.","is eating an apple."],
    buildConvos: function(speaker) {
        var newConversation = [[{action: ROT.RNG.getItem(this.idleOptions),any:-1}]];
        newConversation.push(this.randomGeneric(speaker));

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
        speaker.lastDay = Game.day;
    },
    
    randomGeneric: function(speaker) {
        let option = Math.floor(ROT.RNG.getUniform() * 10);
//        option=5;
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
            return [{text:"Gee whiz I love dogs. And cats. Humans have good taste in critters.",any:1,conditions:{animal:false}},
                    {text:"What's your favourite type of critter?","I love cats!":2,"Dog's are good and I like to pet them!":3,"Rabbits are great!":4,"Rats are my favourite!":5,"I love horses. Neigh!":6,"I'm not really an animal person...":7},
                    {text:"Wow! Cats! Me too!",any:-1,globalTags:{animal:'cat'}},
                    {text:"Wow! Dogs! Me too!",any:-1,globalTags:{animal:'dog'}},
                    {text:"Wow! Rabbits! Me too!",any:-1,globalTags:{animal:'rabbit'}},
                    {text:"Wow! Rats! Me too!",any:-1,globalTags:{animal:'rat'}},
                    {text:"Wow! Horses! Me too!",any:-1,globalTags:{animal:'horse'}},
                    {text:"That's legit! More for me to cuddle myself, then!",any:-1,globalTags:{animal:'none'}},
                    ];
            case 6:
            return [{text:"I really appreciate the work you do! This place literally wouldn't run without you.",any:-1}];
            case 7:
            return [{text:"Golly I could go for a hot cup of coffee right about now.",any:-1}];
            case 8:
            let other;
            if ('wantsCareer' in speaker.convoTags) {
                other=speaker.convoTags.wantsCareer;
            }
            else {
                let otheropts=["chef","web developer","game developer","actor","dancer","musician","doctor","vet","nurse","lawyer","paralegal"];
                other=ROT.RNG.getItem(otheropts);
            }
            return [{text:"Being a dungeon monster is fun but I'd love to be a "+other+" someday.",any:-1,tags:{wantsCareer:other}}];
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
    },

    cleanConvo: function(mess) {
        let owner = mess.droppedBy;
        let item=false;
        let messname=mess.name.toLowerCase();
        let messnamePlural=mess.plural().toLowerCase();
        if (mess.cleanMethod == 'get') {
            if (owner.dropMessConvo) {
                return;
            }
            else {
                item=true;
                owner.dropMessConvo=true;
            }
        }
        if ((mess.cleanMethod == 'mop')) {
            if (owner.rangeMessConvo) {
                return;
            }
            else {
                owner.rangeMessConvo=true;
            }
        }

        let startMessages;
        let endMessages;
        if (item) {
            startMessages=[
                "Oh, thanks for picking up my "+messname+"!",
                "Oops! I knew I forgot something. That "+messname+" was mine...",
                "Oh dang sorry about the "+messname+".",
                "Oof, forgot to clean up after myself. Thanks for picking up my "+messname+"!",
            ];
            endMessages=[
                "I know, I know... leaving "+messnamePlural+" lying around on the job. I'll do better tomorrow!",
            ];
        }
        else {
            startMessages=[
                "Oh yeah those "+messnamePlural+" was me. Whoops.",
                "Yeah my aim was a bit off on that one. Thanks for mopping up the "+messnamePlural+".",
                "Aaahh I got a little carried away! Thanks for cleaning the "+messnamePlural+"!",
                "Those "+messnamePlural+" were my fault! Sorry about that.",
            ];
            endMessages=[
                "The adventurer sure felt it, though :) Worth it?",
            ];
        }
        endMessages.push("I really appreciate you and the work you do!");
        endMessages.push("You're really fantastic, you know that?");
        endMessages.push("I hope you know that everybody here loves you, and loves your work.");

        var newConvo= [{text:ROT.RNG.getItem(startMessages),any:1},{text:ROT.RNG.getItem(endMessages),any:-1}];
        owner.convos.push(newConvo);
    },

    coffeeConvo: function(tags) {
        var newConvo;
        newConvo = [
            {text:"Hey! I'm running to the cafe. Want anything?","I'd love a coffee!":1,"How about some tea?":2,"Can I have a donut?":3,"No thanks":4},
            {text:"Wicked! I'll bring you some coffee when I've got it!",any:-1,tags:{food:'coffee'}},
            {text:"Sweet! I'll bring you some tea when I've got it!",any:-1,tags:{food:'tea'}},
            {text:"Awesome! I'll bring you back a donut when I've got it!",any:-1,tags:{food:'donut'}},
            {text:"Okie doke!",any:-1},
        ];
        return newConvo;
    },

    deliverConvo: function(tags) {
        let food;
        if ('food' in tags && tags.food != false) {
            food = tags.food;
        }
        else {
            return null;
        }
        var newConvo;
        newConvo = [
            {text:"Here's the "+food+" you asked for!",any:1},
            {text:"I really hope you enjoy it :)",any:-1},
        ];
        tags.food=false;
        return newConvo;
    },

    invitationConvo: function(tags) {
        var newConvo;
        newConvo = [
            {text:"Hey! You've done so much cleaning, holy cow!",any:1},
            {text:"Listen, a bunch of us like to get together for dinner after work. Wanna come tonight?",y:2,n:4},
            {text:"Radical! We'll leave together when you're ready to call it a day!",any:3,globalTags:{invitationAccepted:true}},
            {text:"Remember, it doesn't need to be spotless! Your health and happiness are way more important than work; call it a day on your own terms!",any:-1},
            {text:"That's alright :) We go out every day, so you're welcome during any of them!",any:3},
        ];
        return newConvo;
    },

    exitPrompt: function() {
        var nextConvo=[];
        let messages;
        if ('invitationAccepted' in Game.convoTags) {
            messages=[
                "Leave for the day and head out with everyone to dinner?",
                "You and your comrades leave together for dinner.",
                "It's really delightful!",
                "Eventually, the night comes to and end though.",
                "You go home, and get a nice, full 8 hours of sleep"
                ];
        }
        else {
            messages=[
                "Leave for the day and go home?",
                "You leave for the day, and head home.",
                "You have a really relaxing evening at home! You read a book and play some video games.",
                "Eventually, it's time to sleep. You go to bed and have a nice, full 8 hours of sleep."
            ];
        }
        if ('animal' in Game.convoTags && Game.convoTags.animal != 'none') {
            messages.push("You have a really happy dream about "+Game.convoTags.animal+"s!");
        }
        messages.push("In the morning, you wake up, and have a delicious breakfast.");
        messages.push("Time for another day of work!");
        for (let i=0;i<messages.length;i++) {
            var nextMsg = {message:messages[i]};
            if (i==0) {
                nextMsg.y=1;
                nextMsg.n=-1;
            }
            else {
                nextMsg.any=(i+1);
                if (i>1) {
                    nextMsg.blackScreenMessage=true;
                }
            }
            if (i==(messages.length-1)) {
                nextMsg.globalTags={nextDay:true};
                nextMsg.any=-1;
            }
            nextConvo.push(nextMsg);
        }
        return nextConvo;
    },

}