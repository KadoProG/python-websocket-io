# ベースイメージを指定
FROM python:3.10-slim

# 必要なパッケージをインストール
RUN apt-get update && apt-get install -y gcc g++ musl-dev libpq-dev

# ワーキングディレクトリを指定
WORKDIR /app

# 必要なファイルをコピー
COPY ./backend/requirements.txt requirements.txt

# 依存関係をインストール
RUN pip install -r requirements.txt

# アプリケーションのソースコードをコピー
COPY ./backend .

# Flaskアプリケーションを起動
CMD ["python", "server.py"]
