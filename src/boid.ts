 //座標を管理するためのクラス
export class Vector2{
    x: number;
    y: number;

    constructor(x, y){
        this.x = x;
        this.y = y;
    }

     //ベクトルの長さを返す
    length(x, y){
        return Math.sqrt(x * x + y * y);
    }

     //値を設定する
    set(x, y){
        if(x != null){this.x = x;}
        if(y != null){this.y = y;}
    }

    //対象の Position クラスのインスタンスとの距離を返す
    distance(target){
        let x = this.x - target.x;
        let y = this.y - target.y;
        return Math.sqrt(x * x + y * y);
    }

     //対象の Position クラスのインスタンスとの外積を計算する
    cross(target){
        return this.x * target.y - this.y * target.x;
    }

    /**
     * 自身を単位化したベクトルを計算して返す
     */
    normalize(){
        // ベクトルの大きさを計算する
        let l = Math.sqrt(this.x * this.x + this.y * this.y);
        // 大きさが 0 の場合は XY も 0 なのでそのまま返す
        if(l === 0){
            return new Vector2(0, 0);
        }
        // 自身の XY 要素を大きさで割る
        let x = this.x / l;
        let y = this.y / l;
        // 単位化されたベクトルを返す
        return new Vector2(x, y);
    }

    /**
     * 指定されたラジアン分だけ自身を回転させる
     * @param {number} radian - 回転量
     */
    rotate(radian){
        // 指定されたラジアンからサインとコサインを求める
        let s = Math.sin(radian);
        let c = Math.cos(radian);
        // 2x2 の回転行列と乗算し回転させる
        this.x = this.x * c + this.y * -s;
        this.y = this.x * s + this.y * c;
    }
}


export class Boid{
    //描画などに利用する 2D コンテキスト
    ctx: CanvasRenderingContext2D;
    //元画像のファイルに対する拡大率
    scale: number;
    // Birdインスタンスの現在の位置
    pos: Vector2;
    // 移動量(速度)
    vel: Vector2;
    // 個体を識別するid
    id: number;
    //敵のタイプ
    type: string;

    //画像サイズ幅、高さ
    width: number;
    height: number;
    //画像ファイルパス
    imgPath: string;
    //画像
    image: HTMLImageElement;

    constructor(ctx, x, y, vx, vy, id, scale, type, imgPath,){
        this.ctx = ctx;
        this.pos = new Vector2(x, y);
        this.vel = new Vector2(vx, vy);
        this.id = id;
        this.scale = scale;
        this.imgPath = imgPath;

        this.image = new Image();
        this.image.addEventListener('load', () => {
            //元画像のサイズと指定されたスケールからサイズを決定
            this.width = this.scale * this.image.naturalWidth;
            this.height = this.scale * this.image.naturalHeight;
        }, false);
        this.image.src = imgPath;
    }


    draw(){
        // キャラクターの幅やオフセットする量を加味して塗りつぶす
        this.ctx.drawImage(
            this.image,
            this.pos.x - this.width / 2,
            this.pos.y - this.height / 2,
            this.width,
            this.height
        );
    }
}
