import { Vector2, Boid, Obstacle } from "./boid.js";
import { Canvas2DUtility } from "./canvas2d.js";
(function () {
    //canvasの幅の初期値
    var CANVAS_WIDTH = 600;
    //canvas の高さの初期値
    var CANVAS_HEIGHT = 400;
    //群れの個体数の初期値/2
    var FLOCK_NUM = 6;
    //障害物の初期配置数
    var OBSTACLE_NUM = 1;
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
    //障害物を格納
    var obstacles = [];
    //マウスのcanvas上の座標
    var mousePos;
    //パラメータの初期化
    var param = {
        cohesion_coef: 20,
        separation_coef: 40,
        alignment_coef: 10,
        separation_thres: 40,
        speed_limit: 5,
        sight_range: 100,
        cursor_radius: 30,
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
        //障害物を設置
        for (var i = 0; i < OBSTACLE_NUM; ++i) {
            obstacles[i] = new Obstacle(util, canvas.width * 0.3, canvas.height * 0.4, 60, 60, '#cccc00');
        }
        //群れの個体を生成
        for (var i = 0; i < FLOCK_NUM; ++i) {
            //適当に配置
            var angle = i * 2 * Math.PI / FLOCK_NUM;
            var rad = canvas.height / 3; //半径
            //配置予定座標
            var new_boid_pos = new Vector2(rad * Math.cos(angle) + canvas.width / 2, rad * Math.sin(angle) + canvas.height / 2);
            for (var j = 0; j < obstacles.length; ++j) {
                var dist = new_boid_pos.distance(obstacles[j].pos) - obstacles[j].width;
                //配置予定場所が障害物または壁と近すぎる場合、中心よりに配置を変更
                if (dist < 10 || new_boid_pos.x < 10 || new_boid_pos.x > canvas.width - 10
                    || new_boid_pos.y < 10 || new_boid_pos.y > canvas.height - 10) {
                    console.log("配置変更前の座標 = (%f, %f)", new_boid_pos.x, new_boid_pos.y);
                    new_boid_pos.x = rad * 0.3 * Math.cos(angle) + canvas.width / 2;
                    new_boid_pos.y = rad * 0.3 * Math.sin(angle) + canvas.height / 2;
                }
            }
            boids[i * 2] = new Boid(ctx, new_boid_pos.x, new_boid_pos.y, 2, -2, i * 2, param, 1, 'nooob', '../image/octopus_open.png');
            rad = canvas.height / 5; //半径
            //配置予定座標
            new_boid_pos.set(rad * Math.cos(angle) + canvas.width / 2, rad * Math.sin(angle) + canvas.height / 2);
            for (var j = 0; j < obstacles.length; ++j) {
                var dist = new_boid_pos.distance(obstacles[j].pos) - obstacles[j].width;
                //配置予定場所が障害物または壁と近すぎる場合、中心よりに配置を変更
                if (dist < 10 || new_boid_pos.x < 10 || new_boid_pos.x > canvas.width - 10
                    || new_boid_pos.y < 10 || new_boid_pos.y > canvas.height - 10) {
                    new_boid_pos.x = rad * 0.3 * Math.cos(angle) + canvas.width / 2;
                    new_boid_pos.y = rad * 0.3 * Math.sin(angle) + canvas.height / 2;
                }
            }
            boids[i * 2 + 1] = new Boid(ctx, new_boid_pos.x, new_boid_pos.y, 2, -2, i * 2 + 1, param, 1, 'nooob', '../image/squid_open.png');
        }
        console.log('画像の読み込み完了。');
        //ボタンと関数を関連付ける
        document.getElementById("change_size").addEventListener("click", changeCanvasSize, false);
        document.getElementById("apply").addEventListener("click", getValue, false);
        document.getElementById("reset").addEventListener("click", reset, false);
        document.getElementById("add_boid_apply").addEventListener("click", add_boid, false);
        //画面サイズ表記を初期化
        document.getElementById("canvas_width").value = String(CANVAS_WIDTH);
        document.getElementById("canvas_height").value = String(CANVAS_HEIGHT);
        //テキストボックスの値を初期化
        reset();
        //初期化しておく
        mousePos = new Vector2(param.cursor_radius, param.cursor_radius);
        //マウスの要素上の座標を取得
        canvas.addEventListener('mousemove', function (event) {
            mousePos.set(event.offsetX, event.offsetY);
        }, false);
        //マウスで動かす円形障害物を設置
        obstacles[OBSTACLE_NUM] = new Obstacle(util, mousePos.x, mousePos.y, param.cursor_radius, -1, '#00cccc', true);
    }
    //描画
    function animation() {
        // グローバルなアルファを必ず 1.0 で描画処理を開始する
        ctx.globalAlpha = 1.0;
        // 描画前に画面全体を暗いネイビーで塗りつぶす
        util.drawRect(0, 0, canvas.width, canvas.height, '#000000');
        //速度変化量を計算する
        boids.map(function (boid) {
            boid.update_calc(boids, obstacles);
        });
        //障害物を描画
        obstacles.map(function (obstacle) {
            obstacle.update(mousePos);
            obstacle.draw();
        });
        //実際に位置を更新して描画
        boids.map(function (boid) {
            boid.update_actual();
            boid.rotationDraw();
        });
        // 恒常ループのために描画処理を再帰呼出しする
        mainRequestID = requestAnimationFrame(animation);
    }
    //画面(canvas要素)のサイズを変更する
    function changeCanvasSize() {
        var s_width = document.getElementById("canvas_width");
        var s_height = document.getElementById("canvas_height");
        var width = parseFloat(s_width.value);
        var height = parseFloat(s_height.value);
        //指定サイズが現在のサイズと異なっていた場合
        if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;
            console.log("画面サイズを幅%d, 高さ%dに変更しました。", width, height);
        }
        else {
            console.log("画面サイズに変更ありません。");
        }
    }
    //テキストボックスの値を取得する
    function getValue() {
        var coh = document.getElementById("cohesion");
        var sep = document.getElementById("separation");
        var alig = document.getElementById("alignment");
        var thres = document.getElementById("separation_thres");
        var limit = document.getElementById("speed_limit");
        var sight = document.getElementById("sight_range");
        var cursor = document.getElementById("cursor_radius");
        //各個体の持つ情報を更新する
        boids.map(function (boid) {
            boid.cohesion_coef = parseFloat(coh.value); //群れの中心に向かう度合
            boid.separation_coef = parseFloat(sep.value); //仲間を避ける度合
            boid.alignment_coef = parseFloat(alig.value); //群れの平均速度に合わせる度合
            boid.separation_thres = parseFloat(thres.value); //分離ルールの適用距離
            boid.speed_limit = parseFloat(limit.value); //制限速度
            boid.sight_range = parseFloat(sight.value); //視界距離
        });
        obstacles[OBSTACLE_NUM].width = parseFloat(cursor.value); //カーソルの大きさ
        console.log("以下のパラメータを更新しました。");
        console.log("cohesion_coef = %s,", coh.value);
        console.log("separation_coef = %s", sep.value); //仲間を避ける度合
        console.log("alignment_coef = %s", alig.value); //群れの平均速度に合わせる度合
        console.log("separation_thres = %s", thres.value); //分離ルールの適用距離
        console.log("speed_limit = %s", limit.value); //制限速度
        console.log("sight_range = %s", sight.value); //視界距離
        console.log("cursor_radius = %s", cursor.value); //視界距離
        console.log("\n");
    }
    //テキストボックスの文字を初期化
    function reset() {
        document.getElementById("cohesion").value = String(param.cohesion_coef);
        document.getElementById("separation").value = String(param.separation_coef);
        document.getElementById("alignment").value = String(param.alignment_coef);
        document.getElementById("separation_thres").value = String(param.separation_thres);
        document.getElementById("speed_limit").value = String(param.speed_limit);
        document.getElementById("sight_range").value = String(param.sight_range);
        document.getElementById("cursor_radius").value = String(param.cursor_radius);
        document.getElementById("add_boid").value = "0";
    }
    //個体を追加する
    function add_boid() {
        var s_add_num = document.getElementById("add_boid");
        var add_num = parseFloat(s_add_num.value);
        var boids_length = boids.length;
        //0だったら終了
        if (add_num <= 0) {
            return;
        }
        ;
        //console.log("angle = %f",  (2 * Math.PI / add_num) * 180 / Math.PI);
        //群れの個体を生成
        for (var i = 0; i < add_num; ++i) {
            var boid_type = void 0;
            if ((i % 2) === 0) {
                boid_type = '../image/octopus_open.png';
            }
            else {
                boid_type = '../image/squid_open.png';
            }
            //適当に配置
            var angle = i * 2 * Math.PI / add_num;
            //半径。キャンバスサイズに対しある程度小さくしないと(画面端ぎりぎりに配置されると)バグる
            var rad = canvas.height / 3; //半径
            //配置予定座標
            var new_boid_pos = new Vector2(rad * Math.cos(angle) + canvas.width / 2, rad * Math.sin(angle) + canvas.height / 2);
            for (var j = 0; j < obstacles.length; ++j) {
                var dist = new_boid_pos.distance(obstacles[j].pos) - obstacles[j].width;
                //配置予定場所が障害物または壁と近すぎる場合、中心よりに配置を変更
                if (dist < 10 || new_boid_pos.x < 10 || new_boid_pos.x > canvas.width - 10
                    || new_boid_pos.y < 10 || new_boid_pos.y > canvas.height - 10) {
                    new_boid_pos.x = rad * 0.3 * Math.cos(angle) + canvas.width / 2;
                    new_boid_pos.y = rad * 0.3 * Math.sin(angle) + canvas.height / 2;
                }
            }
            //配置
            boids[boids_length + i] = new Boid(ctx, new_boid_pos.x, new_boid_pos.y, 2, -2, boids_length + i, param, 1, 'nooob', boid_type);
        }
        console.log('%d個体の追加完了。総数は%d', add_num, boids.length);
    }
})();
