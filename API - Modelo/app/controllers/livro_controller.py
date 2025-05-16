from flask import jsonify, request
from ..models.livro import Livro

class LivroController:
    @staticmethod
    def criar_livro():
        dados = request.get_json()
        if not dados or 'titulo' not in dados or 'autor' not in dados:
            return jsonify({"erro": "Dados incompletos"}), 400
        
        try:
            livro_id = Livro.criar(dados['titulo'], dados['autor'])
            return jsonify({"mensagem": "Livro criado com sucesso", "id": livro_id}), 201
        except Exception as e:
            return jsonify({"erro": str(e)}), 500

    @staticmethod
    def obter_livros():
        try:
            livros = Livro.obter_todos()
            return jsonify(livros)
        except Exception as e:
            return jsonify({"erro": str(e)}), 500

    @staticmethod
    def obter_livro(id):
        try:
            livro = Livro.obter_por_id(id)
            if livro:
                return jsonify(livro)
            return jsonify({"erro": "Livro não encontrado"}), 404
        except Exception as e:
            return jsonify({"erro": str(e)}), 500

    @staticmethod
    def editar_livro(id):
        dados = request.get_json()
        if not dados or 'titulo' not in dados or 'autor' not in dados:
            return jsonify({"erro": "Dados incompletos"}), 400
        
        try:
            atualizado = Livro.atualizar(id, dados['titulo'], dados['autor'])
            if atualizado:
                livro = Livro.obter_por_id(id)
                return jsonify(livro)
            return jsonify({"erro": "Livro não encontrado"}), 404
        except Exception as e:
            return jsonify({"erro": str(e)}), 500

    @staticmethod
    def excluir_livro(id):
        try:
            deletado = Livro.deletar(id)
            if deletado:
                return jsonify({"mensagem": "Livro excluído com sucesso"})
            return jsonify({"erro": "Livro não encontrado"}), 404
        except Exception as e:
            return jsonify({"erro": str(e)}), 500