#ソースファイルの場所
TS_SRC = src/
#JSファイルの出力先
TARGET = dist/

#出力JSファイル
default: $(TARGET)*

#tsファイルをコンパイルしてjsファイル
$(TARGET)*: $(TS_SRC)* Makefile
	npm run build

#ローカルwebサーバを起動
server-run:
	python -m http.server 8000

clean:
	rm $(TARGET)*
