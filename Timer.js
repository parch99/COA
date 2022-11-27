var active = false;
let counter = 0;
let coinsLeft = 10;
let overall = 10;
let coin_collect = new Audio('../../common/audio/coin_collect.mp3');
let delay = true;
export function start_timer() {
    if(active == true) {
        return;
    } else {
        active = true;
        let countDownDate = new Date(Date.now() + (2.5 * 60 * 1000));

        let interval = setInterval(function() {
            let now = new Date(Date.now());
            let timeLeft = countDownDate - now;
            let minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
            let seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
            document.getElementById("timer").innerHTML = minutes + ":" + ((seconds <= 9) ? "0" + seconds : seconds);

            if(minutes == 0 && seconds <= 59){
                document.getElementById("timer").style.color = "red";
            }
            if (timeLeft < 0) {
                clearInterval(interval);
                document.getElementById("timer").innerHTML = "Time's up";
                location.href = 'loss.html';
            }
        }, 1000);
    }
}

export function count() {
    if(counter++ == overall)
        document.getElementById("text").innerHTML = "Time to escape";
    document.getElementById("counter").innerHTML = counter;
    coinsLeft--;
    document.getElementById("coins").innerHTML = coinsLeft;
    coin_collect.volume = 0.7;
    coin_collect.play();
    
    //if(counter == 10)
        //document.getElementById("text").innerHTML = "You can bribe the officer now";
    
}

export function giveCoins(){
    counter = 0;
    document.getElementById("counter").innerHTML = counter;
    delay = false;
}

export function check() {
    if(counter >= 10) {
        return true;
    }else if(delay){
        let x = Math.floor(Math.random()*2);
        if(x == 0 && counter < 5 && counter != 0){
            document.getElementById("warn").innerHTML = '<span class="fs40">' + counter +'? Ha I am not that cheap!</span>';
        } else if(x == 1 && counter < 5){
            document.getElementById("warn").innerHTML = '<span class="fs40">Get out of here!</span>';
        } else if (counter >= 8){
            document.getElementById("warn").innerHTML = '<span class="fs40">No discounts sc#m</span>';
        } else {
            document.getElementById("warn").innerHTML = '<span class="fs40">I will arest you!</span>';
        }
        delay = false;
        setTimeout(function() {
            document.getElementById("warn").innerHTML = "";
            delay = true;
        }, 3000);
        return false;
    }
}