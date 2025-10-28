// Elementos DOM
const toolsTableBody = document.getElementById("tools-table-body");
const toolsCards = document.getElementById("tools-cards");
const searchInput = document.getElementById("search-input");
const toolModal = document.getElementById("tool-modal");
const modalTitle = document.getElementById("modal-title");
const toolForm = document.getElementById("tool-form");
const toolId = document.getElementById("tool-id");
const toolName = document.getElementById("tool-name");
const toolBrand = document.getElementById("tool-brand");
const toolModel = document.getElementById("tool-model");
const toolQrcode = document.getElementById("tool-qrcode");
const toolEstado = document.getElementById("tool-estado");
const toolDisponibilidade = document.getElementById("tool-disponibilidade");
const toolDescricao = document.getElementById("tool-descricao");
const toolIdLocal = document.getElementById("tool-id_local");
const addToolBtn = document.getElementById("add-tool-btn");
const saveBtn = document.getElementById("save-btn");
const cancelBtn = document.getElementById("cancel-btn");
const closeBtn = document.querySelector(".close-btn");
const notification = document.getElementById("notification");
const loadingOverlay = document.getElementById("loading-overlay");

const Ferramenta_GET = "http://localhost:8080/ferramentas/buscar";
const Ferramenta_POST = "http://localhost:8080/ferramentas/novaFerramenta";
const Ferramenta_PUT = "http://localhost:8080/ferramentas/editar";
const Ferramenta_DELETE = "http://localhost:8080/ferramentas/deletar";
const Ferramenta_GET_BY_QRCODE =
  "http://localhost:8080/ferramentas/buscarPorQrCode";

const locais_get = "http://localhost:8080/locais/buscar";

// QR Scanner - Modal e elementos
const qrScannerModal = document.createElement("div");
qrScannerModal.innerHTML = `
<div id="qr-scanner-modal" class="modal">
  <div class="modal-content" style="max-width: 600px;">
    <div class="modal-header">
      <h2>Escanear QR Code</h2>
      <button class="close-btn close-scan-btn">&times;</button>
    </div>
    <div class="modal-body">
      <div id="scanner-container" style="text-align: center;">
        <video id="qr-video" width="100%" height="300" style="border: 2px solid var(--primary-color); border-radius: 8px; background: #000;"></video>
        <div id="scan-result" style="margin: 15px 0; font-weight: bold; min-height: 24px;">Aguardando inicialização da câmera...</div>
        <canvas id="qr-canvas" style="display: none;"></canvas>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn" id="cancel-scan-btn">Cancelar</button>
    </div>
  </div>
</div>
`;

document.body.appendChild(qrScannerModal.firstElementChild);

// Variáveis do scanner
const videoElement = document.getElementById("qr-video");
const scanResultElement = document.getElementById("scan-result");
const canvasElement = document.getElementById("qr-canvas");
const context = canvasElement.getContext("2d");
let qrStream = null;
let isScanning = false;

// URL do seu backend Python para escanear QR Code
const QR_SCAN_API = "http://localhost:5000/read-qrcode";

// Cache de locais
let locaisCache = [];

// Função para mostrar notificação
function showNotification(message, isSuccess = true) {
  notification.textContent = message;
  notification.className = `notification ${isSuccess ? "success" : "error"}`;
  notification.classList.add("show");

  setTimeout(() => {
    notification.classList.remove("show");
  }, 3000);
}

// Mostrar/ocultar overlay de carregamento
function showLoading(show) {
  loadingOverlay.style.display = show ? "flex" : "none";
}

// Modificar o campo QR Code no formulário existente para adicionar botão de escanear
function setupQRCodeField() {
  const qrCodeField = document.getElementById("tool-qrcode");
  if (qrCodeField && !document.getElementById("start-scan-btn")) {
    const qrContainer = qrCodeField.parentElement;

    // Criar container para o campo QR Code com botão
    const newQrContainer = document.createElement("div");
    newQrContainer.className = "form-group";
    newQrContainer.innerHTML = `
        <label for="tool-qrcode">QR Code</label>
        <div style="display: flex; gap: 10px; align-items: center;">
            <input type="text" id="tool-qrcode" class="form-control" style="flex: 1;" />
            <button type="button" id="start-scan-btn" class="btn" style="white-space: nowrap;">
                <i class="fas fa-camera"></i> Escanear
            </button>
        </div>
    `;

    // Substituir o container antigo pelo novo
    qrContainer.parentNode.replaceChild(newQrContainer, qrContainer);

    // Adicionar event listener para o botão de escanear
    document
      .getElementById("start-scan-btn")
      .addEventListener("click", openQRScanner);
  }
}

// Nova função para buscar dados da ferramenta pelo QR Code
async function fetchToolDataByQRCode(qrCode) {
  try {
    showLoading(true);

    const response = await fetch(`${Ferramenta_GET_BY_QRCODE}/${qrCode}`);

    if (response.status === 404) {
      // Ferramenta não encontrada - modo de cadastro
      showNotification(
        "Ferramenta não encontrada. Preencha os dados para cadastrar.",
        false
      );

      // ✅ CORREÇÃO: NÃO limpa o campo QR Code, apenas os outros
      toolId.value = "";
      toolName.value = "";
      toolBrand.value = "";
      toolModel.value = "";
      toolEstado.value = "";
      toolDisponibilidade.checked = true;
      toolDescricao.value = "";
      toolIdLocal.value = "";

      // ✅ O CAMPO QR CODE JÁ ESTÁ PREENCHIDO - NÃO LIMPAR!

      // Muda o título do modal para cadastro
      modalTitle.textContent = "Cadastrar Nova Ferramenta";

      // Foca no primeiro campo para preenchimento
      toolName.focus();
    } else if (response.ok) {
      // Ferramenta encontrada - modo de edição
      const ferramenta = await response.json();

      // Preenche o formulário com os dados da ferramenta
      toolId.value = ferramenta.id;
      toolName.value = ferramenta.nome;
      toolBrand.value = ferramenta.marca;
      toolModel.value = ferramenta.modelo;
      toolEstado.value = ferramenta.estado;
      toolDisponibilidade.checked = ferramenta.disponibilidade;
      toolDescricao.value = ferramenta.descricao || "";
      toolIdLocal.value = ferramenta.id_local;

      // Muda o título do modal para edição
      modalTitle.textContent = "Editar Ferramenta";

      showNotification("Dados da ferramenta carregados automaticamente!", true);
    } else {
      throw new Error(`Erro HTTP ${response.status}`);
    }
  } catch (error) {
    console.error("Erro ao buscar dados da ferramenta:", error);
    showNotification("Erro ao carregar dados da ferramenta.", false);
  } finally {
    showLoading(false);
  }
}

// Função para inicializar o scanner com escaneamento automático
async function initializeQRScanner() {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error("Câmera não suportada neste dispositivo");
    }

    scanResultElement.textContent = "Solicitando permissão da câmera...";

    // Para dispositivos móveis, preferir câmera traseira
    const constraints = {
      video: {
        facingMode: "environment", // Preferir câmera traseira
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    };

    // Tenta acessar a câmera
    qrStream = await navigator.mediaDevices.getUserMedia(constraints);

    // Define o stream no elemento de vídeo
    videoElement.srcObject = qrStream;

    // Aguarda o vídeo estar pronto para reproduzir
    await new Promise((resolve) => {
      videoElement.onloadedmetadata = () => {
        videoElement
          .play()
          .then(resolve)
          .catch((error) => {
            console.error("Erro ao reproduzir vídeo:", error);
            resolve();
          });
      };
    });

    scanResultElement.textContent = "Câmera ativa. Procurando QR Code...";
    scanResultElement.style.color = "var(--primary-color)";

    // Inicia o escaneamento
    startAutoScan();
  } catch (error) {
    console.error("Erro ao acessar câmera:", error);

    // Tenta com configuração mais simples se a primeira falhar
    if (
      error.name === "OverconstrainedError" ||
      error.name === "ConstraintNotSatisfiedError"
    ) {
      try {
        scanResultElement.textContent = "Tentando configuração alternativa...";
        qrStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        videoElement.srcObject = qrStream;
        await videoElement.play();
        startAutoScan();
        return;
      } catch (fallbackError) {
        console.error("Configuração alternativa também falhou:", fallbackError);
      }
    }

    scanResultElement.textContent = "Erro: " + error.message;
    scanResultElement.style.color = "var(--accent-color)";
  }
}

// Função para escaneamento automático contínuo
function startAutoScan() {
  if (isScanning) return;

  isScanning = true;
  let scanAttempts = 0;

  const scanFrame = async () => {
    if (
      !isScanning ||
      !videoElement.videoWidth ||
      videoElement.readyState !== videoElement.HAVE_ENOUGH_DATA
    ) {
      // Se não estiver pronto, tenta novamente
      if (isScanning) {
        setTimeout(scanFrame, 500);
      }
      return;
    }

    try {
      scanAttempts++;

      // Configurar canvas com as dimensões do vídeo
      canvasElement.width = videoElement.videoWidth;
      canvasElement.height = videoElement.videoHeight;

      // Desenhar o frame atual do vídeo no canvas
      context.drawImage(
        videoElement,
        0,
        0,
        canvasElement.width,
        canvasElement.height
      );

      // Converter canvas para Blob
      canvasElement.toBlob(async (blob) => {
        if (!blob || !isScanning) return;

        try {
          // Criar FormData para enviar a imagem
          const formData = new FormData();
          formData.append("image", blob, "qrcode.png");

          console.log(
            `🔄 Tentativa ${scanAttempts}: Enviando imagem para escaneamento...`
          );

          // Enviar para o backend Python com timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);

          const response = await fetch(QR_SCAN_API, {
            method: "POST",
            body: formData,
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new Error(`Erro HTTP ${response.status}`);
          }

          const result = await response.json();
          console.log("📨 Resposta do backend:", result);

          if (result.success && result.qrCode) {
            // QR Code detectado com sucesso
            const qrCodeValue = result.qrCode;
            document.getElementById("tool-qrcode").value = qrCodeValue;

            // BUSCAR DADOS DA FERRAMENTA NO BANCO
            await fetchToolDataByQRCode(qrCodeValue);

            showNotification("QR Code escaneado com sucesso!", true);
            closeQRScanner();
          } else if (scanAttempts % 5 === 0) {
            // Atualizar status a cada 5 tentativas
            scanResultElement.textContent =
              result.error || "Procurando QR Code...";
          }
        } catch (error) {
          console.error("❌ Erro ao escanear QR Code:", error);
          if (scanAttempts % 5 === 0) {
            if (error.name === "AbortError") {
              scanResultElement.textContent = "Timeout: Servidor não respondeu";
            } else {
              scanResultElement.textContent = "Erro de conexão com o servidor";
            }
            scanResultElement.style.color = "var(--accent-color)";
          }
        }
      }, "image/png");
    } catch (error) {
      console.error("Erro na captura:", error);
    }

    // Continuar o escaneamento
    if (isScanning) {
      setTimeout(scanFrame, 1000);
    }
  };

  // Iniciar o primeiro escaneamento
  scanFrame();
}

// Abrir scanner
function openQRScanner() {
  const modal = document.getElementById("qr-scanner-modal");
  modal.style.display = "flex";
  scanResultElement.textContent = "Iniciando câmera...";
  scanResultElement.style.color = "inherit";

  // Limpa qualquer stream anterior
  if (qrStream) {
    qrStream.getTracks().forEach((track) => track.stop());
    qrStream = null;
  }

  // Limpa o vídeo
  videoElement.srcObject = null;

  initializeQRScanner();
}

// Fechar scanner
function closeQRScanner() {
  const modal = document.getElementById("qr-scanner-modal");
  modal.style.display = "none";

  isScanning = false;

  if (qrStream) {
    qrStream.getTracks().forEach((track) => track.stop());
    qrStream = null;
  }

  // Limpa o vídeo
  videoElement.srcObject = null;
}
// Modifique a função startAutoScan para ter melhor tratamento de erro
function startAutoScan() {
  if (isScanning) return;

  isScanning = true;
  let scanAttempts = 0;

  const scanFrame = async () => {
    if (!isScanning || !videoElement.videoWidth) return;

    try {
      scanAttempts++;

      // Configurar canvas com as dimensões do vídeo
      canvasElement.width = videoElement.videoWidth;
      canvasElement.height = videoElement.videoHeight;

      // Desenhar o frame atual do vídeo no canvas
      context.drawImage(
        videoElement,
        0,
        0,
        canvasElement.width,
        canvasElement.height
      );

      // Converter canvas para Blob
      canvasElement.toBlob(async (blob) => {
        if (!blob || !isScanning) return;

        try {
          // Criar FormData para enviar a imagem
          const formData = new FormData();
          formData.append("image", blob, "qrcode.png");

          console.log(
            `🔄 Tentativa ${scanAttempts}: Enviando imagem para escaneamento...`
          );

          // Enviar para o backend Python com timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout

          const response = await fetch(QR_SCAN_API, {
            method: "POST",
            body: formData,
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new Error(
              `Erro HTTP ${response.status}: ${await response.text()}`
            );
          }

          const result = await response.json();
          console.log("📨 Resposta do backend:", result);

          if (result.success && result.qrCode) {
            // QR Code detectado com sucesso
            const qrCodeValue = result.qrCode;
            document.getElementById("tool-qrcode").value = qrCodeValue;

            // BUSCAR DADOS DA FERRAMENTA NO BANCO
            await fetchToolDataByQRCode(qrCodeValue);

            showNotification("QR Code escaneado com sucesso!", true);
            closeQRScanner();
          } else if (scanAttempts % 5 === 0) {
            // Atualizar status a cada 5 tentativas
            scanResultElement.textContent =
              result.error || "Procurando QR Code...";
          }
        } catch (error) {
          console.error("❌ Erro ao escanear QR Code:", error);
          if (scanAttempts % 5 === 0) {
            if (error.name === "AbortError") {
              scanResultElement.textContent = "Timeout: Servidor não respondeu";
            } else {
              scanResultElement.textContent = "Erro de conexão com o servidor";
            }
            scanResultElement.style.color = "var(--accent-color)";
          }
        }
      }, "image/png");
    } catch (error) {
      console.error("Erro na captura:", error);
    }

    // Continuar o escaneamento
    if (isScanning) {
      setTimeout(scanFrame, 1000); // Escanear a cada 1 segundo
    }
  };

  // Iniciar o primeiro escaneamento
  scanFrame();
}
// Abrir scanner
function openQRScanner() {
  const modal = document.getElementById("qr-scanner-modal");
  modal.style.display = "flex";
  scanResultElement.textContent = "Iniciando câmera...";
  scanResultElement.style.color = "inherit";
  initializeQRScanner();
}

// Fechar scanner
function closeQRScanner() {
  const modal = document.getElementById("qr-scanner-modal");
  modal.style.display = "none";

  isScanning = false;

  if (qrStream) {
    qrStream.getTracks().forEach((track) => track.stop());
    qrStream = null;
  }
}

// Função para carregar locais
async function loadLocais() {
  try {
    // Mostrar estado de carregamento
    toolIdLocal.innerHTML =
      '<option value="">Carregando locais... <span class="loading"></span></option>';

    const response = await fetch(locais_get);
    if (!response.ok) throw new Error("Erro ao carregar locais");

    const locais = await response.json();
    locaisCache = locais; // Armazenar em cache

    return locais;
  } catch (error) {
    console.error("Erro ao carregar locais:", error);
    toolIdLocal.innerHTML = '<option value="">Erro ao carregar locais</option>';
    showNotification("Erro ao carregar locais", false);
    return [];
  }
}

// Função para preencher o select de locais com o cache
function fillLocaisSelect() {
  toolIdLocal.innerHTML = '<option value="">Selecione um local...</option>';
  locaisCache.forEach((local) => {
    const option = document.createElement("option");
    option.value = local.id;
    option.textContent = local.nomeEspaco;
    toolIdLocal.appendChild(option);
  });
}

// Função para carregar ferramentas
async function loadFerramentas() {
  try {
    const response = await fetch(Ferramenta_GET);
    if (!response.ok) throw new Error("Erro ao carregar ferramentas");
    return await response.json();
  } catch (error) {
    console.error("Erro ao carregar ferramentas:", error);
    showNotification("Erro ao carregar ferramentas", false);
    return [];
  }
}

// Função para criar card de ferramenta (mobile)
function createToolCard(ferramenta, nomeLocal) {
  const card = document.createElement("div");
  card.className = "tool-card";

  card.innerHTML = `
        <div class="card-header">
          <div class="card-title">${ferramenta.nome}</div>
          <div class="card-badge">ID: ${ferramenta.id}</div>
        </div>
        
        <div class="card-details">
          <div class="card-detail">
            <span class="detail-label">Marca:</span>
            <span class="detail-value">${ferramenta.marca}</span>
          </div>
          
          <div class="card-detail">
            <span class="detail-label">Modelo:</span>
            <span class="detail-value">${ferramenta.modelo}</span>
          </div>
          
          <div class="card-detail">
            <span class="detail-label">QR Code:</span>
            <span class="detail-value">${ferramenta.qrcode || "N/A"}</span>
          </div>
          
          <div class="card-detail">
            <span class="detail-label">Estado:</span>
            <span class="detail-value">${ferramenta.estado}</span>
          </div>
          
          <div class="card-detail">
            <span class="detail-label">Disponível:</span>
            <span class="detail-value ${
              ferramenta.disponibilidade
                ? "status-available"
                : "status-unavailable"
            }">
              ${ferramenta.disponibilidade ? "Sim" : "Não"}
            </span>
          </div>
          
          <div class="card-detail">
            <span class="detail-label">Local:</span>
            <span class="detail-value">${nomeLocal}</span>
          </div>
          
          <div class="card-detail" style="grid-column: span 2;">
            <span class="detail-label">Descrição:</span>
            <span class="detail-value">
              ${
                ferramenta.descricao
                  ? ferramenta.descricao.substring(0, 50) +
                    (ferramenta.descricao.length > 50 ? "..." : "")
                  : "N/A"
              }
            </span>
          </div>
        </div>
        
        <div class="card-actions">
          <button class="card-action card-edit" data-id="${ferramenta.id}">
            <i class="fas fa-edit"></i> Editar
          </button>
          <button class="card-action card-delete" data-id="${ferramenta.id}">
            <i class="fas fa-trash-alt"></i> Excluir
          </button>
        </div>
      `;

  return card;
}

// Função para carregar ferramentas na tabela e cards
async function loadToolsTable() {
  showLoading(true);

  try {
    const ferramentas = await loadFerramentas();
    toolsTableBody.innerHTML = "";
    toolsCards.innerHTML = "";

    if (ferramentas.length === 0) {
      toolsTableBody.innerHTML = `
            <tr>
              <td colspan="10" style="text-align: center; padding: 30px;">
                <i class="fas fa-info-circle" style="font-size: 3rem; color: #6c757d; margin-bottom: 15px;"></i>
                <p>Nenhuma ferramenta cadastrada</p>
              </td>
            </tr>
          `;

      toolsCards.innerHTML = `
            <div class="tool-card" style="text-align: center; padding: 30px;">
              <i class="fas fa-info-circle" style="font-size: 3rem; color: #6c757d; margin-bottom: 15px;"></i>
              <p>Nenhuma ferramenta cadastrada</p>
            </div>
          `;

      return;
    }

    ferramentas.forEach((ferramenta) => {
      // Obter o nome do local corretamente
      const nomeLocal = ferramenta.local?.nomeEspaco || "Local não encontrado";

      // Criar linha da tabela (desktop)
      const row = document.createElement("tr");
      row.innerHTML = `
            <td>${ferramenta.id}</td>
            <td>${ferramenta.nome}</td>
            <td>${ferramenta.marca}</td>
            <td>${ferramenta.modelo}</td>
            <td>${ferramenta.qrcode || "N/A"}</td>
            <td>${ferramenta.estado}</td>
            <td class="${
              ferramenta.disponibilidade
                ? "status-available"
                : "status-unavailable"
            }">
              ${ferramenta.disponibilidade ? "Sim" : "Não"}
            </td>
            <td>${
              ferramenta.descricao
                ? ferramenta.descricao.substring(0, 20) +
                  (ferramenta.descricao.length > 20 ? "..." : "")
                : "N/A"
            }</td>
            <td>${ferramenta.nomeLocal}</td>
            <td class="action-buttons-cell">
              <button class="btn-action btn-edit" data-id="${ferramenta.id}">
                <i class="fas fa-edit"></i> Editar
              </button>
              <button class="btn-action btn-delete" data-id="${ferramenta.id}">
                <i class="fas fa-trash-alt"></i> Excluir
              </button>
            </td>
          `;
      toolsTableBody.appendChild(row);

      // Criar card (mobile)
      const card = createToolCard(ferramenta, nomeLocal);
      toolsCards.appendChild(card);
    });

    // Adicionar event listeners para os botões (tabela)
    document.querySelectorAll(".btn-edit").forEach((btn) => {
      btn.addEventListener("click", function () {
        const id = this.getAttribute("data-id");
        openEditToolModal(id);
      });
    });

    document.querySelectorAll(".btn-delete").forEach((btn) => {
      btn.addEventListener("click", function () {
        const id = this.getAttribute("data-id");
        deleteTool(id);
      });
    });

    // Adicionar event listeners para os botões (cards)
    document.querySelectorAll(".card-edit").forEach((btn) => {
      btn.addEventListener("click", function () {
        const id = this.getAttribute("data-id");
        openEditToolModal(id);
      });
    });

    document.querySelectorAll(".card-delete").forEach((btn) => {
      btn.addEventListener("click", function () {
        const id = this.getAttribute("data-id");
        deleteTool(id);
      });
    });
  } catch (error) {
    console.error("Erro ao carregar ferramentas:", error);
    showNotification("Erro ao carregar ferramentas", false);
  } finally {
    showLoading(false);
  }
}

// Função de pesquisa
function searchTools() {
  const searchTerm = searchInput.value.toLowerCase();

  // Filtrar tabela
  const rows = toolsTableBody.querySelectorAll("tr");
  rows.forEach((row) => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(searchTerm) ? "" : "none";
  });

  // Filtrar cards
  const cards = toolsCards.querySelectorAll(".tool-card");
  cards.forEach((card) => {
    const text = card.textContent.toLowerCase();
    card.style.display = text.includes(searchTerm) ? "" : "none";
  });
}

// Funções do modal
async function openAddToolModal() {
  toolForm.reset();
  toolId.value = "";
  toolDisponibilidade.checked = true;
  modalTitle.textContent = "Adicionar Nova Ferramenta";
  toolModal.style.display = "flex";

  // Configurar campo QR Code com botão de escanear
  setupQRCodeField();

  // Preencher o select de locais com o cache
  fillLocaisSelect();
}

async function openEditToolModal(id) {
  try {
    showLoading(true);
    const response = await fetch(`${Ferramenta_GET}/${id}`);
    if (!response.ok) throw new Error("Erro ao carregar ferramenta");

    const ferramenta = await response.json();

    // Configurar campo QR Code com botão de escanear
    setupQRCodeField();

    // Preencher o select de locais com o cache
    fillLocaisSelect();

    // Preencher formulário
    toolId.value = ferramenta.id;
    toolName.value = ferramenta.nome;
    toolBrand.value = ferramenta.marca;
    toolModel.value = ferramenta.modelo;
    toolQrcode.value = ferramenta.qrcode || "";
    toolEstado.value = ferramenta.estado;
    toolDisponibilidade.checked = ferramenta.disponibilidade;
    toolDescricao.value = ferramenta.descricao || "";

    // Selecionar o local correto
    toolIdLocal.value = ferramenta.id_local;

    modalTitle.textContent = "Editar Ferramenta";
    toolModal.style.display = "flex";
  } catch (error) {
    console.error("Erro ao carregar ferramenta:", error);
    showNotification("Não foi possível carregar os dados da ferramenta", false);
  } finally {
    showLoading(false);
  }
}

function closeModal() {
  toolModal.style.display = "none";
}

async function saveTool() {
  // Validar campos OBRIGATORIO
  if (
    !toolName.value ||
    !toolBrand.value ||
    !toolModel.value ||
    !toolEstado.value ||
    !toolIdLocal.value
  ) {
    showNotification("Preencha todos os campos obrigatórios!", false);
    return;
  }

  // ✅✅✅ CORREÇÃO AQUI - Garantir que o QR Code seja enviado
  const qrcodeValue = document.getElementById("tool-qrcode").value;

  const toolData = {
    nome: toolName.value,
    marca: toolBrand.value,
    modelo: toolModel.value,
    qrcode: qrcodeValue, // ✅ AGORA está pegando o valor correto
    estado: toolEstado.value,
    disponibilidade: toolDisponibilidade.checked,
    descricao: toolDescricao.value || null,
    id_local: toolIdLocal.value,
  };

  // ✅ DEBUG: Verifique se o QR Code está no objeto
  console.log("📤 Dados enviados para salvar:", toolData);

  try {
    showLoading(true);
    let response;
    const method = toolId.value ? "PUT" : "POST";
    const url = toolId.value
      ? `${Ferramenta_PUT}/${toolId.value}`
      : Ferramenta_POST;

    response = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(toolData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro HTTP ${response.status}: ${errorText}`);
    }

    // Verificar se a resposta é JSON válido
    const contentType = response.headers.get("content-type");
    const result = contentType?.includes("application/json")
      ? await response.json()
      : await response.text();

    // ✅ DEBUG: Verifique a resposta
    console.log("📥 Resposta do servidor:", result);

    showNotification(
      toolId.value
        ? "Ferramenta atualizada com sucesso!"
        : "Ferramenta cadastrada com sucesso!",
      true
    );
    await loadToolsTable();
    closeModal();
  } catch (error) {
    console.error("Erro ao salvar ferramenta:", error);
    showNotification(`Erro ao salvar ferramenta: ${error.message}`, false);
  } finally {
    showLoading(false);
  }
}

// Função para excluir ferramenta
async function deleteTool(id) {
  if (confirm("Tem certeza que deseja excluir esta ferramenta?")) {
    try {
      showLoading(true);
      const response = await fetch(`${Ferramenta_DELETE}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro HTTP ${response.status}: ${errorText}`);
      }

      showNotification("Ferramenta excluída com sucesso!", true);
      await loadToolsTable();
    } catch (error) {
      console.error("Erro ao excluir ferramenta:", error);
      showNotification(
        `Não foi possível excluir a ferramenta: ${error.message}`,
        false
      );
    } finally {
      showLoading(false);
    }
  }
}

// Event Listeners
addToolBtn.addEventListener("click", openAddToolModal);
saveBtn.addEventListener("click", saveTool);
cancelBtn.addEventListener("click", closeModal);
closeBtn.addEventListener("click", closeModal);
searchInput.addEventListener("input", searchTools);

// Event listeners para QR Scanner
document
  .getElementById("cancel-scan-btn")
  .addEventListener("click", closeQRScanner);
document
  .querySelector(".close-scan-btn")
  .addEventListener("click", closeQRScanner);

// Fechar modal ao clicar fora do conteúdo
window.addEventListener("click", (e) => {
  if (e.target === toolModal) {
    closeModal();
  }
  if (e.target === document.getElementById("qr-scanner-modal")) {
    closeQRScanner();
  }
});

// Tecla ESC para fechar modais
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    if (toolModal.style.display === "flex") {
      closeModal();
    }
    if (document.getElementById("qr-scanner-modal").style.display === "flex") {
      closeQRScanner();
    }
  }
});

// Inicializa a tabela e carrega locais quando a página carregar
document.addEventListener("DOMContentLoaded", async function () {
  showLoading(true);
  try {
    // Configurar campo QR Code
    setupQRCodeField();

    // Carregar locais primeiro
    await loadLocais();
    // Preencher o select de locais
    fillLocaisSelect();
    // Carregar ferramentas depois
    await loadToolsTable();
  } catch (error) {
    console.error("Erro na inicialização:", error);
    showNotification("Erro ao carregar dados iniciais", false);
  } finally {
    showLoading(false);
  }
});
