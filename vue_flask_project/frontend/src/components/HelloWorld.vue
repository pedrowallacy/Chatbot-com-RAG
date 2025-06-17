<template>
  <div class="chat-container">
    <div class="chat-history" ref="chatHistory">
      <div v-if="showWelcome" class="welcome-center">
        <div class="welcome-banner">
          <h2>Olá{{ nomeAssistente ? `, sou  o assistente ${nomeAssistente}` : '' }}!</h2>
          <p>Como posso ajudá-lo hoje?</p>
        </div>
        <div class="input-container centered-input">
          <div class="input-inner">
            <textarea
  v-model="pergunta"          
  :disabled="loading || typingIndex !== null"
  placeholder="Digite sua pergunta"
  @input="autoResize"
  @keydown.enter.prevent="enviarPergunta"
  @keydown.enter.shift="null"
  rows="1"
  class="chat-textarea"
/>
            <button 
              @click="typingIndex !== null ? togglePause() : enviarPergunta()" 
              :disabled="loading"
            >
              {{ typingIndex !== null ? '⏸️' : 'Enviar' }}
            </button>
          </div>
        </div>
      </div>
      <template v-else>
        <div
          v-for="(msg, index) in historico"
          :key="index"
          :class="['chat-message', msg.role]"
        >
          <div class="message-container">
            <div class="chat-bubble-container">
              <button 
                v-if="msg.role === 'user'"
                @click="startEditing(index, msg.content)"
                class="edit-btn"
              >
                ✎
              </button>
              <div class="bubble-content">
                <!-- Nome do assistente só para mensagens do assistente -->
                <p v-if="msg.role === 'assistant'" class="chat-author">{{ nomeAssistente }}</p>
                <div class="chat-bubble">
                  <template v-if="msg.role === 'assistant' && loading && index === historico.length - 1">
                    <div class="loading-indicator">
                      <span class="spinner"></span>
                      <span class="loading-text">Pensando...</span>
                    </div>
                  </template>
                  <template v-else-if="msg.role === 'assistant' && typingIndex === index">
                    {{ typingContent }}
                  </template>
                  <template v-else>
                    <template v-if="editingMessageIndex === index && msg.role === 'user'">
                      <textarea
                        v-model="editingContent"
                        class="edit-textarea"
                        @keydown.enter.prevent="saveEdit(index)"
                      ></textarea>
                      <button @click="saveEdit(index)" class="control-btn">✓</button>
                    </template>
                    <template v-else>
                      {{ msg.content }}
                    </template>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
    <div v-if="!showWelcome" class="input-container">
      <div class="input-inner">
        <textarea
          v-model="pergunta"
          :disabled="loading || typingIndex !== null"
          placeholder="Digite sua pergunta"
          @input="autoResize"
          @keydown.enter.prevent="enviarPergunta"
          @keydown.enter.shift="null"
          rows="1"
          class="chat-textarea"
        />
        <button 
          @click="typingIndex !== null ? togglePause() : enviarPergunta()" 
          :disabled="loading"
        >
          {{ typingIndex !== null ? '⏸️' : 'Enviar' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, watchEffect, computed } from 'vue'

const pergunta = ref('')
const resposta = ref('')
const historico = ref([])
const chatHistory = ref(null)
const loading = ref(false)
const isPaused = ref(false)
const editingMessageIndex = ref(null)
const editingContent = ref('')

// --- Correção: tornar assistenteParam e rota reativos ---
const assistenteParam = ref(new URLSearchParams(window.location.search).get('assistente') || 'legislador')
const rota = computed(() => assistenteParam.value === 'pedro' ? 'suporte pedro' : 'suporte')

// Atualiza assistenteParam se a URL mudar (ex: usuário muda o parâmetro na barra de endereços)
window.addEventListener('popstate', () => {
  assistenteParam.value = new URLSearchParams(window.location.search).get('assistente') || 'legislador'
})

const nomeAssistente = ref('Assistente')
watchEffect(async () => {
  try {
    const res = await fetch(`http://localhost:5000/assistant_name/${rota.value}`)
    const data = await res.json()
    if (data.name) nomeAssistente.value = data.name
    else nomeAssistente.value = 'Assistente'
  } catch (e) {
    nomeAssistente.value = 'Assistente'
  }
})

// Typing effect state
const typingIndex = ref(null)
const typingContent = ref('')
let typingTimeout = null

const typeText = async (fullText, msgIndex) => {
  typingContent.value = ''
  typingIndex.value = msgIndex
  let i = 0
  function typeChar() {
    if (typingIndex.value !== msgIndex) return
    if (i <= fullText.length && !isPaused.value) {
      typingContent.value = fullText.slice(0, i)
      historico.value[msgIndex].content = typingContent.value
      i++
      typingTimeout = setTimeout(typeChar, 18)
    } else if (i <= fullText.length) {
      typingTimeout = setTimeout(typeChar, 100) // Continua checando se foi despausado
    } else {
      typingIndex.value = null
      typingContent.value = ''
    }
  }
  typeChar()
}

const togglePause = () => {
  isPaused.value = true;
  if (typingTimeout) {
    clearTimeout(typingTimeout);
  }
  // Reseta os estados de digitação
  typingIndex.value = null;
  typingContent.value = '';
  // Atualiza o conteúdo da última mensagem
  if (historico.value.length > 0) {
    const lastMsg = historico.value[historico.value.length - 1];
    lastMsg.content = typingContent.value;
  }
}

const startEditing = (index, content) => {
  editingMessageIndex.value = index
  editingContent.value = content
}

const saveEdit = (index) => {
  if (editingContent.value.trim()) {
    historico.value[index].content = editingContent.value
  }
  editingMessageIndex.value = null
  editingContent.value = ''
}

const autoResize = (e) => {
  const ta = e.target;
  ta.style.height = 'auto';
  ta.style.height = ta.scrollHeight + 'px';
};


const showWelcome = computed(() => {
  // Esconde se houver pelo menos uma mensagem do usuário
  return !historico.value.some(msg => msg.role === 'user')
})

// Altere aqui para chamar o assistente "suporte pedro"
const enviarPergunta = async () => {
  if (!pergunta.value.trim()) return
  const perguntaAtual = pergunta.value.trim();
  historico.value.push({ role: 'user', content: perguntaAtual })
  pergunta.value = ''

  // Resetar altura do textarea após limpar
  await nextTick(() => {
    const ta = document.querySelector('.chat-textarea');
    if (ta && !ta.value) {
      ta.style.height = '44px';
      ta.scrollTop = 0;
    }
  });

  loading.value = true
  historico.value.push({ role: 'assistant', content: '' })

  await nextTick(() => {
    if (chatHistory.value) {
      chatHistory.value.scrollTop = chatHistory.value.scrollHeight
    }
  })

  // Use a rota reativa
  const res = await fetch(`http://localhost:5000/chat/${rota.value}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({ pergunta: perguntaAtual }),
    credentials: 'include'
  });

  const data = await res.json()
  loading.value = false
  await typeText(data.resposta, historico.value.length - 1)

  await nextTick(() => {
    if (chatHistory.value) {
      chatHistory.value.scrollTop = chatHistory.value.scrollHeight
    }
  })
}
</script>

<style scoped>

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  height: 100%;
  background: #343541;
  font-family: 'Arial', 'Segoe UI', 'Roboto', sans-serif;
  color: #626298;
  overflow: hidden;
}

#app {
  width: 100%;
  height: 100%;
}

.chat-container {
  align-items: end;
  position: fixed;
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;      
  background: url("/backgroud_login.png") no-repeat center center;
  background-size: cover;
   left: 0;
  top: 0;
   margin: 0;
  padding: 0;
}

.chat-history::-webkit-scrollbar-thumb {
  background: transparent;
  border-radius: 50px;
}

.chat-history {
  position: relative;
  display: flex;
  align-items: stretch;
  flex: 1;
  overflow-y: auto;
  padding:  0 0 120px 0;
  padding-bottom: 120px;
  display: flex;
  flex-direction: column;
  gap: 0;
  width: 100%; 
  box-sizing: border-box;
  scrollbar-width: thin;
  scrollbar-color: #a8a8a4;
  min-height: 0;
  margin: 0;
}

.chat-history::-webkit-scrollbar {
  width: 24px !important;
  min-width: 24px !important;
  max-width: 24px !important;
  background: transparent;
}

.chat-message {
  display: flex;
  flex-direction: column;
  max-width: 60%;
  width: 100%;
  margin-top: 18px;
}

.chat-message.user {
  align-items: flex-end;
  margin-left: auto;
  margin-right: auto;
}

.chat-message.assistant {
  align-items: flex-start;
  margin-left: auto;
  margin-right: auto;
}

.chat-bubble-container {
  display: flex;
  flex-direction: row; /* Ícone à esquerda, mensagem à direita */
  align-items: center;
  gap: 8px;
}

.chat-message.user .chat-bubble-container {
  flex-direction: row; /* Ícone à esquerda, mensagem à direita */
}

.bubble-content {
  flex: 1;
}

.chat-bubble {
  background: #b09821;
  color: #211f1a;
  border-radius: 12px;
  padding: 18px 24px;
  word-break: break-word;
  font-size: 1.08em;
  line-height: 1.7;
  border: 1.5px solid #e6c200;
  box-shadow: 0 2px 8px rgba(191, 160, 70, 0.10);
}

.chat-message.assistant .chat-bubble {
  margin-right: 20px;
  background: #fffbe6;
  color: #7a6a2f;
  border: 1.5px solid #e6c200;
}

.chat-message.user .chat-bubble {
  margin-left: 20px;
  background: #f7d774;
  color: #7a6a2f;
  border-radius: 12px;
  border: 1.5px solid #e6c200;
  box-shadow: 0 2px 8px rgba(191, 160, 70, 0.10);
}

/*container de entrada*/
.input-container {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  background: transparent;
  box-shadow: none;
  z-index: 1000;
  gap: 80px;
  margin-top: auto;
  border-top: none;
}

.input-container:not(.centered-input) {
  flex-direction: column-reverse;
  align-items: center;
  display: flex;
}

.input-container:not(.centered-input) .chat-textarea {
  min-height: 44px;
  max-height: 180px !important;
  overflow-y: auto;
  resize: none;
  height: auto;
}

/*entrada da pergunta*/
.input-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 820px;
  background: #fffbe6;
  border-radius: 24px;
  padding: 10px 20px;
  box-shadow: 0 2px 12px 0 rgba(191, 160, 70, 0.10);
  gap: none;
  border: 1.5px solid #e6c200;
}

/*entrada da pergunta*/
.input-inner input {
  flex: 100%;
  height: 44px;
  background: transparent;
  border: none;
  color: #7a6a2f;
  font-size: 1.13em;
  outline: none;
  padding: 10px 12px;
  resize: none;
  font-family: inherit;
}

/*input da pergunta*/
.input-inner input::placeholder {
  color: #bfa046;
  opacity: 0.7;
  font-size: 1.13em;
  font-family: inherit;
  font-weight: 100;
}

/*botão de enviar*/
.input-inner button {
  background: #e6c200;
  border: none;
  color: #fff;
  border-radius: 24px;
  min-width: 90px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s;
  font-size: 1.15em;
  box-shadow: 0 2px 8px rgba(191, 160, 70, 0.10);
  padding: 0 24px;
  font-weight: 600;
  white-space: nowrap;
}

/*botão de enviar*/
.input-inner button:hover {
  background: #bfa046;
  color: #fffbe6;
}

/* Exemplo para mudar só no chat: */
.chat-container, .chat-history, .chat-message, .chat-bubble, .input-inner, .input-inner input, .input-inner button {
  font-family: 'Arial', 'Segoe UI', 'Roboto', sans-serif;
}

.loading-indicator {
  display: flex;
  align-items: center;
  background: none !important;
  border: none !important;
  box-shadow: none !important;
  padding: 0 !important;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top-color: #e6c200;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  display: inline-block;
}

.loading-text {
  color: #7a6a2f;
  font-size: 1em;
  margin-left: 10px;
  display: inline-block;
}

.chat-bubble > .spinner,
.chat-bubble > .loading-text {
  background: none !important;
  box-shadow: none !important;
  border: none !important;
  padding: 0 !important;
  margin: 0 !important;
}

.chat-bubble .loading-indicator {
  background: none;
  box-shadow: none;
  border: none;
}

.chat-message.assistant .chat-bubble:has(.spinner) {
  background: none !important;
  border: none !important;
  box-shadow: none !important;
  padding: 0 !important;
}

.welcome-banner {
  width: 100%;
  max-width: 700px;
  margin: 250px auto 0 auto;
  padding: 32px 24px 18px 24px;
  background: none;
  border-radius: 24px;
  box-shadow:none;
  text-align: center;
  border: none;
}

.welcome-banner h2 {
  margin: 0 0 8px 0;
  color: #b09821;
  font-size: 2em;
  font-weight: 700;
}

.welcome-banner p {
  margin: 0;
  color: #7a6a2f;
  font-size: 1.18em;
  font-weight: 500;
}

.centered-input {
  position: static !important;
  margin: 100px auto 50 auto !important;
  left: 50px;
  right: 50px;
  bottom: auto;
  top: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
  background: transparent;
  box-shadow: none;
  padding: 0;
  transform:none;
  width: 100%;
}

.chat-textarea {
  flex: 1;
  background: transparent;
  border: none;
  color: #7a6a2f;
  font-size: 1.13em;
  outline: none;
  padding: 0 8px;
  font-family: inherit;
  resize: none;
  min-height: 44px;
  max-height: 180px;
  line-height: 2.5;
  overflow-y: auto;
}

.chat-textarea::-webkit-scrollbar {
  width: 20px;
  background: transparent;
}

.chat-textarea::-webkit-scrollbar-thumb {
  background: #e6c20033; /* dourado translúcido */
  border-radius: -100px;
}

.chat-textarea {
  scrollbar-width: thick;
  scrollbar-color: #e6c20033 transparent;
}

.centered-input .chat-textarea {
  min-height: 44px;
  max-height: 180px;
  resize: none;
  overflow-y: auto;
}

.chat-textarea:empty,
.chat-textarea:placeholder-shown {
  overflow-y: hidden !important;
}

.control-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  margin-left: 8px;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.control-btn:hover {
  opacity: 1;
}

.edit-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  opacity: 0;
  transition: opacity 0.2s;
  color: #7a6a2f;
  font-size: 1.2em;
  align-self: flex-start;
  margin-top: 0;
  flex-shrink: 0;
}

.chat-message.user:hover .edit-btn {
  opacity: 0.7;
}

.edit-btn:hover {
  opacity: 1;
}

.edit-textarea {
  width: 100%;
  min-height: 44px;
  padding: 8px;
  border: 1px solid #e6c200;
  border-radius: 8px;
  background: #fffbe6;
  color: #7a6a2f;
  font-family: inherit;
  font-size: inherit;
  resize: vertical;
}

.chat-author {
  color: #b09821;
  font-size: 0.98em;
  font-weight: 700;
  margin-bottom: 2px;
  margin-left: 8px;
  margin-top: 0;
  text-align: left;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}</style>