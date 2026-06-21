FROM python:3.12-slim

# Labo d'analyse — Terminal Go-Sci Station
RUN pip install --no-cache-dir \
    jupyterlab==4.2.5 \
    pandas==2.2.2 \
    matplotlib==3.9.2 \
    sqlalchemy==2.0.32 \
    psycopg2-binary==2.9.9

WORKDIR /home/jovyan/work
EXPOSE 8888

CMD ["jupyter", "lab", \
     "--ip=0.0.0.0", "--port=8888", "--no-browser", "--allow-root", \
     "--ServerApp.token=goscistation", \
     "--ServerApp.root_dir=/home/jovyan/work"]
