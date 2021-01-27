#!/bin/bash

#同じディレクトリ内にあるファイルに適用される

#"./hogehoge"の形の文字列を含むファイル一覧を取得
greps=$(grep -l  "\"\./.*\"" ./build/*.js)
#自身を除く。この記法はbashのみ
files=${greps/addExtension.sh/}

echo "change path = " $files

for path in $files
do
    #.js"という文字列を含まない行のみに対して置換を実行する
    sed -i -e '/\.js\"/ !s@\"\./\(.*\)\"@\"\./\1\.js\"@g' $path
done
