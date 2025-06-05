<template>
  <div class="chat-container">
    
    <div class="chat-history" ref="chatHistory">
      <div class="welcome-banner"  v-if="showWelcome">
  <h2>Olá{{ nomeAssistente ? `, sou  o assistente ${nomeAssistente}` : '' }}!</h2>
  <p>Como posso ajudá-lo hoje?</p>
</div>
      <div
        v-for="(msg, index) in historico"
        :key="index"
        :class="['chat-message', msg.role]"
      >
        <p class="chat-author">{{ msg.role === 'user' ? 'Você' : nomeAssistente }}</p>
        <div class="chat-bubble">
          <template v-if="msg.role === 'assistant' && loading && index === historico.length - 1">
            <div class="loading-indicator">
              <span class="spinner"></span>
              <span class="loading-text">Aguarde...</span>
            </div>
          </template>
          <template v-else-if="msg.role === 'assistant' && typingIndex === index">
            {{ typingContent }}<span v-if="typingContent.length < msg.content.length">|</span>
          </template>
          <template v-else>
            {{ msg.content }}
          </template>
        </div>
      </div>
    </div>
    <div :class="['input-container', { 'centered-input': showWelcome }]">
      <div class="input-inner">
        <textarea
  v-model="pergunta"
  :disabled="loading || typingIndex !== null"
  placeholder="Digite sua pergunta"
  @input="autoResize"
  @keyup.enter.exact="enviarPergunta"
  rows="1"
  class="chat-textarea"/>
        <button @click="enviarPergunta" :disable="loading || typingIndex !== null">Enviar</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue'
import { computed } from 'vue'

const pergunta = ref('')
const resposta = ref('')
const historico = ref([])
const chatHistory = ref(null)
const loading = ref(false)

const autoResize = (e) => {
  const ta = e.target;
  ta.style.height = 'auto';
  ta.style.height = ta.scrollHeight + 'px';
};


const showWelcome = computed(() => {
  // Esconde se houver pelo menos uma mensagem do usuário
  return !historico.value.some(msg => msg.role === 'user')
})


// Nome dinâmico do assistente
const nomeAssistente = ref('Assistente')

onMounted(async () => {
  try {
    const res = await fetch('http://localhost:5000/assistant_name/suporte')
    const data = await res.json()
    if (data.name) nomeAssistente.value = data.name
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
    if (typingIndex.value !== msgIndex) return // Prevent race conditions
    if (i <= fullText.length) {
      typingContent.value = fullText.slice(0, i)
      historico.value[msgIndex].content = typingContent.value
      i++
      typingTimeout = setTimeout(typeChar, 18) // typing speed
    } else {
      typingIndex.value = null
      typingContent.value = ''
    }
  }
  typeChar()
}

const enviarPergunta = async () => {
  if (!pergunta.value.trim()) return
  historico.value.push({ role: 'user', content: pergunta.value })
  const perguntaAtual = pergunta.value
  pergunta.value = '' // Limpa o input imediatamente
  loading.value = true
  historico.value.push({ role: 'assistant', content: '' })

  await nextTick(() => {
    if (chatHistory.value) {
      chatHistory.value.scrollTop = chatHistory.value.scrollHeight
    }
  })

  const res = await fetch('http://localhost:5000/chat/suporte', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({ pergunta: perguntaAtual }),
    credentials: 'include'
  })

  const data = await res.json()
  loading.value = false
  // Typing effect for assistant
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

.chat-author {
  font-size: 0.85em;
  color: #8e8ea0;
  margin-bottom: 2px;
  margin-left: 6px;
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
  z-index: 100;
  gap: 8px;
  margin-top: auto;
  border-top: none;
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
  gap: 10px;
  border: 1.5px solid #e6c200;
}

/*entrada da pergunta*/
.input-inner input {
  flex: 1;
  background: transparent;
  border: none;
  color: #7a6a2f;
  font-size: 1.13em;
  outline: none;
  padding: 0;
  font-family: inherit;
}

/*input da pergunta*/
.input-inner input::placeholder {
  color: #bfa046;
  opacity: 0.7;
  font-size: 1.13em;
  font-family: inherit;
  font-weight: 400;
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
  position: absolute !important;
  margin: -40px auto 0 auto !important;
  left: 50%;
  right: 10;
  bottom: auto;
  top: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
  background: transparent;
  box-shadow: none;
  padding: 0;
  transform: translate(-50%, -50%);
  width: 100%;
}

.chat-textarea {
  flex: 1;
  background: transparent;
  border: none;
  color: #7a6a2f;
  font-size: 1.13em;
  outline: none;
  padding: 0;
  font-family: inherit;
  resize: none;
  min-height: 44px;
  max-height: 180px;
  line-height: 2.5;
  overflow-y: auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>