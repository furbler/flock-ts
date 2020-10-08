import { Boid } from "./boid.js";
import { Canvas2DUtility } from "./canvas2d.js";
(function () {
    //canvasの幅
    var CANVAS_WIDTH = 600;
    //canvas の高さ
    var CANVAS_HEIGHT = 400;
    //群れの個体数
    var FLOCK_NUM = 10;
    //Canvas2D API をラップしたユーティリティクラス
    var util = null;
    //描画対象となる Canvas Element
    var canvas = null;
    //Canvas2D API のコンテキスト
    var ctx = null;
    //アニメーションの
    var mainRequestID = null;
    //群れの個体を格納
    var boids = [];
    var param = {
        cohesion_coef: 20,
        separation_coef: 40,
        alignment_coef: 10,
        separation_thres: 40,
        speed_limit: 5,
    };
    //ページのロードが完了したときに発火する load イベント
    window.addEventListener('load', function () {
        // ユーティリティクラスを初期化
        util = new Canvas2DUtility(document.body.querySelector('#main_canvas'));
        // ユーティリティクラスから canvas を取得
        canvas = util.canvas;
        // ユーティリティクラスから 2d コンテキストを取得
        ctx = util.context;
        // canvas の大きさを設定
        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;
        // 初期化処理を行う
        initialize();
        // 描画処理を開始する
        animation();
    }, false);
    function initialize() {
        //画像拡大時のぼやけを防止するため、アンチエイリアスなどを切る
        ctx.imageSmoothingEnabled = false;
        //群れの個体を生成
        for (var i = 0; i < FLOCK_NUM; ++i) {
            //適当に配置
            var angle = i * 2 * Math.PI / FLOCK_NUM;
            var rad = 200; //半径
            boids[i * 2] = new Boid(ctx, rad * Math.cos(angle) + canvas.width / 2, rad * Math.sin(angle) + canvas.height / 2, 2, -2, i * 2, param, 1, 'nooob', '../image/octopus_open.png');
            rad = 80; //半径
            boids[i * 2 + 1] = new Boid(ctx, rad * Math.cos(angle) + canvas.width / 2, rad * Math.sin(angle) + canvas.height / 2, 2, -2, i * 2 + 1, param, 1, 'nooob', '../image/squid_open.png');
        }
        console.log('画像の読み込み完了。');
        //ボタンと関数を関連付ける
        document.getElementById("apply").addEventListener("click", getValue, false);
        document.getElementById("reset").addEventListener("click", clear, false);
        //テキストボックスの値を初期化
        clear();
    }
    //描画
    function animation() {
        // グローバルなアルファを必ず 1.0 で描画処理を開始する
        ctx.globalAlpha = 1.0;
        // 描画前に画面全体を暗いネイビーで塗りつぶす
        util.drawRect(0, 0, canvas.width, canvas.height, '#000000');
        //速度変化量を計算する
        boids.map(function (boid) {
            boid.update_calc(boids);
        });
        //実際に位置を更新して描画
        boids.map(function (boid) {
            boid.update_actual();
            boid.rotationDraw();
        });
        // 恒常ループのために描画処理を再帰呼出しする
        mainRequestID = requestAnimationFrame(animation);
    }
    //テキストボックスの文字を取得する
    function getValue() {
        var coh = document.getElementById("cohesion");
        var sep = document.getElementById("separation");
        var alig = document.getElementById("alignment");
        var thres = document.getElementById("separation_thres");
        var limit = document.getElementById("speed_limit");
        boids.map(function (boid) {
            boid.cohesion_coef = parseFloat(coh.value); //群れの中心に向かう度合
            boid.separation_coef = parseFloat(sep.value); //仲間を避ける度合
            boid.alignment_coef = parseFloat(alig.value); //群れの平均速度に合わせる度合
            boid.separation_thres = parseFloat(thres.value); //分離ルールの適用距離
            boid.speed_limit = parseFloat(limit.value); //制限速度
        });
        console.log("以下のパラメータを更新しました。");
        console.log("cohesion_coef = %s,", coh.value);
        console.log("separation_coef = %s", sep.value); //仲間を避ける度合
        console.log("alignment_coef = %s", alig.value); //群れの平均速度に合わせる度合
        console.log("separation_thres = %s", thres.value); //分離ルールの適用距離
        console.log("speed_limit = %s", limit.value); //制限速度
        console.log("\n");
    }
    //テキストボックスの文字を初期化
    function clear() {
        document.getElementById("cohesion").value = String(param.cohesion_coef);
        document.getElementById("separation").value = String(param.separation_coef);
        document.getElementById("alignment").value = String(param.alignment_coef);
        document.getElementById("separation_thres").value = String(param.separation_thres);
        document.getElementById("speed_limit").value = String(param.speed_limit);
    }
})();
