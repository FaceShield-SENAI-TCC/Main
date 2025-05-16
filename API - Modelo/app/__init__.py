from flask import Flask
from .config.database import init_db
from .routes import init_routes

def create_app():
    app = Flask(__name__)
    
    # Configurações
    app.config.from_pyfile('../instance/config.py', silent=True)
    
    # Inicializa o banco de dados
    init_db(app)
    
    # Registra as rotas
    init_routes(app)
    
    return app