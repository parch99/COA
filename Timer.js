var active = false;
let counter = 0;
let coinsLeft = 10;
let overall = 10;
let coin_collect = new Audio('../../common/audio/coin_collect.mp3');
export function start_timer() {
    if( active == true ) {
        return;
    } else {
        active = true;
        var countDownDate = new Date(Date.now() + (2 * 60 * 1000));

        var x = setInterval(function() {
            var now = new Date(Date.now());
            var timeLeft = countDownDate - now;

            var minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
            var seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

            document.getElementById("timer").innerHTML = minutes + "m " + seconds + "s";

            if (timeLeft < 0) {
                clearInterval(x);
                document.getElementById("timer").innerHTML = "ČAS JE POTEKEL";
                location.href = 'loss.html';
            }
        }, 1000);
    }
}

export function count() {
    if(counter++ == overall) {
        document.getElementById("text").innerHTML = "Cas da zapustis hlev!";
    }
    document.getElementById("counter").innerHTML = counter;
    coinsLeft--;
    document.getElementById("coins").innerHTML = coinsLeft;
    coin_collect.volume = 0.75;
    coin_collect.play();
    
}

export function check() {
    counter == overall ? location.href = 'win.html' : location.href = 'loss.html';
}