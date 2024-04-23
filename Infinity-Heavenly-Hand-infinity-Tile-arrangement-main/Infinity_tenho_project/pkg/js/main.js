var app = new Vue({
    el: '#app',
    data: {
        yamahai: [],
        kawa: [],
        tehai: [],
        agari: false,
        gameStarted: false, // 追加: ゲームが開始されたかどうかを管理する変数
        gameInterval: null // 追加: setInterval の ID を格納する変数
    },
    methods: {
        startGame: function(){
            this.gameStarted = true;
            //実行回数
            count = 0;

            this.gameInterval = setInterval(() => {

                count += 1;
                document.getElementById("count").innerHTML = count;

                // テーブルの初期化（tehaiをクリア）
                this.tehai = [];

                // 山牌作成
                this.yamahai = createYamahai();

                // 配牌作成（山牌から14牌取得する）
                for (let i = 0; i < 14; i++) {
                    this.tehai.push(this.yamahai.shift());
                }
                
                // あがり判定
                this.agari = judge(this.tehai);

                // あがり判定がtrueならゲーム中断
                if (this.agari) {
                    this.cancelGame();
                }
            }, 0); //for文繰り返す
        },
        cancelGame: function(){
            
            if(this.agari == true){
                const audio = new Audio("pekaaaaa.mp3");
                audio.play();
            }

            this.gameStarted = false;
            count = 0;

            // インターバルをクリア
            clearInterval(this.gameInterval);
        },


        rihai: function(){
                // 理牌
                this.tehai.sort(sortHai);
        },

        start1Game: function(){

                
                count += 1;
                document.getElementById("count").innerHTML = count;

                // テーブルの初期化（tehaiをクリア）
                this.tehai = [];

                // 山牌作成
                this.yamahai = createYamahai();

                // 配牌作成（山牌から14牌取得する）
                for (let i = 0; i < 14; i++) {
                    this.tehai.push(this.yamahai.shift());
                }
                
                // あがり判定
                this.agari = judge(this.tehai);
        },
    }
});
