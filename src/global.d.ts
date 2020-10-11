type Parameter = {
    cohesion_coef: number; //群れの中心に向かう度合
    separation_coef: number; //仲間を避ける度合
    alignment_coef: number; //群れの平均速度に合わせる度合

    separation_thres: number; //分離ルールの距離の閾値
    speed_limit: number; //個体の制限速度
    sight_range: number; //個体の視界の距離
    cursor_radius: number; //カーソルで動かす障害物の半径
}
