// URLs da API (ajuste conforme necessário)
const API_BASE = "http://localhost:8080";
const API_ALUNOS = `${API_BASE}/usuarios/buscar`;
const API_FERRAMENTAS = `${API_BASE}/ferramentas/buscar`;
const API_EMPRESTIMOS = `${API_BASE}/emprestimos/novoEmprestimo`;
const API_LOCAIS = `${API_BASE}/locais/buscar`;

// Estado da aplicação
let alunos = [];
let ferramentas = [];
let locais = [];

// Elementos DOM
const feedbackEl = document.getElementById("feedback");
const professorNameEl = document.getElementById("professor-name");
const professorDisplayEl = document.getElementById("professor-display");
const alunoSelect = document.getElementById("aluno");
const ferramentaSelect = document.getElementById("ferramenta");
const btnRegistrar = document.getElementById("btn-registrar");
const btnCancelar = document.getElementById("btn-cancelar");
const userAvatar = document.getElementById("user-avatar");

// Função para exibir feedback
function showFeedback(type, message) {
  feedbackEl.textContent = message;
  feedbackEl.className = `feedback ${type}`;
  feedbackEl.style.display = "block";

  if (type === "success") {
    setTimeout(() => {
      feedbackEl.style.display = "none";
    }, 5000);
  }
}

// Função para obter data/hora atual no fuso de Brasília (São Carlos)
function getDataHoraBrasilia() {
  return new Date();
}

// Função para formatar data/hora (fuso de Brasília) para exibição
function formatarDataBrasilia(date) {
  return date.toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Função para converter data para formato ISO (YYYY-MM-DDTHH:MM) sem alterar o horário
function toISOLocal(date) {
  if (!date) return null;

  const pad = (n) => n.toString().padStart(2, "0");

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// Função para converter data local para ISO string mantendo o horário local
function toISOLocalString(date) {
  if (!date) return null;

  const pad = (n) => n.toString().padStart(2, "0");

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  // Retorna no formato: YYYY-MM-DDTHH:MM:SS (horário local)
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

// Gerar iniciais a partir do nome
function gerarIniciais(nome) {
  const nomes = nome.split(" ");
  if (nomes.length >= 2) {
    return nomes[0].charAt(0) + nomes[nomes.length - 1].charAt(0);
  }
  return nome.substring(0, 2).toUpperCase();
}

// Função para carregar alunos
async function carregarAlunos() {
  try {
    const response = await fetch(API_ALUNOS);

    if (!response.ok) {
      throw new Error("Falha ao carregar alunos");
    }

    alunos = await response.json();

    // Limpar e preencher select de alunos
    alunoSelect.innerHTML = '<option value="">Selecione um aluno</option>';
    alunos.forEach((aluno) => {
      const option = document.createElement("option");
      option.value = aluno.id;
      option.textContent = `${aluno.nome} ${aluno.sobrenome} - ${aluno.turma}`;
      option.setAttribute("data-turma", aluno.turma);
      alunoSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Erro ao carregar alunos:", error);
    alunoSelect.innerHTML = '<option value="">Erro ao carregar alunos</option>';
    showFeedback(
      "error",
      "Erro ao carregar lista de alunos. Tente recarregar a página."
    );
  }
}

// Função para carregar ferramentas disponíveis
async function carregarFerramentas() {
  try {
    const response = await fetch(API_FERRAMENTAS);

    if (!response.ok) {
      throw new Error("Falha ao carregar ferramentas");
    }

    ferramentas = await response.json();

    // Limpar e preencher select de ferramentas
    ferramentaSelect.innerHTML =
      '<option value="">Selecione uma ferramenta</option>';
    ferramentas.forEach((ferramenta) => {
      const option = document.createElement("option");
      option.value = ferramenta.id;
      option.textContent = `${ferramenta.nome} (${ferramenta.marca})`;
      option.setAttribute("data-local-id", ferramenta.id_local);
      ferramentaSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Erro ao carregar ferramentas:", error);
    ferramentaSelect.innerHTML =
      '<option value="">Erro ao carregar ferramentas</option>';
    showFeedback(
      "error",
      "Erro ao carregar lista de ferramentas. Tente recarregar a página."
    );
  }
}

// Função para carregar locais
async function carregarLocais() {
  try {
    const response = await fetch(API_LOCAIS);

    if (!response.ok) {
      throw new Error("Falha ao carregar locais");
    }

    locais = await response.json();
  } catch (error) {
    console.error("Erro ao carregar locais:", error);
    showFeedback(
      "warning",
      "Não foi possível carregar informações de localização."
    );
  }
}

// Atualizar turma quando aluno for selecionado
alunoSelect.addEventListener("change", function () {
  const selectedOption = this.options[this.selectedIndex];
  const turma = selectedOption.getAttribute("data-turma") || "";
  document.getElementById("turma").value = turma;
});

// Atualizar localização quando ferramenta for selecionada
// Atualizar localização quando ferramenta for selecionada - VERSÃO CORRIGIDA
ferramentaSelect.addEventListener("change", function () {
  const selectedOption = this.options[this.selectedIndex];
  const ferramentaId = selectedOption.value;

  // Encontrar a ferramenta selecionada no array de ferramentas
  const ferramenta = ferramentas.find((f) => f.id == ferramentaId);

  if (ferramenta && ferramenta.id_local && locais.length > 0) {
    // Buscar o local correspondente ao id_local da ferramenta
    const local = locais.find((l) => l.id == ferramenta.id_local);

    if (local) {
      // Construir a string de localização
      let localizacaoTexto = local.nomeEspaco || "";
      if (local.armario) localizacaoTexto += ` - Armário ${local.armario}`;
      if (local.prateleira)
        localizacaoTexto += `, Prateleira ${local.prateleira}`;
      if (local.estojo) localizacaoTexto += `, Estojo ${local.estojo}`;

      document.getElementById("localizacao").value = localizacaoTexto;
      return;
    }
  }

  // Fallback caso não encontre
  document.getElementById("localizacao").value = "Local não definido";
});

// Função para registrar o empréstimo usando Fetch API
async function registrarEmprestimo() {
  // Obter dados do formulário
  const alunoId = alunoSelect.value;
  const ferramentaId = ferramentaSelect.value;
  const dataDevolucaoInput = document.getElementById("data-devolucao").value;
  const observacoes = document.getElementById("observacoes").value || "";

  // Validar campos
  if (!alunoId || !ferramentaId) {
    showFeedback("error", "Por favor, preencha todos os campos obrigatórios!");
    return;
  }

  // Selecionar aluno e ferramenta
  const aluno = alunos.find((a) => a.id == alunoId);
  const ferramenta = ferramentas.find((f) => f.id == ferramentaId);

  if (!aluno || !ferramenta) {
    showFeedback(
      "error",
      "Dados inválidos. Recarregue a página e tente novamente."
    );
    return;
  }

  // Obter data/hora atual em Brasília (São Carlos)
  const dataRetirada = getDataHoraBrasilia();

  // Tratar data de devolução (pode ser null ou data válida)
  let dataDevolucao = null;
  if (dataDevolucaoInput) {
    // Converter data de devolução para objeto Date
    dataDevolucao = new Date(dataDevolucaoInput);
  }

  // Montar objeto para envio conforme Swagger
  const emprestimoData = {
    data_retirada: toISOLocalString(dataRetirada), // Usar horário local
    data_devolucao: dataDevolucao ? toISOLocalString(dataDevolucao) : null, // Usar horário local
    observacoes: observacoes,
    usuario: {
      id: parseInt(alunoId),
      nome: aluno.nome,
      sobrenome: aluno.sobrenome,
      turma: aluno.turma,
      username: aluno.username,
      senha: aluno.senha,
      tipoUsuario: aluno.tipoUsuario,
    },
    ferramenta: {
      id: parseInt(ferramentaId),
      nome: ferramenta.nome,
      marca: ferramenta.marca,
      modelo: ferramenta.modelo,
      qrcode: ferramenta.qrcode,
      estado: ferramenta.estado,
      disponibilidade: ferramenta.disponibilidade,
      descricao: ferramenta.descricao,
      id_local: ferramenta.id_local,
    },
  };

  console.log("Dados enviados:", emprestimoData);

  try {
    // Desativar botão durante a requisição
    btnRegistrar.disabled = true;
    btnRegistrar.innerHTML =
      '<i class="fas fa-spinner spinner"></i> Registrando...';

    // Enviar para API usando Fetch
    const response = await fetch(API_EMPRESTIMOS, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emprestimoData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Erro HTTP ${response.status}`);
    }

    const result = await response.json();
    console.log("Empréstimo registrado com sucesso:", result);

    showFeedback(
      "success",
      `Empréstimo registrado com sucesso! ID: ${result.id}`
    );

    // Resetar formulário após sucesso
    alunoSelect.value = "";
    ferramentaSelect.value = "";
    document.getElementById("turma").value = "";
    document.getElementById("localizacao").value = "";
    document.getElementById("observacoes").value = "";

    // Definir data de devolução padrão (7 dias no futuro)
    const devolucao = getDataHoraBrasilia();
    devolucao.setDate(devolucao.getDate() + 7);
    document.getElementById("data-devolucao").value = toISOLocal(devolucao);
  } catch (error) {
    console.error("Erro ao registrar empréstimo:", error);
    showFeedback(
      "error",
      `Erro: ${error.message || "Falha ao registrar empréstimo"}`
    );
  } finally {
    // Reativar botão
    btnRegistrar.disabled = false;
    btnRegistrar.innerHTML =
      '<i class="fas fa-check"></i> Registrar Empréstimo';
  }
}

// Inicialização quando a página carrega
document.addEventListener("DOMContentLoaded", async function () {
  // Definir nome do professor (em um sistema real, viria do login)
  const professorNome = "Administrador";

  // Atualizar UI com nome do professor
  professorNameEl.textContent = professorNome;
  professorDisplayEl.textContent = professorNome;

  // Gerar e exibir iniciais
  const iniciais = gerarIniciais(professorNome);
  userAvatar.textContent = iniciais;

  // Definir data de retirada como agora (Brasília/São Carlos)
  const agoraBrasilia = getDataHoraBrasilia();
  document.getElementById("data-retirada").value =
    formatarDataBrasilia(agoraBrasilia);

  // Definir data de registro
  document.getElementById("data-registro").textContent =
    formatarDataBrasilia(agoraBrasilia);

  // Definir data de devolução padrão (7 dias no futuro)
  const devolucao = getDataHoraBrasilia();
  devolucao.setDate(devolucao.getDate() + 7);
  document.getElementById("data-devolucao").value = toISOLocal(devolucao);

  // Carregar dados iniciais
  await carregarLocais();
  await carregarAlunos();
  await carregarFerramentas();

  // Configurar botão de registro
  btnRegistrar.addEventListener("click", registrarEmprestimo);

  // Configurar botão de cancelar
  btnCancelar.addEventListener("click", function () {
    if (
      confirm("Deseja realmente cancelar? Todas as alterações serão perdidas.")
    ) {
      window.location.href = "../VerEmprestimo/Emprestimos.html";
    }
  });

  // DEBUG: Exibir informações de fuso horário
  console.log(
    "Hora local (São Carlos/Brasília):",
    formatarDataBrasilia(getDataHoraBrasilia())
  );
  console.log("Hora atual (objeto Date):", getDataHoraBrasilia().toString());
});

// Função de navegação
function navigate(page) {
  window.location.href = `${page}.html`;
}

// Função de logout
function logout() {
  if (confirm("Deseja realmente sair do sistema?")) {
    window.location.href = "index.html";
  }
}
