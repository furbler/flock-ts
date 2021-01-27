# flock-ts
Boid (Birdoidの略)という、群れをシミュレーションするアルゴリズムを作りました。

![boids](https://user-images.githubusercontent.com/63544661/105990531-f2126080-60e5-11eb-89c4-5b986fad65f8.gif)

[こちらのページ](https://boids-ts.netlify.app/)でパラメータを変更なども試すことができます。

## 開発環境
- OS : Ubuntu 18.04 LTS
- tsc : version 4.0.3
- python : version 3.6.8

## 使い方

### コンパイル
```bash
$ make
```
srcディレクトリ内にあるtsファイルをjsファイルにコンパイルし、buildディレクトリに出力

### 実行
```bash
$ make server-run
```
ローカルでwebサーバを起動します。。
それからブラウザで http://localhost:8000/ にアクセスするとwebページが表示されます。

画面下のパラメータは数値を変えてから「適用」ボタンを押さないと反映されません。


## 参考元

### [スイミーを再現したい！ ～群れアルゴリズム Boids～ - Qiita](https://qiita.com/odanny/items/e0c0a00e13c2b4839cec)
Boidsアルゴリズムの参考にしました。

### [［ゲーム＆モダン JavaScript文法で2倍楽しい］グラフィックスプログラミング入門｜技術評論社](https://gihyo.jp/book/2020/978-4-297-11085-7)
コードの元にしました。