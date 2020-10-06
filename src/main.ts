import {Vector2, Boid} from "./boid"
import {Canvas2DUtility} from "./canvas2d"

(() => {
    //canvasの幅
    const CANVAS_WIDTH = 640;
    //canvas の高さ
    const CANVAS_HEIGHT = 600;
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
            let angle = i * Math.PI / 6
            let rad = canvas.width / 4;
            boids[i] = new Boid(ctx, rad * Math.cos(angle) + canvas.width / 2, rad * Math.sin(angle) + canvas.height / 2, 2.3, -1.2, i, 1.3, 'nooob', '../image/octopus_open.png');
        }

        console.log('画像の読み込み完了。');
    }

    //描画
    function animation(){

        // グローバルなアルファを必ず 1.0 で描画処理を開始する
        ctx.globalAlpha = 1.0;
        // 描画前に画面全体を暗いネイビーで塗りつぶす
        util.drawRect(0, 0, canvas.width, canvas.height, '#000000');

        boids.map((boid) => {
            boid.update();
            boid.draw();
        });

        // 恒常ループのために描画処理を再帰呼出しする
        mainRequestID = requestAnimationFrame(animation);
    }

})();
