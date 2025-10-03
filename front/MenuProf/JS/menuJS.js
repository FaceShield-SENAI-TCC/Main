/*document.addEventListener('DOMContentLoaded', () => {
            // Elementos do menu
            const alunosBtn = document.getElementById('alunos');
            const emprestimosBtn = document.getElementById('emprestimos');
            const ferramentasBtn = document.getElementById('ferramentas');
            const locaisBtn = document.getElementById('locais');
            const novoEmprestimoBtn = document.getElementById('novo-emprestimo');
            const logoutBtn = document.getElementById('logout');

            // Navegação
            alunosBtn.addEventListener('click', () => {
                window.location.href = '../Cadastro/cadastro.html'; // Cadastro de alunos
            });

            emprestimosBtn.addEventListener('click', () => {
                window.location.href = 'emprestimos.html'; // Lista de empréstimos
            });

            ferramentasBtn.addEventListener('click', () => {
                window.location.href = '../FerramentaCad/FerramentaCadastro.html'; // Cadastro de ferramentas
            });

            locaisBtn.addEventListener('click', () => {
                window.location.href = 'C:\Users\Aluno\Desktop\Front_End\front\Locais\local.html'; // Locais de empréstimo
            });

            novoEmprestimoBtn.addEventListener('click', () => {
                window.location.href = 'novo-emprestimo.html'; // Novo empréstimo
            });

            // Logout
            logoutBtn.addEventListener('click', () => {
                // Remove o token de autenticação
                localStorage.removeItem('authToken');
                // Redireciona para a página inicial
                window.location.href = '../index.html';
            });

            // Verifica se o usuário está autenticado
          if(!localStorage.getItem('authToken')) {
                window.location.href = '../Login/LoginProfessor.html';
            }
        });

        */
