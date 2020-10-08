import {Vector2, Boid} from "./boid"
import {Canvas2DUtility} from "./canvas2d"

(() => {
    //canvasの幅
    const CANVAS_WIDTH = 840;
    //canvas の高さ
    const CANVAS_HEIGHT = 700;
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
        cohesion_coef: 0.003, //群れの中心に向かう度合
        conhesion_default_string: "0.003",

        separation_coef: 0.3, //仲間を避ける度合
        separation_default_string: "0.3",

        alignment_coef: 0.002, //群れの平均速度に合わせる度合
        alignment_default_string: "0.002",

        separation_thres: 100, //分離ルールの距離の閾値
        separation_thres_default_string: "100",
        speed_limit: 4, //個体の制限速度
        speed_limit_default_string: "4"
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


        document.getElementById("apply").addEventListener ("click", getValue, false);
        document.getElementById("reset").addEventListener ("click", clear, false);
    }

    //描画
    function animation(){

        // グローバルなアルファを必ず 1.0 で描画処理を開始する
        ctx.globalAlpha = 1.0;
        // 描画前に画面全体を暗いネイビーで塗りつぶす
        util.drawRect(0, 0, canvas.width, canvas.height, '#000000');

        boids.map((boid) => {
            boid.update_calc(boids);
        });
        boids.map((boid) => {
            boid.update_actual();
            boid.draw();
        });

        // 恒常ループのために描画処理を再帰呼出しする
        mainRequestID = requestAnimationFrame(animation);
    }

    //テキストボックスの文字を取得する
    function getValue(){
        let num0: HTMLInputElement = <HTMLInputElement>document.getElementById("cohesion");
        alert("結合ルールのパラメータは" + num0.value + "です。");
        let num1: HTMLInputElement = <HTMLInputElement>document.getElementById("separation");
        alert("分離ルールのパラメータは" + num1.value + "です。");
        let num2 : HTMLInputElement = <HTMLInputElement>document.getElementById("alignment");
        alert("整列ルールのパラメータは" + num2.value + "です。");
    }

    //テキストボックスの文字を初期化
    function clear(){
        (<HTMLInputElement>document.getElementById("cohesion")).value = param.conhesion_default_string;
        (<HTMLInputElement>document.getElementById("separation")).value = param.separation_default_string;
        (<HTMLInputElement>document.getElementById("alignment")).value = param.alignment_default_string;

        (<HTMLInputElement>document.getElementById("separation_thres")).value = param.separation_thres_default_string;
        (<HTMLInputElement>document.getElementById("speed_limit")).value = param.speed_limit_default_string;
    }

})();
