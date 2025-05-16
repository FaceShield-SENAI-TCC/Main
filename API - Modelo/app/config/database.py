import mysql.connector
from mysql.connector import Error
from .settings import Config

def get_db_connection():
    try:
        connection = mysql.connector.connect(
            host=Config.DB_HOST,
            user=Config.DB_USER,
            password=Config.DB_PASSWORD,
            database=Config.DB_NAME,
            port=Config.DB_PORT
        )
        return connection
    except Error as e:
        print(f"Erro ao conectar ao MySQL: {e}")
        return None

def init_db(app):
    @app.before_first_request
    def create_tables():
        conn = get_db_connection()
        if conn:
            try:
                cursor = conn.cursor()
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS livros (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        titulo VARCHAR(255) NOT NULL,
                        autor VARCHAR(255) NOT NULL
                    )
                """)
                conn.commit()
                print("Tabela 'livros' criada/verificada com sucesso")
            except Error as e:
                print(f"Erro ao criar tabela: {e}")
            finally:
                if conn.is_connected():
                    cursor.close()
                    conn.close()