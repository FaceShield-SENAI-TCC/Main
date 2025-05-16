class Livro:
    @staticmethod
    def criar(titulo, autor):
        conn = get_db_connection()
        if conn:
            try:
                cursor = conn.cursor()
                query = "INSERT INTO livros (titulo, autor) VALUES (%s, %s)"
                cursor.execute(query, (titulo, autor))
                conn.commit()
                return cursor.lastrowid
            except Error as e:
                raise Exception(f"Erro ao criar livro: {e}")
            finally:
                if conn.is_connected():
                    cursor.close()
                    conn.close()
        raise Exception("Falha na conexão com o banco")

    @staticmethod
    def obter_todos():
        conn = get_db_connection()
        if conn:
            try:
                cursor = conn.cursor(dictionary=True)
                cursor.execute("SELECT id, titulo, autor FROM livros")
                return cursor.fetchall()
            except Error as e:
                raise Exception(f"Erro ao obter livros: {e}")
            finally:
                if conn.is_connected():
                    cursor.close()
                    conn.close()
        raise Exception("Falha na conexão com o banco")

    @staticmethod
    def obter_por_id(id):
        conn = get_db_connection()
        if conn:
            try:
                cursor = conn.cursor(dictionary=True)
                cursor.execute("SELECT id, titulo, autor FROM livros WHERE id = %s", (id,))
                return cursor.fetchone()
            except Error as e:
                raise Exception(f"Erro ao obter livro: {e}")
            finally:
                if conn.is_connected():
                    cursor.close()
                    conn.close()
        raise Exception("Falha na conexão com o banco")

    @staticmethod
    def atualizar(id, titulo, autor):
        conn = get_db_connection()
        if conn:
            try:
                cursor = conn.cursor()
                query = "UPDATE livros SET titulo = %s, autor = %s WHERE id = %s"
                cursor.execute(query, (titulo, autor, id))
                conn.commit()
                return cursor.rowcount > 0
            except Error as e:
                raise Exception(f"Erro ao atualizar livro: {e}")
            finally:
                if conn.is_connected():
                    cursor.close()
                    conn.close()
        raise Exception("Falha na conexão com o banco")

    @staticmethod
    def deletar(id):
        conn = get_db_connection()
        if conn:
            try:
                cursor = conn.cursor()
                cursor.execute("DELETE FROM livros WHERE id = %s", (id,))
                conn.commit()
                return cursor.rowcount > 0
            except Error as e:
                raise Exception(f"Erro ao deletar livro: {e}")
            finally:
                if conn.is_connected():
                    cursor.close()
                    conn.close()
        raise Exception("Falha na conexão com o banco")