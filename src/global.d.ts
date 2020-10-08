type Parameter = {
    cohesion_coef: number; //群れの中心に向かう度合
    conhesion_default_string: string;

    separation_coef: number; //仲間を避ける度合
    separation_default_string: string;

    alignment_coef: number; //群れの平均速度に合わせる度合
    alignment_default_string: string;

    separation_thres: number; //分離ルールの距離の閾値
    separation_thres_default_string: string;
    speed_limit: number; //個体の制限速度
    speed_limit_default_string: string;
}
