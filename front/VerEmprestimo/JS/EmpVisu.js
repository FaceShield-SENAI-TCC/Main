// Elementos DOM
const loansTableBody = document.getElementById("loans-table-body");
const filterUser = document.getElementById("filter-user");
const filterTool = document.getElementById("filter-tool");
const filterStatus = document.getElementById("filter-status");
const prevPageBtn = document.getElementById("prev-page");
const nextPageBtn = document.getElementById("next-page");
const pageInfo = document.getElementById("page-info");
const feedbackMessage = document.getElementById("feedback-message");
const novoEmprestimoBtn = document.getElementById("novo-emprestimo-btn");

// Elementos do Modal
const modal = document.getElementById("loan-details-modal");
const closeModalBtn = document.querySelector(".close");
const modalReturnBtn = document.getElementById("modal-return-btn");
const modalId = document.getElementById("modal-id");
const modalUser = document.getElementById("modal-user");
const modalTool = document.getElementById("modal-tool");
const modalWithdrawal = document.getElementById("modal-withdrawal");
const modalExpectedReturn = document.getElementById("modal-expected-return");
const modalActualReturn = document.getElementById("modal-actual-return");
const modalStatus = document.getElementById("modal-status");
const modalNotes = document.getElementById("modal-notes");
const modalLocationSpace = document.getElementById("modal-location-space");
const modalLocationCabinet = document.getElementById("modal-location-cabinet");
const modalLocationShelf = document.getElementById("modal-location-shelf");
const modalLocationCase = document.getElementById("modal-location-case");

// URLs da API
const EMPRESTIMOS_API = "http://localhost:8080/emprestimos/buscar";
const FINALIZAR_EMPRESTIMO_API = "http://localhost:8080/emprestimos/finalizar";
const FERRAMENTAS_API = "http://localhost:8080/ferramentas/buscar";

// Variáveis globais
let currentPage = 1;
const itemsPerPage = 10;
let allLoans = [];
let filteredLoans = [];
let currentLoanId = null;
let allTools = [];

// Função para formatar data no formato ISO (YYYY-MM-DDTHH:mm:ss) para o fuso de Brasília
function formatToISOLocal(date) {
  if (!date) return null;
  const pad = (n) => n.toString().padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

// Função para exibir mensagem de feedback
function showFeedback(message, type = "error") {
  feedbackMessage.textContent = message;
  feedbackMessage.className = `feedback-message feedback-${type}`;
  feedbackMessage.style.display = "block";
  if (type === "success") {
    setTimeout(() => {
      feedbackMessage.style.display = "none";
    }, 3000);
  }
}

// Função para carregar todos os dados necessários
async function loadAllData() {
  try {
    showFeedback("Carregando dados...", "success");
    loansTableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 20px;"><div style="display: inline-block; margin-right: 10px;" class="loading"></div>Carregando empréstimos...</td></tr>`;

    // Carregar empréstimos e ferramentas simultaneamente
    const [loansResponse, toolsResponse] = await Promise.all([
      fetch(EMPRESTIMOS_API),
      fetch(FERRAMENTAS_API),
    ]);

    if (!loansResponse.ok)
      throw new Error(
        `Erro HTTP ${loansResponse.status} ao carregar empréstimos`
      );
    if (!toolsResponse.ok)
      throw new Error(
        `Erro HTTP ${toolsResponse.status} ao carregar ferramentas`
      );

    const loansData = await loansResponse.json();
    const toolsData = await toolsResponse.json();

    allLoans = loansData;
    allTools = toolsData;

    filteredLoans = [...allLoans];
    renderTable();
    setupPagination();
    feedbackMessage.style.display = "none";
  } catch (error) {
    console.error("Erro ao carregar dados:", error);
    loansTableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 20px; color: #c62828;">Erro ao carregar dados. Verifique se o servidor está rodando.</td></tr>`;
    showFeedback(
      "Erro ao carregar dados. Verifique se o servidor está rodando."
    );
  }
}

// Função para obter a localização de uma ferramenta
function getToolLocation(toolId) {
  console.log("Buscando ferramenta com ID:", toolId);
  const tool = allTools.find((t) => t.id == toolId);

  if (!tool) {
    console.log("Ferramenta não encontrada");
    return null;
  }

  console.log("Ferramenta encontrada:", tool);

  if (tool.local) {
    console.log("Localização encontrada na ferramenta:", tool.local);
    return tool.local;
  }

  if (tool.id_local) {
    console.log("Ferramenta tem ID de local:", tool.id_local);
    return null;
  }

  console.log("Ferramenta não tem informações de localização");
  return null;
}

// Função para finalizar empréstimo
async function finalizarEmprestimo(loanId) {
  try {
    showFeedback("Registrando devolução...", "success");
    const now = new Date();
    const dataDevolucao = formatToISOLocal(now);
    const emprestimo = allLoans.find((loan) => loan.id == loanId);
    const params = new URLSearchParams();
    params.append("dataDevolucao", dataDevolucao);
    if (emprestimo && emprestimo.observacoes) {
      params.append("observacoes", emprestimo.observacoes);
    }
    const response = await fetch(
      `${FINALIZAR_EMPRESTIMO_API}/${loanId}?${params}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Erro HTTP ${response.status}`);
    }
    showFeedback("Devolução registrada com sucesso!", "success");
    loadAllData();
    closeModal();
  } catch (error) {
    console.error("Erro ao registrar devolução:", error);
    showFeedback(`Erro ao registrar devolução: ${error.message}`);
  }
}
console.log = id_local;
// Função para renderizar a tabela
function renderTable() {
  loansTableBody.innerHTML = "";
  if (filteredLoans.length === 0) {
    loansTableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 20px;">Nenhum empréstimo encontrado</td></tr>`;
    return;
  }
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredLoans.length);
  const currentLoans = filteredLoans.slice(startIndex, endIndex);
  currentLoans.forEach((loan) => {
    const row = document.createElement("tr");
    const status = calculateLoanStatus(loan);
    const isReturned = status === "Devolvido";
    row.innerHTML = `
            <td>${loan.id}</td>
            <td>${loan.nomeUsuario || "N/A"}</td>
            <td>${loan.nomeFerramenta || "N/A"}</td>
            <td>${formatDate(loan.data_retirada)}</td>
            <td>${
              loan.data_devolucao ? formatDate(loan.data_devolucao) : "Pendente"
            }</td>
            <td><span class="status-badge ${getStatusClass(
              status
            )}">${status}</span></td>
            <td>${loan.observacoes || "Nenhuma"}</td>
            <td>
                <div class="action-buttons">
                    <button class="view-btn" data-id="${loan.id}">
                        <i class="fas fa-eye"></i> Detalhes
                    </button>
                    ${
                      !isReturned
                        ? `<button class="return-btn" data-id="${loan.id}"><i class="fas fa-check-circle"></i> Devolver</button>`
                        : `<button class="return-btn btn-finalizado" disabled><i class="fas fa-check-square"></i> Finalizado</button>`
                    }
                </div>
            </td>
        `;
    loansTableBody.appendChild(row);
  });

  // Adicionar event listeners aos botões
  document.querySelectorAll(".return-btn:not([disabled])").forEach((button) => {
    button.addEventListener("click", (e) => {
      const btn = e.target.closest(".return-btn");
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Devolvendo...';
      const loanId = btn.getAttribute("data-id");
      finalizarEmprestimo(loanId);
    });
  });

  // Adicionar event listeners aos botões de visualização
  document.querySelectorAll(".view-btn").forEach((button) => {
    button.addEventListener("click", (e) => {
      const loanId = e.target.closest(".view-btn").getAttribute("data-id");
      openModal(loanId);
    });
  });
}

// Função para abrir o modal com os detalhes do empréstimo
function openModal(loanId) {
  const loan = allLoans.find((item) => item.id == loanId);
  if (!loan) return;

  currentLoanId = loanId;
  const status = calculateLoanStatus(loan);
  const isReturned = status === "Devolvido";

  // Preencher os dados no modal
  modalId.textContent = loan.id;
  modalUser.textContent = loan.nomeUsuario || "N/A";
  modalTool.textContent = loan.nomeFerramenta || "N/A";
  modalWithdrawal.textContent = formatDate(loan.data_retirada);

  // Calcular data de devolução prevista (7 dias após a retirada)
  const withdrawalDate = new Date(loan.data_retirada);
  const expectedReturnDate = new Date(withdrawalDate);
  expectedReturnDate.setDate(expectedReturnDate.getDate() + 7);
  modalExpectedReturn.textContent = formatDate(expectedReturnDate);

  modalActualReturn.textContent = loan.data_devolucao
    ? formatDate(loan.data_devolucao)
    : "Pendente";
  modalStatus.textContent = status;
  modalStatus.className = getStatusClass(status);
  modalNotes.textContent = loan.observacoes || "Nenhuma";

  // Buscar informações de localização da ferramenta
  const toolLocation = getToolLocation(loan.idFerramenta);
  if (toolLocation) {
    modalLocationSpace.textContent = toolLocation.nomeEspaco || "N/A";
    modalLocationCabinet.textContent = toolLocation.armario || "N/A";
    modalLocationShelf.textContent = toolLocation.prateleira || "N/A";
    modalLocationCase.textContent = toolLocation.estojo || "N/A";
  } else {
    modalLocationSpace.textContent = "Não localizado";
    modalLocationCabinet.textContent = "N/A";
    modalLocationShelf.textContent = "N/A";
    modalLocationCase.textContent = "N/A";
  }

  // Configurar botão de devolução no modal
  if (isReturned) {
    modalReturnBtn.disabled = true;
    modalReturnBtn.innerHTML =
      '<i class="fas fa-check-square"></i> Empréstimo Finalizado';
    modalReturnBtn.className = "return-btn btn-finalizado";
  } else {
    modalReturnBtn.disabled = false;
    modalReturnBtn.innerHTML =
      '<i class="fas fa-check-circle"></i> Registrar Devolução';
    modalReturnBtn.className = "return-btn";
  }

  // Exibir o modal
  modal.style.display = "block";
}

// Função para fechar o modal
function closeModal() {
  modal.style.display = "none";
  currentLoanId = null;
}

// Função para calcular o status do empréstimo
function calculateLoanStatus(loan) {
  const now = new Date();

  // Se já foi devolvido (data_devolucao existe e é menor ou igual a agora)
  if (loan.data_devolucao) {
    const dataDevolucao = new Date(loan.data_devolucao);
    if (dataDevolucao <= now) {
      return "Devolvido";
    }
  }

  // Data prevista de devolução (7 dias após a retirada)
  const withdrawalDate = new Date(loan.data_retirada);
  const expectedReturnDate = new Date(withdrawalDate);
  expectedReturnDate.setDate(expectedReturnDate.getDate() + 7);

  // EM ATRASO: passou da data prevista e não foi devolvido
  if (now > expectedReturnDate) {
    return "Em atraso";
  }

  // PENDENTE: ainda não chegou a data prevista e não foi devolvido
  return "Em andamento";
}

function getStatusClass(status) {
  switch (status) {
    case "Pendente":
      return "status-pending";
    case "Em andamento":
      return "status-active";
    case "Devolvido":
      return "status-returned";
    case "Em atraso":
      return "status-delayed";
    default:
      return "";
  }
}

// Função para formatar data para exibição
function formatDate(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Função para configurar paginação
function setupPagination() {
  const totalPages = Math.ceil(filteredLoans.length / itemsPerPage);
  pageInfo.textContent = `Página ${currentPage} de ${totalPages || 1}`;
  prevPageBtn.disabled = currentPage === 1;
  nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
  prevPageBtn.onclick = () => {
    if (currentPage > 1) {
      currentPage--;
      renderTable();
      setupPagination();
    }
  };
  nextPageBtn.onclick = () => {
    if (currentPage < totalPages) {
      currentPage++;
      renderTable();
      setupPagination();
    }
  };
}

// Função para aplicar filtros
function applyFilters() {
  const userText = filterUser.value.toLowerCase();
  const toolText = filterTool.value.toLowerCase();
  const status = filterStatus.value;
  filteredLoans = allLoans.filter((loan) => {
    if (userText && !(loan.nomeUsuario || "").toLowerCase().includes(userText))
      return false;
    if (
      toolText &&
      !(loan.nomeFerramenta || "").toLowerCase().includes(toolText)
    )
      return false;
    if (status) {
      const loanStatus = calculateLoanStatus(loan);
      const statusMap = {
        active: "Em andamento",
        returned: "Devolvido",
        delayed: "Em atraso",
      };
      if (loanStatus !== statusMap[status]) return false;
    }
    return true;
  });
  currentPage = 1;
  renderTable();
  setupPagination();
}

// Adicionar event listeners
filterUser.addEventListener("input", applyFilters);
filterTool.addEventListener("input", applyFilters);
filterStatus.addEventListener("change", applyFilters);
novoEmprestimoBtn.addEventListener("click", () => {
  window.location.href = "../PostEmp/PostEmp.html";
});

// Event listeners para o modal
closeModalBtn.addEventListener("click", closeModal);
modalReturnBtn.addEventListener("click", () => {
  if (currentLoanId) {
    modalReturnBtn.disabled = true;
    modalReturnBtn.innerHTML =
      '<i class="fas fa-spinner fa-spin"></i> Devolvendo...';
    finalizarEmprestimo(currentLoanId);
  }
});
window.addEventListener("click", (event) => {
  if (event.target === modal) {
    closeModal();
  }
});

// Inicializar a página
document.addEventListener("DOMContentLoaded", loadAllData);
