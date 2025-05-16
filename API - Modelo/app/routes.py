from .controllers.livro_controller import LivroController

def init_routes(app):
    @app.route('/livros/criar', methods=['POST'])
    def criar_livro():
        return LivroController.criar_livro()

    @app.route("/livros/buscar", methods=['GET'])
    def obter_livros():
        return LivroController.obter_livros()

    @app.route("/livros/buscarID/<int:id>", methods=['GET'])
    def obter_livro_id(id):
        return LivroController.obter_livro(id)

    @app.route('/livros/editar/<int:id>', methods=['PUT'])
    def editar_livro_id(id):
        return LivroController.editar_livro(id)

    @app.route("/livros/excluir/<int:id>", methods=['DELETE'])
    def excluir_livro(id):
        return LivroController.excluir_livro(id)