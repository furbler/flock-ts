#ソースファイルの場所
TS_SRC = src/
#JSファイルの出力先
TARGET = build/

#出力JSファイル
default: $(TARGET)boid.js $(TARGET)canvas2d.js $(TARGET)main.js

#tsファイルをコンパイルしてjsファイル
#jsファイルでファイルを指定する箇所があれば拡張子.jsを追加
$(TARGET)%.js: $(TS_SRC)%.ts Makefile
	tsc -p $(TS_SRC)tsconfig.json
	./addExtension.sh

#ローカルwebサーバを起動
server-run:
	python -m http.server 8000

clean:
	rm $(TARGET)*.js
