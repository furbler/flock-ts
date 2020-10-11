import {Canvas2DUtility} from "./canvas2d"

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

    //指定された角度(radian単位)分だけ自身のベクトルを回転させる
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
    //最大(制限)速度
    speed_limit: number;
    //視界範囲
    sight_range: number;

    //描画などに利用する 2D コンテキスト
    ctx: CanvasRenderingContext2D;
    //元画像のファイルに対する拡大率
    scale: number;
    // Birdインスタンスの現在の位置
    pos: Vector2;
    // 移動量(速度)
    vel: Vector2;
    //向いている角度(進行方向)
    //x軸方向を0radとする(tan関数などに合わせるため)
    angle: number;
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

    //画像表示サイズ幅、高さ
    width: number;
    height: number;
    //画像ファイルパス
    imgPath: string;
    //画像
    image: HTMLImageElement;

    constructor(ctx, x, y, vx, vy, id, param: Parameter, scale, type, imgPath){
        this.cohesion_coef = param.cohesion_coef; //群れの中心に向かう度合
        this.separation_coef = param.separation_coef; //仲間を避ける度合
        this.alignment_coef = param.alignment_coef; //群れの平均速度に合わせる度合
        this.separation_thres = param.separation_thres; //分離ルールの適用距離
        this.speed_limit = param.speed_limit; //制限速度
        this.sight_range = param.sight_range; //視界距離

        this.ctx = ctx;
        this.pos = new Vector2(x, y);
        this.pos = new Vector2(x, y);
        this.vel = new Vector2(vx, vy);
        //進行方向を向く
        this.angle = Math.atan2(vy, vx);
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
    update_calc(boids: Array<Boid>, obstacles: Array<Obstacle>){
        this.f_cohesion(boids);
        this.f_separation(boids, obstacles);
        this.f_alignment(boids);
    }
    //実際に各個体の状態を更新する
    update_actual(){

        let accx = this.cohesion_coef * this.cohesion.x + this.separation_coef * this.separation.x + this.alignment_coef * this.alignment.x;
        let accy = this.cohesion_coef * this.cohesion.y + this.separation_coef * this.separation.y + this.alignment_coef * this.alignment.y;

        this.vel.x += this.cohesion_coef * this.cohesion.x + this.separation_coef * this.separation.x + this.alignment_coef * this.alignment.x;
        this.vel.y += this.cohesion_coef * this.cohesion.y + this.separation_coef * this.separation.y + this.alignment_coef * this.alignment.y;

        //制限速度を超えた場合
        let speed = this.vel.length();
        if(speed > this.speed_limit){
            //減速させる
            //減速しないと群れ全体が引っ張られて加速して飛び出してしまう
            this.vel.x = this.vel.x / speed * this.speed_limit;
            this.vel.y = this.vel.y / speed * this.speed_limit;
        }
        this.pos.set(this.pos.x + this.vel.x, this.pos.y + this.vel.y);
        //進行方向を向く
        this.angle = Math.atan2(this.vel.y, this.vel.x);

        //壁との衝突判定
        this.CollideWall();
    }

    //結合ルール
    f_cohesion(boids: Array<Boid>){
        //群れの座標値の合計を求める
        let tmpX = 0, tmpY = 0;
        //視界内の個体数
        let sight_boids_num = 0
        for(let i = 0; i < boids.length; ++i){
            //自身は除く
            if(this.id === i) continue;
            //自身の視界内にいる場合
            if(this.pos.distance(boids[i].pos) < this.sight_range) {
                tmpX += boids[i].pos.x;
                tmpY += boids[i].pos.y;
                ++sight_boids_num;
            }
        }
        //重心の計算(自身は含めない)
        if(sight_boids_num !== 0){
            tmpX /= sight_boids_num;
            tmpY /= sight_boids_num;
        }

        //重心へ向かう速度変化量
        let coef = 0.0001;
        //群れから孤立した場合
        if(sight_boids_num === 0) {
            this.cohesion.x = 0;
            this.cohesion.y = 0;
        }else{
            this.cohesion.x = (tmpX - this.pos.x) * coef;
            this.cohesion.y = (tmpY - this.pos.y) * coef;
        }
    }

    //分離ルール
    f_separation(boids: Array<Boid>, obstacles: Array<Obstacle>){
        let vel_x = 0, vel_y = 0;
        for(let i = 0; i < boids.length; ++i){
            //自身は除く
            if(this.id === i) continue;
            //自身と他の個体との距離
            let dist = this.pos.distance(boids[i].pos);
            //0除算防止用
            if(dist === 0) dist = 1;
            //一定距離以下まで近づいた場合
            if(dist < this.separation_thres){
                //離れる方向に加速(距離が近づくほど早く離れる)
                vel_x += (this.pos.x - boids[i].pos.x) / dist;
                vel_y += (this.pos.y - boids[i].pos.y) / dist;
            }
        }
        //障害物に対して分離ルール適用
        for(let i = 0; i < obstacles.length; ++i){
            //自身と障害物の外周までの距離（円形として考える）
            let dist_obs = this.pos.distance(obstacles[i].pos) - obstacles[i].width;
            //0除算防止用
            if(dist_obs === 0) dist_obs = 1;
            //障害物との距離が基準以下の場合
            if(dist_obs < this.separation_thres){
                //障害物の中に入り込んでいた場合
                if(dist_obs < 0){
                    //外側に出る力を強める
                    dist_obs *= -0.5;
                }
                vel_x += (this.pos.x - obstacles[i].pos.x) / dist_obs;
                vel_y += (this.pos.y - obstacles[i].pos.y) / dist_obs;
            }
        }

        //壁に対しても分離ルールを適用
        let w_width = this.ctx.canvas.width;
        let w_height = this.ctx.canvas.height;
        //各壁との距離
        let left = this.pos.x;
        let right = w_width - this.pos.x;
        let roof = this.pos.y;
        let floor = w_height - this.pos.y;

        //一定距離以下まで近づいた場合
        if(left < this.separation_thres){
            //離れる方向に加速
            if(left !== 0)vel_x += 1 / left;
        }
        if(right < this.separation_thres){
            //離れる方向に加速
            if(right !== 0)vel_x -= 1 / right;
        }
        //一定距離以下まで近づいた場合
        if(roof < this.separation_thres){
            //離れる方向に加速
            if(roof !== 0)vel_y += 1 / roof;
        }
        if(floor < this.separation_thres){
            //離れる方向に加速
            if(floor !== 0)vel_y -= 1 / floor;
        }

        let coef = 0.01;
        this.separation.x = vel_x * coef;
        this.separation.y = vel_y * coef;
    }

    //整列ルール
    f_alignment(boids: Array<Boid>){
        let tmp_x = 0, tmp_y = 0;

        //視界内の個体数
        let sight_boids_num = 0

        for(let i = 0; i < boids.length; ++i){
            //自身は除く
            if(this.id === i) continue;
            //自身の視界内にいる場合
            if(this.pos.distance(boids[i].pos) < this.sight_range) {
                tmp_x += boids[i].vel.x;
                tmp_y += boids[i].vel.y;
                ++sight_boids_num;
            }
        }
        //群れの速度の平均
        if(sight_boids_num !== 0) {
            tmp_x /= sight_boids_num;
            tmp_y /= sight_boids_num;
        }

        let coef = 0.0001;
        //群れから孤立した場合
        if(sight_boids_num === 0) {
            this.alignment.x = 0;
            this.alignment.y = 0;
        }else{
            this.alignment.x = (tmp_x - this.vel.x) * coef;
            this.alignment.y = (tmp_y - this.vel.y) * coef;
        }
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
        else if(this.pos.y - this.height / 2 < 0){
            this.pos.y = this.height / 2;
            this.vel.y *= -1;
        }
        else if(this.pos.y + this.height / 2 > this.ctx.canvas.height){
            this.pos.y = this.ctx.canvas.height - this.height / 2;
            this.vel.y *= -1;
        }
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

    //自身の回転量を元に座標系を回転させる
    rotationDraw(){
        // 座標系を回転する前の状態を保存する
        this.ctx.save();
        // 自身の位置が座標系の中心と重なるように平行移動する
        this.ctx.translate(this.pos.x, this.pos.y);
        // 座標系を回転させる（angleの値で0radを指定した際、x軸方向に向かせるため Math.PI * 1.5 を引いている）
        this.ctx.rotate(this.angle - Math.PI * 1.5);

        // キャラクターの幅を考慮してオフセットする量
        let offsetX = this.width / 2;
        let offsetY = this.height / 2;

        // キャラクターの幅やオフセットする量を加味して描画する
        this.ctx.drawImage(
            this.image,
            -offsetX, // 先に translate で平行移動しているのでオフセットのみ行う
            -offsetY, // 先に translate で平行移動しているのでオフセットのみ行う
            this.width,
            this.height
        );

        // 座標系を回転する前の状態に戻す
        this.ctx.restore();
    }
}
//設置する障害物
export class Obstacle{
    util: Canvas2DUtility;
    //中心座標
    pos: Vector2;
    //幅、高さ
    width: number;
    height: number;
    //色
    color: string;
    //動くフラグ
    move: boolean;

    constructor(util: Canvas2DUtility, x, y, w, h, c, move: boolean = false){
        this.util = util;
        this.pos = new Vector2(x, y);
        this.width = w;
        this.height = h;
        this.color = c;
        this.move = move;
    }

    update(mousePos: Vector2){
        if(this.move){
            this.pos.set(mousePos.x, mousePos.y);
        }
    }

    draw(){
        if(this.height < 0){
            //円を描画
            this.util.drawCircle(this.pos.x, this.pos.y, this.width, this.color);
        }else {
            //矩形を描画
            this.util.drawRect(this.pos.x - this.width / 2, this.pos.y - this.height / 2, this.width, this.height, this.color);
        }
    }
}
