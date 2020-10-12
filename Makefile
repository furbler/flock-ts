
TS_SRC = src/
TARGET = build/src/

all: $(TARGET)*.js

#tsファイルをコンパイルしてjsファイルにする
#jsファイルでファイルを指定する箇所があれば拡張子.jsを追加
$(TARGET)%.js: $(TS_SRC)%.ts Makefile
	tsc -p tsconfig.json
	./addExtension.sh

#httpサーバを起動
server-run:
	python -m http.server 8000
