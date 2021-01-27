TS_SRC = src/
TARGET = build/

all: $(TARGET)boid.js $(TARGET)canvas2d.js $(TARGET)main.js

#tsファイルをコンパイルしてjsファイルにする
#jsファイルでファイルを指定する箇所があれば拡張子.jsを追加
$(TARGET)%.js: $(TS_SRC)%.ts Makefile
	tsc -p $(TS_SRC)tsconfig.json
	./addExtension.sh

#httpサーバを起動
server-run:
	python -m http.server 8000

clean:
	rm $(TARGET)*.js
