//座標を管理するためのクラス
var Vector2 = /** @class */ (function () {
    function Vector2(x, y) {
        this.x = x;
        this.y = y;
    }
    //ベクトルの長さを返す
    Vector2.prototype.length = function () {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    };
    //値を設定する
    Vector2.prototype.set = function (x, y) {
        if (x != null) {
            this.x = x;
        }
        if (y != null) {
            this.y = y;
        }
    };
    //対象のVector2クラスのインスタンスとの距離を返す
    Vector2.prototype.distance = function (target) {
        var x = this.x - target.x;
        var y = this.y - target.y;
        return Math.sqrt(x * x + y * y);
    };
    //対象の Position クラスのインスタンスとの外積を計算する
    Vector2.prototype.cross = function (target) {
        return this.x * target.y - this.y * target.x;
    };
    /**
     * 自身を単位化したベクトルを計算して返す
     */
    Vector2.prototype.normalize = function () {
        // ベクトルの大きさを計算する
        var l = Math.sqrt(this.x * this.x + this.y * this.y);
        // 大きさが 0 の場合は XY も 0 なのでそのまま返す
        if (l === 0) {
            return new Vector2(0, 0);
        }
        // 自身の XY 要素を大きさで割る
        var x = this.x / l;
        var y = this.y / l;
        // 単位化されたベクトルを返す
        return new Vector2(x, y);
    };
    //指定された角度(radian単位)分だけ自身のベクトルを回転させる
    Vector2.prototype.rotate = function (radian) {
        // 指定されたラジアンからサインとコサインを求める
        var s = Math.sin(radian);
        var c = Math.cos(radian);
        // 2x2 の回転行列と乗算し回転させる
        this.x = this.x * c + this.y * -s;
        this.y = this.x * s + this.y * c;
    };
    return Vector2;
}());
export { Vector2 };
var Boid = /** @class */ (function () {
    function Boid(ctx, x, y, vx, vy, id, param, scale, type, imgPath) {
        var _this = this;
        this.cohesion_coef = param.cohesion_coef; //群れの中心に向かう度合
        this.separation_coef = param.separation_coef; //仲間を避ける度合
        this.alignment_coef = param.alignment_coef; //群れの平均速度に合わせる度合
        this.separation_thres = param.separation_thres; //分離ルールの適用距離
        this.speed_limit = param.speed_limit; //制限速度
        this.sight_range = param.sight_range;
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
        this.image.addEventListener('load', function () {
            //元画像のサイズと指定されたスケールからサイズを決定
            _this.width = _this.scale * _this.image.naturalWidth;
            _this.height = _this.scale * _this.image.naturalHeight;
        }, false);
        this.image.src = imgPath;
    }
    //群れ全体の状態から各個体の状態変化量を求める
    Boid.prototype.update_calc = function (boids, obstacles) {
        this.f_cohesion(boids);
        this.f_separation(boids, obstacles);
        this.f_alignment(boids);
    };
    //実際に各個体の状態を更新する
    Boid.prototype.update_actual = function () {
        var accx = this.cohesion_coef * this.cohesion.x + this.separation_coef * this.separation.x + this.alignment_coef * this.alignment.x;
        var accy = this.cohesion_coef * this.cohesion.y + this.separation_coef * this.separation.y + this.alignment_coef * this.alignment.y;
        //        if(this.id === 7){
        //            if(isNaN(this.pos.x) === false && isNaN(this.pos.y) === false) {
        //                console.log("No.%d の個体の加速度は(%f, %f)。", this.id, accx, accy);
        //            }
        //        }
        this.vel.x += this.cohesion_coef * this.cohesion.x + this.separation_coef * this.separation.x + this.alignment_coef * this.alignment.x;
        this.vel.y += this.cohesion_coef * this.cohesion.y + this.separation_coef * this.separation.y + this.alignment_coef * this.alignment.y;
        //制限速度を超えた場合
        var speed = this.vel.length();
        if (speed > this.speed_limit) {
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
        //        if(this.id === 7){
        //            if(isNaN(this.pos.x) === false && isNaN(this.pos.y) === false) {
        //                console.log("No.%d の個体の位置は(%f, %f)。", this.id, this.pos.x, this.pos.y);
        //                console.log("No.%d の個体の速度は(%f, %f)。", this.id, this.vel.x, this.vel.y);
        //                console.log("===")
        //            }
        //        }
    };
    //結合ルール
    Boid.prototype.f_cohesion = function (boids) {
        //群れの座標値の合計を求める
        var tmpX = 0, tmpY = 0;
        //視界内の個体数
        var sight_boids_num = 0;
        for (var i = 0; i < boids.length; ++i) {
            //自身は除く
            if (this.id === i)
                continue;
            //自身の視界内にいる場合
            if (this.pos.distance(boids[i].pos) < this.sight_range) {
                tmpX += boids[i].pos.x;
                tmpY += boids[i].pos.y;
                ++sight_boids_num;
            }
        }
        //重心の計算(自身は含めない)
        if (sight_boids_num !== 0) {
            tmpX /= sight_boids_num;
            tmpY /= sight_boids_num;
        }
        //重心へ向かう速度変化量
        var coef = 0.0001;
        //群れから孤立した場合
        if (sight_boids_num === 0) {
            this.cohesion.x = 0;
            this.cohesion.y = 0;
        }
        else {
            this.cohesion.x = (tmpX - this.pos.x) * coef;
            this.cohesion.y = (tmpY - this.pos.y) * coef;
        }
    };
    //分離ルール
    Boid.prototype.f_separation = function (boids, obstacles) {
        var vel_x = 0, vel_y = 0;
        for (var i = 0; i < boids.length; ++i) {
            //自身は除く
            if (this.id === i)
                continue;
            //自身と他の個体との距離
            var dist = this.pos.distance(boids[i].pos);
            //0除算防止用
            if (dist === 0)
                dist = 1;
            //一定距離以下まで近づいた場合
            if (dist < this.separation_thres) {
                //離れる方向に加速(距離が近づくほど早く離れる)
                vel_x += (this.pos.x - boids[i].pos.x) / dist;
                vel_y += (this.pos.y - boids[i].pos.y) / dist;
            }
        }
        //障害物に対して分離ルール適用
        for (var i = 0; i < obstacles.length; ++i) {
            var dist_obs = this.pos.distance(obstacles[i].pos) - obstacles[i].width;
            //0除算防止用
            if (dist_obs === 0)
                dist_obs = 1;
            //障害物との距離が基準以下の場合
            if (dist_obs < this.separation_thres) {
                vel_x += (this.pos.x - obstacles[i].pos.x) / dist_obs;
                vel_y += (this.pos.y - obstacles[i].pos.y) / dist_obs;
            }
        }
        //壁に対しても分離ルールを適用
        var w_width = this.ctx.canvas.width;
        var w_height = this.ctx.canvas.height;
        //各壁との距離
        var left = this.pos.x;
        var right = w_width - this.pos.x;
        var roof = this.pos.y;
        var floor = w_height - this.pos.y;
        //一定距離以下まで近づいた場合
        if (left < this.separation_thres) {
            //離れる方向に加速
            if (left !== 0)
                vel_x += 1 / left;
        }
        if (right < this.separation_thres) {
            //離れる方向に加速
            if (right !== 0)
                vel_x -= 1 / right;
        }
        //一定距離以下まで近づいた場合
        if (roof < this.separation_thres) {
            //離れる方向に加速
            if (roof !== 0)
                vel_y += 1 / roof;
        }
        if (floor < this.separation_thres) {
            //離れる方向に加速
            if (floor !== 0)
                vel_y -= 1 / floor;
        }
        var coef = 0.01;
        this.separation.x = vel_x * coef;
        this.separation.y = vel_y * coef;
    };
    //整列ルール
    Boid.prototype.f_alignment = function (boids) {
        var tmp_x = 0, tmp_y = 0;
        //視界内の個体数
        var sight_boids_num = 0;
        for (var i = 0; i < boids.length; ++i) {
            //自身は除く
            if (this.id === i)
                continue;
            //自身の視界内にいる場合
            if (this.pos.distance(boids[i].pos) < this.sight_range) {
                tmp_x += boids[i].vel.x;
                tmp_y += boids[i].vel.y;
                ++sight_boids_num;
            }
        }
        //群れの速度の平均
        if (sight_boids_num !== 0) {
            tmp_x /= sight_boids_num;
            tmp_y /= sight_boids_num;
        }
        var coef = 0.0001;
        //群れから孤立した場合
        if (sight_boids_num === 0) {
            this.alignment.x = 0;
            this.alignment.y = 0;
        }
        else {
            this.alignment.x = (tmp_x - this.vel.x) * coef;
            this.alignment.y = (tmp_y - this.vel.y) * coef;
        }
    };
    //壁との衝突判定
    Boid.prototype.CollideWall = function () {
        //左右の壁に衝突していた場合
        if (this.pos.x - this.width / 2 < 0) {
            this.pos.x = this.width / 2;
            this.vel.x *= -1;
        }
        else if (this.pos.x + this.width / 2 > this.ctx.canvas.width) {
            this.pos.x = this.ctx.canvas.width - this.width / 2;
            this.vel.x *= -1;
        }
        //上下の壁に衝突していた場合
        else if (this.pos.y - this.height / 2 < 0) {
            this.pos.y = this.height / 2;
            this.vel.y *= -1;
        }
        else if (this.pos.y + this.height / 2 > this.ctx.canvas.height) {
            this.pos.y = this.ctx.canvas.height - this.height / 2;
            this.vel.y *= -1;
        }
    };
    Boid.prototype.draw = function () {
        // キャラクターの幅やオフセットする量を加味して塗りつぶす
        this.ctx.drawImage(this.image, this.pos.x - this.width / 2, this.pos.y - this.height / 2, this.width, this.height);
    };
    //自身の回転量を元に座標系を回転させる
    Boid.prototype.rotationDraw = function () {
        // 座標系を回転する前の状態を保存する
        this.ctx.save();
        // 自身の位置が座標系の中心と重なるように平行移動する
        this.ctx.translate(this.pos.x, this.pos.y);
        // 座標系を回転させる（angleの値で0radを指定した際、x軸方向に向かせるため Math.PI * 1.5 を引いている）
        this.ctx.rotate(this.angle - Math.PI * 1.5);
        // キャラクターの幅を考慮してオフセットする量
        var offsetX = this.width / 2;
        var offsetY = this.height / 2;
        // キャラクターの幅やオフセットする量を加味して描画する
        this.ctx.drawImage(this.image, -offsetX, // 先に translate で平行移動しているのでオフセットのみ行う
        -offsetY, // 先に translate で平行移動しているのでオフセットのみ行う
        this.width, this.height);
        // 座標系を回転する前の状態に戻す
        this.ctx.restore();
    };
    return Boid;
}());
export { Boid };
//設置する長方形の障害物
var Obstacle = /** @class */ (function () {
    function Obstacle(util, x, y, w, h, c) {
        this.util = util;
        this.pos = new Vector2(x, y);
        this.width = w;
        this.height = h;
        this.color = c;
    }
    Obstacle.prototype.draw = function () {
        //矩形を描画
        this.util.drawRect(this.pos.x - this.width / 2, this.pos.y - this.height / 2, this.width, this.height, this.color);
    };
    return Obstacle;
}());
export { Obstacle };
