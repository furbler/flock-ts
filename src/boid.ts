 //座標を管理するためのクラス
export class Vector2{
    x: number;
    y: number;

    constructor(x, y){
        this.x = x;
        this.y = y;
    }

     //ベクトルの長さを返す
    length(){
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

     //値を設定する
    set(x, y){
        if(x != null){this.x = x;}
        if(y != null){this.y = y;}
    }

    //対象のVector2クラスのインスタンスとの距離を返す
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
    cohesion_coef: number; // パラメータ：群れの中心に向かう度合
    separation_coef: number; // パラメータ：仲間を避ける度合
    alignment_coef: number; // パラメータ：群れの平均速度に合わせる度合
    //分離ルールで使う閾値
    separation_thres: number;

    //描画などに利用する 2D コンテキスト
    ctx: CanvasRenderingContext2D;
    //元画像のファイルに対する拡大率
    scale: number;
    // Birdインスタンスの現在の位置
    pos: Vector2;
    // 移動量(速度)
    vel: Vector2;
    //結合ルールによる速度変化量
    cohesion: Vector2;
    //分離ルールによる速度変化量
    separation: Vector2;
    //整列ルールによる速度変化量
    alignment: Vector2;

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
        this.cohesion_coef = 0.003; //群れの中心に向かう度合
        this.separation_coef = 0.3; //仲間を避ける度合
        this.alignment_coef = 0.002; //群れの平均速度に合わせる度合
        this.separation_thres = 100;

        this.ctx = ctx;
        this.pos = new Vector2(x, y);
        this.pos = new Vector2(x, y);
        this.vel = new Vector2(vx, vy);
        this.cohesion = new Vector2(0, 0);
        this.separation = new Vector2(0, 0);
        this.alignment = new Vector2(0, 0);
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

    //群れ全体の状態から各個体の状態変化量を求める
    update_calc(boids: Array<Boid>){
        this.f_cohesion(boids);
        this.f_separation(boids);
        this.f_alignment(boids);
    }
    //実際に各個体の状態を更新する
    update_actual(){
        this.vel.x += this.cohesion_coef * this.cohesion.x + this.separation_coef * this.separation.x + this.alignment_coef * this.alignment.x;
        this.vel.y += this.cohesion_coef * this.cohesion.y + this.separation_coef * this.separation.y + this.alignment_coef * this.alignment.y;
        let speed = this.vel.length();
        let limit = 4;
        if(speed > limit){
            this.vel.x = this.vel.x / speed * limit;
            this.vel.y = this.vel.y / speed * limit;
        }
        this.pos.set(this.pos.x + this.vel.x, this.pos.y + this.vel.y);

        //壁との衝突判定
        this.CollideWall();
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

    //結合ルール
    f_cohesion(boids: Array<Boid>){
        //群れの座標値の合計を求める
        let tmpX = 0, tmpY = 0;
        for(let i = 0; i < boids.length; ++i){
            //自身は除く
            if(this.id === i) continue;
            tmpX += boids[i].pos.x;
            tmpY += boids[i].pos.y;
        }
        //重心の計算(自身は含めない)
        tmpX /= (boids.length - 1);
        tmpY /= (boids.length - 1)
        //重心へ向かう速度変化量
        this.cohesion.x = tmpX - this.pos.x;
        this.cohesion.y = tmpY - this.pos.y;
    }

    //分離ルール
    f_separation(boids: Array<Boid>){
        let vel_x = 0, vel_y = 0;
        for(let i = 0; i < boids.length; ++i){
            //自身は除く
            if(this.id === i) continue;
            //自身と他の個体との距離
            let dist = this.pos.distance(boids[i].pos);
            //一定距離以下まで近づいた場合
            if(dist < this.separation_thres){
                //離れる方向に加速(距離が近づくほど早く離れる)
                vel_x += (this.pos.x - boids[i].pos.x) / dist;
                vel_y += (this.pos.y - boids[i].pos.y) / dist;
            }
        }
        this.separation.x = vel_x;
        this.separation.y = vel_y;
    }

    //整列ルール
    f_alignment(boids: Array<Boid>){
        let tmp_x = 0, tmp_y = 0;
        for(let i = 0; i < boids.length; ++i){
            //自身は除く
            if(this.id === i) continue;
            tmp_x += boids[i].vel.x;
            tmp_y += boids[i].vel.y;
        }
        //群れの速度の平均
        tmp_x /= (boids.length - 1);
        tmp_y /= (boids.length - 1);
        this.alignment.x = tmp_x - this.vel.x;
        this.alignment.y = tmp_y - this.vel.y;
    }


    //壁との衝突判定
    CollideWall(){
        //左右の壁に衝突していた場合
        if(this.pos.x - this.width / 2 < 0){
            this.pos.x = this.width / 2;
            this.vel.x *= -1;
        }else if(this.pos.x + this.width / 2 > this.ctx.canvas.width){
            this.pos.x = this.ctx.canvas.width - this.width / 2;
            this.vel.x *= -1;
        }
        //上下の壁に衝突していた場合
        if(this.pos.y - this.height / 2 < 0){
            this.pos.y = this.height / 2;
            this.vel.y *= -1;
        }
        else if(this.pos.y + this.height / 2 > this.ctx.canvas.height){
            this.pos.y = this.ctx.canvas.height - this.height / 2;
            this.vel.y *= -1;
        }
    }
}
