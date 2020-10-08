import {Vector2, Boid} from "./boid"
import {Canvas2DUtility} from "./canvas2d"

(() => {
    //canvasの幅
    const CANVAS_WIDTH = 600;
    //canvas の高さ
    const CANVAS_HEIGHT = 400;
    //群れの個体数
    const FLOCK_NUM = 11;


    //Canvas2D API をラップしたユーティリティクラス
    let util: Canvas2DUtility = null;
    //描画対象となる Canvas Element
    let canvas: HTMLCanvasElement = null;
    //Canvas2D API のコンテキスト
    let ctx: CanvasRenderingContext2D = null;

    //アニメーションの
    let mainRequestID: number = null;

    //群れの個体を格納
    let boids: Array<Boid> = [];

    let param: Parameter = {
        cohesion_coef: 30, //群れの中心に向かう度合
        separation_coef: 30, //仲間を避ける度合
        alignment_coef: 20, //群れの平均速度に合わせる度合
        separation_thres: 100, //分離ルールの距離の閾値
        speed_limit: 4, //個体の制限速度
    };


    //ページのロードが完了したときに発火する load イベント
    window.addEventListener('load', () => {
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

    function initialize(){
        //画像拡大時のぼやけを防止するため、アンチエイリアスなどを切る
        ctx.imageSmoothingEnabled = false;
        //群れの個体を生成
        for(let i = 0; i < FLOCK_NUM; ++i){
            //適当に配置
            let angle = i * Math.PI / 6;
            let rad = 70;
            boids[i] = new Boid(ctx, rad * Math.cos(angle) + canvas.width / 2, rad * Math.sin(angle) + canvas.height / 2, 2, -2, i, param, 1.3, 'nooob', '../image/octopus_open.png');
        }
        console.log('画像の読み込み完了。');

        //ボタンと関数を関連付ける
        document.getElementById("apply").addEventListener ("click", getValue, false);
        document.getElementById("reset").addEventListener ("click", clear, false);
        //テキストボックスの値を初期化
        clear();
    }

    //描画
    function animation(){
        // グローバルなアルファを必ず 1.0 で描画処理を開始する
        ctx.globalAlpha = 1.0;
        // 描画前に画面全体を暗いネイビーで塗りつぶす
        util.drawRect(0, 0, canvas.width, canvas.height, '#000000');
        //速度変化量を計算する
        boids.map((boid) => {
            boid.update_calc(boids);
        });
        //実際に位置を更新して描画
        boids.map((boid) => {
            boid.update_actual();
            boid.rotationDraw();
        });

        // 恒常ループのために描画処理を再帰呼出しする
        mainRequestID = requestAnimationFrame(animation);
    }

    //テキストボックスの文字を取得する
    function getValue(){
        let coh: HTMLInputElement = <HTMLInputElement>document.getElementById("cohesion");
        let sep: HTMLInputElement = <HTMLInputElement>document.getElementById("separation");
        let alig: HTMLInputElement = <HTMLInputElement>document.getElementById("alignment");
        let thres: HTMLInputElement = <HTMLInputElement>document.getElementById("separation_thres");
        let limit: HTMLInputElement = <HTMLInputElement>document.getElementById("speed_limit");

        boids.map((boid) => {
            boid.cohesion_coef = parseFloat(coh.value); //群れの中心に向かう度合
            boid.separation_coef = parseFloat(sep.value); //仲間を避ける度合
            boid.alignment_coef = parseFloat(alig.value); //群れの平均速度に合わせる度合
            boid.separation_thres = parseFloat(thres.value); //分離ルールの適用距離
            boid.speed_limit = parseFloat(limit.value); //制限速度
        });

        console.log("以下のパラメータを更新しました。")
        console.log("cohesion_coef = %s,", coh.value);
        console.log("separation_coef = %s", sep.value); //仲間を避ける度合
    console.log("alignment_coef = %s", alig.value); //群れの平均速度に合わせる度合
    console.log("separation_thres = %s", thres.value); //分離ルールの適用距離
    console.log("speed_limit = %s", limit.value); //制限速度
    console.log("\n");
    }

    //テキストボックスの文字を初期化
    function clear(){
        (<HTMLInputElement>document.getElementById("cohesion")).value = String(param.cohesion_coef);
        (<HTMLInputElement>document.getElementById("separation")).value = String(param.separation_coef);
        (<HTMLInputElement>document.getElementById("alignment")).value = String(param.alignment_coef);

        (<HTMLInputElement>document.getElementById("separation_thres")).value = String(param.separation_thres);
        (<HTMLInputElement>document.getElementById("speed_limit")).value = String(param.speed_limit);
    }

})();
