const video = document.getElementById("video");
const mensagem = document.getElementById("mensagem");
const feedback = document.getElementById("feedback");
let recognitionInterval;
let isProcessing = false;

// Função para exibir mensagens de feedback
function showFeedback(tipo, mensagemTexto) {
  if (!feedback) return;

  feedback.textContent = mensagemTexto;
  feedback.className = "feedback " + tipo;
  feedback.style.display = "block";

  setTimeout(() => {
    feedback.style.opacity = 0;
    feedback.style.transform = "translateX(120%)";
    setTimeout(() => {
      feedback.style.display = "none";
    }, 400);
  }, 5000);
}

// Função para mostrar/ocultar o loading
function toggleLoading(show) {
  const loadingOverlay = document.querySelector(".loading-overlay");
  if (loadingOverlay) {
    loadingOverlay.style.display = show ? "grid" : "none";
  }
}

async function iniciarCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 640 },
        height: { ideal: 640 },
        facingMode: "user",
      },
    });
    video.srcObject = stream;
    mensagem.textContent = "Câmera ativada, aguardando reconhecimento...";

    // Iniciar o reconhecimento facial após a câmera estar funcionando
    setTimeout(iniciarReconhecimentoFacial, 1000);
  } catch (error) {
    mensagem.textContent = "Não foi possível ativar a câmera.";
    console.error("Erro ao acessar câmera:", error);
    showFeedback("error", "Erro ao acessar a câmera. Verifique as permissões.");
  }
}

function iniciarReconhecimentoFacial() {
  // Parar qualquer intervalo anterior
  if (recognitionInterval) {
    clearInterval(recognitionInterval);
  }

  // Verificar a cada 3 segundos
  recognitionInterval = setInterval(() => {
    if (!isProcessing) {
      capturarEReconhecer();
    }
  }, 10000);
}

function capturarEReconhecer() {
  if (isProcessing) return;

  isProcessing = true;
  mensagem.textContent = "Processando reconhecimento...";

  // Criar um canvas para capturar o frame atual
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d");

  // Desenhar a imagem do vídeo no canvas
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  // Converter para base64
  const imageData = canvas.toDataURL("image/jpeg");

  // Enviar para o servidor para reconhecimento
  reconhecerFace(imageData);
}

function reconhecerFace(imageData) {
  toggleLoading(true);

  // Código real para enviar para a API (descomente quando a API estiver disponível)

  fetch("http://localhost:5005/face-login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ imagem: imageData }),
  })
    .then((response) => response.json())
    .then((data) => {
      toggleLoading(false);
      isProcessing = false;

      if (data.authenticated) {
        mensagem.textContent = `Bem-vindo, ${data.user}!`;
        showFeedback(
          "success",
          `Login realizado com sucesso! Bem-vindo, ${data.user}.`
        );

        // Redirecionar após login bem-sucedido
        setTimeout(() => {
          window.location.href = "../ListaAluno/ListUsuário.html";
        });
      } else {
        mensagem.textContent =
          data.message || "Usuário não reconhecido. Tente novamente.";
        showFeedback(
          "error",
          data.message || "Usuário não reconhecido. Por favor, tente novamente."
        );
      }
    })
    .catch((error) => {
      toggleLoading(false);
      isProcessing = false;
      console.error("Erro:", error);
      mensagem.textContent = "Erro no reconhecimento. Tente novamente.";
      showFeedback("error", "Erro de conexão com o servidor. Tente novamente.");
    });
}

// Iniciar a câmera quando a página carregar
window.addEventListener("load", iniciarCamera);

// Parar a câmera quando a página for fechada
window.addEventListener("beforeunload", () => {
  if (recognitionInterval) {
    clearInterval(recognitionInterval);
  }

  if (video.srcObject) {
    const tracks = video.srcObject.getTracks();
    tracks.forEach((track) => track.stop());
  }
});
