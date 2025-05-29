<template>
  <div class="chat-container">
    <div class="chat-history" ref="chatHistory">
      <div
        v-for="(msg, index) in historico"
        :key="index"
        :class="['chat-message', msg.role]"
      >
        <p class="chat-author">{{ msg.role === 'user' ? 'Você' : 'Assistente' }}</p>
        <div class="chat-bubble">
          <template v-if="msg.role === 'assistant' && loading && index === historico.length - 1">
            <div style="display: flex; align-items: center; justify-content: center;">
              <span class="spinner-inline"></span>
              <span class="loading-text-inline">Aguarde...</span>
            </div>
          </template>
          <template v-else>
            {{ msg.content }}
          </template>
        </div>
      </div>
    </div>
    <div class="input-container">
      <div class="input-inner">
        <input v-model="pergunta" placeholder="Digite sua pergunta" @keyup.enter="enviarPergunta" />
        <button @click="enviarPergunta">Enviar</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue'

const pergunta = ref('')
const resposta = ref('')
const historico = ref([])
const chatHistory = ref(null)
const loading = ref(false)

const enviarPergunta = async () => {
  if (!pergunta.value.trim()) return
  historico.value.push({ role: 'user', content: pergunta.value })
  const perguntaAtual = pergunta.value
  pergunta.value = '' // Limpa o input imediatamente
  loading.value = true
  // Adiciona placeholder de resposta do assistente
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
  // Atualiza a última resposta do assistente
  historico.value[historico.value.length - 1].content = data.resposta
  loading.value = false

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
  background: #fffbe6;
  color: #7a6a2f;
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
  padding: 14px 20px;
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

/* Estilos para o indicador de carregamento inline */
.loading-indicator-inline {
  display: flex;
  align-items: center;
  margin-left: 8px;
}

.spinner-inline {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top-color: #e6c200;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.loading-text-inline {
  color: #7a6a2f;
  font-size: 1em;
  margin-left: 6px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>