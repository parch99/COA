var active = false;
let counter = 0;
let coinsLeft = 10;
let overall = 10;
let coin_collect = new Audio('../../common/audio/coin_collect.mp3');
export function start_timer() {
    if(active == true) {
        return;
    } else {
        active = true;
        let countDownDate = new Date(Date.now() + (5 * 60 * 1000));

        let interval = setInterval(function() {
            let now = new Date(Date.now());
            let timeLeft = countDownDate - now;
            let minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
            let seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
            document.getElementById("timer").innerHTML = minutes + ":" + ((seconds <= 9) ? "0" + seconds : seconds);

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
    if(counter == 10)
        document.getElementById("text").innerHTML = "Bribe the officer!";
    
}

export function check() {
    counter == 10 ? location.href = 'win.html' : location.href = 'loss.html';
}